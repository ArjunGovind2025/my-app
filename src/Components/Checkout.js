import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import getStripe from './server';
import config from '../config';
import { updateAccessField } from './Access';

const tiers = [
  {
    title: 'Free',
    price: '$0/month',
    features: ['See 5 Schools', 'Ask 10 Questions a Week '],
    priceId: config.NEXT_PUBLIC_STRIPE_PRICE_ID_FREE, // Adjust accordingly
  },
  {
    title: 'Standard',
    price: '$6.99/month',
    features: ['See 15 Schools', 'Ask 20 Questions a Week ', 'See School Specific Scholarships'],
    priceId: config.NEXT_PUBLIC_STRIPE_PRICE_ID_STANDARD, // Adjust accordingly
  },
  {
    title: 'Premium',
    price: '$14.99/month',
    features: ['Unlimited Schools', 'Unlimited Questions','See School Specific Scholarships', 'Export Spreadsheet'],
    priceId: config.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM, // Adjust accordingly
  },
];

const Checkout = () => {
  async function handleCheckout(priceId, tierTitle) {
    const stripe = await getStripe();
    const { error } = await stripe.redirectToCheckout({
      lineItems: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      successUrl: `https://ai-d-ce511.web.app/success?tier=${tierTitle}`, // Pass the tier title in the success URL
      cancelUrl: `http://localhost:3000/cancel`,
      customerEmail: 'customer@email.com',
    });
    if (error) {
      console.warn(error.message);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-8">Choose Your Plan</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier) => (
          <Card key={tier.title} className="w-full max-w-sm mx-auto flex flex-col justify-between">
            <div>
              <CardHeader>
                <CardTitle className="text-xl font-bold">{tier.title}</CardTitle>
                <p className="text-2xl font-semibold">{tier.price}</p>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2">
                  {tier.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </CardContent>
            </div>
            {tier.title !== 'Free' && (
              <CardFooter className="mt-auto">
                <Button className="w-full" onClick={() => handleCheckout(tier.priceId, tier.title)}>
                  Select {tier.title}
                </Button>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Checkout;
