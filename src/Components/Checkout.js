import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import getStripe from './getStripe';
import { useCombined } from './CollegeContext';
import config from '../config';
import './Checkout.css'; // Import the CSS for custom styles
import{ useState } from 'react';


const tiers = [
  {
    title: 'Free',
    price: '$0/month',
    features: ['See 5 Schools', 'Ask 10 Questions a Week'],
    priceId: config.NEXT_PUBLIC_STRIPE_PRICE_ID_FREE,
  },
  {
    title: 'Standard',
    price: '$6.99/month',
    features: ['See 15 Schools', 'Ask 20 Questions a Week', 'See School Specific Scholarships'],
    priceId: config.NEXT_PUBLIC_STRIPE_PRICE_ID_STANDARD,
  },
  {
    title: 'Premium',
    price: '$14.99/month',
    features: ['See 30 Schools', 'Ask 50 Questions a Week', 'See School Specific Scholarships', 'Export Spreadsheet'],
    priceId: config.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM,
  },
];

const Checkout = () => {
  const { user } = useCombined();
  const [isLoading, setIsLoading] = useState(false);


  async function handleCheckout(priceId, accessLevel) {
    setIsLoading(true);
    
    try {
      const response = await fetch('https://us-central1-ai-d-ce511.cloudfunctions.net/api/create-stripe-customer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uid: user.uid, email: user.email, priceId, accessLevel }),
      });

      const { url } = await response.json();

      // Redirect the user to the Stripe-hosted checkout page
      window.location.href = url;
    } catch (error) {
      console.error('Error during checkout:', error);
    }finally {
      setIsLoading(false);
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
            {/* Only show the button for Standard and Premium tiers */}
            {tier.title !== 'Free' && (
              <CardFooter className="mt-auto">
                <Button
                  className={`w-full ${tier.title.toLowerCase()}-button`}
                  onClick={() => handleCheckout(tier.priceId, tier.title)}
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : `Select ${tier.title}`}
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
