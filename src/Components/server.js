const express = require('express');
const stripe = require('stripe')('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'); // Replace with your actual Stripe secret key
const admin = require('firebase-admin');
const serviceAccount = require('/Users/arjungovind/Desktop/ai-D/ai-d-ce511-firebase-adminsdk-nl1bl-a414a7a9c6.json'); // Ensure the path to your service account key is correct

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ai-d-ce511.firebaseio.com" // Replace withactual database URL
});

const db = admin.firestore();
const app = express();

app.use(express.json());

// Create or retrieve a Stripe customer
app.post('/api/create-stripe-customer', async (req, res) => {
  const { uid, email, priceId, accessLevel } = req.body;
  console.log('Received request at /api/create-stripe-customer');
  

  try {
    const userDoc = await db.collection('userData').doc(uid).get();
    let stripeCustomerId;

    if (userDoc.exists && userDoc.data().stripeCustomerId) {
      stripeCustomerId = userDoc.data().stripeCustomerId;
    } else {
      // Create a new Stripe customer
      const customer = await stripe.customers.create({ email });
      console.log("accessLevel Right before update: " , accessLevel)
      await db.collection('userData').doc(uid).set({ stripeCustomerId: customer.id, access: accessLevel }, { merge: true });
      stripeCustomerId = customer.id;
    }

    // Create a Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
    
      mode: 'subscription',
      success_url: `https://pocketly.ai/success?accessLevel=${accessLevel}&tier=${priceId}`,
      cancel_url: 'https://pocketly.ai/upgrade',
    });

    res.json({ url: session.url, stripeCustomerId });
  } catch (error) {
    console.error('Error creating Stripe customer or subscription:', error);
    res.status(500).send({ error: error.message });
  }
});
// Update user's subscription access level in Firestore
app.post('/api/update-user-subscription', async (req, res) => {
  console.log('HERE9')
  
  const { uid, accessLevel } = req.body;
  console.log('accessLvel', accessLevel)

  try {
    // Update the access level in Firestore
    await db.collection('userData').doc(uid).set(
     { access: accessLevel },
      { merge: true }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating user subscription:', error);
    res.status(500).send({ error: error.message });
  }
});

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

    console.log('Creating Stripe billing session for customer:', customerId);

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: 'https://pocketly.ai/ProfileScreen',
    });

    console.log('Billing session created successfully:', session);
    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating Stripe billing session:', error.message);
    console.error('Error details:', error);
    res.status(500).send({ error: error.message });
  }
});


app.listen(5000, () => console.log('Server running on port 5000'));

