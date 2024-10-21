const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const express = require("express");
const admin = require("firebase-admin");
const config = require("./config2.json");
const cors = require("cors")({origin: true});


// Accessing the keys
// const stripePublishableKey = config.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
// const openAiApiKey = config.OPENAI_API_KEY;


// const functions = require("firebase-functions");
const stripe = require("stripe")(config.STRIPE_SECRET);

admin.initializeApp(); // No need to specify credentials for production

const db = admin.firestore();
const app = express();

// Middleware
app.use(express.json());
app.use(cors);

// API to create or retrieve a Stripe customer
app.post("/create-stripe-customer", async (req, res) => {
  const {uid, email, priceId, accessLevel} = req.body;


  try {
    console.log("Attempting to fetch Firestore user document for UID:", uid);
    const userDoc = await db.collection("userData").doc(uid).get();

    let stripeCustomerId;

    if (userDoc.exists && userDoc.data().stripeCustomerId) {
      stripeCustomerId = userDoc.data().stripeCustomerId;
      console.log("Stripe customer already exists:", stripeCustomerId);
    } else {
      console.log("Creating new Stripe customer with email:", email);
      const customer = await stripe.customers.create({email});
      console.log("Created new Stripe customer:", customer.id);

      console.log("Updating Firestore with new customer ID.");
      await db.collection("userData").doc(uid).set(
          {stripeCustomerId: customer.id, access: accessLevel},
          {merge: true},
      );
      stripeCustomerId = customer.id;
    }

    console.log("Creating Stripe session for customer:", stripeCustomerId);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer: stripeCustomerId,
      line_items: [{price: priceId, quantity: 1}],
      mode: "subscription",
      success_url: `https://pocketly.ai/success?accessLevel=${accessLevel}&tier=${priceId}`,
      cancel_url: "https://pocketly.ai/cancel",
    });

    console.log("Stripe session created:", session.url);
    res.json({url: session.url, stripeCustomerId});
  } catch (error) {
    console.error("Error creating Stripe customer or session:", error.message);
    res.status(500).send({error: error.message});
  }
});


// API to update user's subscription access level
app.post("/update-user-subscription", async (req, res) => {
  console.log("Made it inside call");
  const {uid, accessLevel} = req.body;
  logger.info("Updating user subscription access level:", accessLevel);

  try {
    await db.collection("userData").doc(uid)
        .set({access: accessLevel}, {merge: true});
    res.json({success: true});
  } catch (error) {
    logger.error("Error updating user subscription:", error);
    res.status(500).send({error: error.message});
  }
});

// API to create a Stripe billing session
app.post("/create-billing-session", async (req, res) => {
  const {uid} = req.body;

  try {
    const userDoc = await db.collection("userData").doc(uid).get();
    if (!userDoc.exists) {
      throw new Error("User document does not exist");
    }

    const userData = userDoc.data();
    const customerId = userData.stripeCustomerId;

    if (!customerId) {
      throw new Error("No Stripe customer ID found for user");
    }

    logger.info("Creating billing session for customer:", customerId);

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: "https://pocketly.ai/ProfileScreen",
    });

    res.json({url: session.url});
  } catch (error) {
    logger.error("Error creating Stripe billing session:", error.message);
    res.status(500).send({error: error.message});
  }
});

// Ensure the app listens on the correct port provided by Firebase


// Export the Express app as a Firebase Function
exports.api = onRequest(app);


const endpointSecret = require("./config2.json").STRIPE_WEBHOOK;

exports.stripeWebhook = onRequest((req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.error("⚠️  Webhook signature verification failed.", err.message);
    return res.sendStatus(400);
  }

  // Handle the event
  switch (event.type) {
    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const uid = subscription.metadata.uid; // assuming UID is in metadata
      admin.firestore().collection("userData").doc(uid).update({
        access: "Free",
      });
      console.log(`Subscription canceled for UID: ${uid}`);
      break;
    }
    case "customer.subscription.updated": {
      const updatedSubscription = event.data.object;
      if (updatedSubscription.status === "active") {
        console.log("Subscription is active.");
      } else if (updatedSubscription.status === "canceled") {
        console.log("Subscription is canceled.");
      }
      break;
    }
    default: {
      console.log(`Unhandled event type ${event.type}`);
      break;
    }
  }
  res.json({received: true});
});
