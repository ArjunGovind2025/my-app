const admin = require("./firebaseAdmin"); // Import Firebase Admin setup
const config = require("./config2.json");

const stripe = require("stripe")(config.STRIPE_SECRET);
const db = admin.firestore();

const endpointSecret = "whsec_98z9UlsJxNItcTMV7T6xgeWtOhDsGGu3"; // HIDE

const stripeWebhookHandler = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;

        console.log("Handling checkout.session.completed:", session);

        // Extract necessary data from the session
        const customerId = session.customer;
        const subscriptionId = session.subscription;
        const uid = session.metadata.uid; // Ensure UID is sent in metadata

        if (!uid) {
          console.error("Missing UID in session metadata");
          break;
        }

        // Map priceId to accessLevel
        const accessLevelMap = {
          "price_1QCDebHcQJIFzfCVe69qofaS": "Premium", // Premium Price ID
          "price_1QCDcxHcQJIFzfCVXwthf6aD": "Standard", // Standard Price ID
        };

        // Fetch line items to get the priceId
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        const priceId = lineItems.data[0]?.price?.id;

        if (!priceId) {
          console.error("Price ID not found in line items");
          break;
        }

        const accessLevel = accessLevelMap[priceId];

        if (!accessLevel) {
          console.error("Access level could not be determined from priceId:", priceId);
          break;
        }

        console.log(`Access level determined: ${accessLevel}`);

        // Update Firestore with customer and subscription info
        console.log(`Updating Firestore for UID: ${uid}`);
        await db.collection("userData").doc(uid).set(
            {
              stripeCustomerId: customerId,
              subscriptionId: subscriptionId,
              access: accessLevel,
            },
            {merge: true},
        );

        console.log(`Firestore updated successfully for UID: ${uid}`);
        break;
      }
      case "customer.subscription.deleted":
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        console.log(`Handling subscription update/cancel for customer: ${customerId}`);

        // Fetch user by Stripe customer ID
        const userSnapshot = await db
            .collection("userData")
            .where("stripeCustomerId", "==", customerId)
            .get();

        if (!userSnapshot.empty) {
          const userDoc = userSnapshot.docs[0];
          const uid = userDoc.id;

          // Prepare Firestore update data
          const updateData = {};

          // Update access level only if subscription is canceled
          if (subscription.status === "canceled") {
            updateData.access = "Free";
          }

          // Always reduce visibleColleges to a maximum of 5
          const userData = userDoc.data();
          const visibleColleges = userData.visibleColleges || [];
          updateData.visibleColleges = visibleColleges.slice(0, 5);

          // Update Firestore in one call
          if (Object.keys(updateData).length > 0) {
            await db.collection("userData").doc(uid).set(updateData, {merge: true});
            console.log(`User ${uid} updated with data:`, updateData);
          } else {
            console.log(`No updates needed for user ${uid}.`);
          }
        } else {
          console.log(`No user found for customer ID: ${customerId}`);
        }

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({received: true});
  } catch (error) {
    console.error("Error handling webhook event:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = stripeWebhookHandler;
