// This test secret API key is a placeholder. Don't include personal details in requests with this key.
// To see your test secret API key embedded in code samples, sign in to your Stripe account.
// You can also find your test secret API key at https://dashboard.stripe.com/test/apikeys.

const stripe = require('stripe')('sk_test_51PemTHHcQJIFzfCVAxEgDiV2cPoBbNQA30ZwNPsjK6mNqyXEbNE1cxWiI4CqoIejBX08plpdGuAhYYRYUfaXx9f10030NHGHSk');
const express = require('express');
const app = express();
app.use(express.static('public'));

const YOUR_DOMAIN = 'http://localhost:4242';

app.post('/create-checkout-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
        price: '{{price_1PepeBHcQJIFzfCVOOGIk67B}}',
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${YOUR_DOMAIN}?success=true`,
    cancel_url: `${YOUR_DOMAIN}?canceled=true`,
  });

  res.redirect(303, session.url);
});

// Webhook endpoint for Stripe
app.post('/webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
  
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, 'your_webhook_secret'); // Replace with your actual webhook secret
    } catch (err) {
      console.error('Webhook signature verification failed.', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  
    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const uid = new URL(session.success_url).searchParams.get('uid'); // Extract the uid from the success URL
  
      // Find the user by uid and update their isPremium field
      const userRef = doc(collection(db, 'userData'), uid);
      const userDoc = await getDoc(userRef);
  
      if (userDoc.exists()) {
        await updateDoc(userRef, { isPremium: true });
      } else {
        console.error(`User with uid ${uid} not found`);
      }
    }
  
    res.status(200).send('Success');
  });
  
  // Start the server
  app.listen(4242, () => console.log('Running on port 4242'));