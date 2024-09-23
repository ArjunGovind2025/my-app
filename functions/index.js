const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const express = require('express');
const functions = require('firebase-functions');
const stripe = require('stripe')(functions.config().stripe.secret);
const admin = require('firebase-admin');

admin.initializeApp(); // No need to specify credentials for production




// Initialize Firebase Admin with service account credentials
//const serviceAccount = require('/Users/arjungovind/Desktop/ai-D/ai-d-ce511-firebase-adminsdk-nl1bl-a414a7a9c6.json'); // Ensure the path to your service account key is correct
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ai-d-ce511.firebaseio.com", // Replace with your actual database URL
});

const db = admin.firestore();
const app = express();

// Middleware
app.use(express.json());

// API to create or retrieve a Stripe customer
app.post('/api/create-stripe-customer', async (req, res) => {
  const { uid, email, priceId, accessLevel } = req.body;
  logger.info('Received request at /api/create-stripe-customer');

  try {
    const userDoc = await db.collection('userData').doc(uid).get();
    let stripeCustomerId;

    if (userDoc.exists && userDoc.data().stripeCustomerId) {
      stripeCustomerId = userDoc.data().stripeCustomerId;
    } else {
      const customer = await stripe.customers.create({ email });
      logger.info("Creating new customer with access level: ", accessLevel);
      await db.collection('userData').doc(uid).set({ stripeCustomerId: customer.id, access: accessLevel }, { merge: true });
      stripeCustomerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer: stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `http://localhost:3000/success?accessLevel=${accessLevel}&tier=${priceId}`,
      cancel_url: 'http://localhost:3000/cancel',
    });

    res.json({ url: session.url, stripeCustomerId });
  } catch (error) {
    logger.error('Error creating Stripe customer or subscription:', error);
    res.status(500).send({ error: error.message });
  }
});

// API to update user's subscription access level
app.post('/api/update-user-subscription', async (req, res) => {
  const { uid, accessLevel } = req.body;
  logger.info('Updating user subscription access level:', accessLevel);

  try {
    await db.collection('userData').doc(uid).set({ access: accessLevel }, { merge: true });
    res.json({ success: true });
  } catch (error) {
    logger.error('Error updating user subscription:', error);
    res.status(500).send({ error: error.message });
  }
});

// API to create a Stripe billing session
app.post('/api/create-billing-session', async (req, res) => {
  const { uid } = req.body;

  try {
    const userDoc = await db.collection('userData').doc(uid).get();
    if (!userDoc.exists) {
      throw new Error('User document does not exist');
    }

    const userData = userDoc.data();
    const customerId = userData.stripeCustomerId;

    if (!customerId) {
      throw new Error('No Stripe customer ID found for user');
    }

    logger.info('Creating billing session for customer:', customerId);

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: 'http://localhost:3000/ProfileScreen',
    });

    res.json({ url: session.url });
  } catch (error) {
    logger.error('Error creating Stripe billing session:', error.message);
    res.status(500).send({ error: error.message });
  }
});

// Export the Express app as a Firebase Function
exports.api = onRequest(app);
