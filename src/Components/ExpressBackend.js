const express = require('express');
const stripe = require('stripe')('sk_test_51PemTHHcQJIFzfCVAxEgDiV2cPoBbNQA30ZwNPsjK6mNqyXEbNE1cxWiI4CqoIejBX08plpdGuAhYYRYUfaXx9f10030NHGHSk');
const { getFirestore } = require('firebase-admin/firestore');
const admin = require('firebase-admin');

const serviceAccount = require('/Users/arjungovind/Desktop/ai-D/ai-d-ce511-firebase-adminsdk-nl1bl-a414a7a9c6.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = getFirestore();

const app = express();

app.post('/api/create-billing-session', async (req, res) => {
  const { customerId } = req.body;

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: 'https://pocketly.ai/ProfileScreen',
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.listen(3001, () => console.log('Server running on port 3000'));
