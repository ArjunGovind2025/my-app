import { loadStripe } from '@stripe/stripe-js';
import config from '../config.json';


let stripePromise;
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(config.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

export default getStripe;