import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
// This will be fetched from the backend during payment intent creation
let stripePromise = null;

export const getStripe = (publishableKey) => {
  if (!stripePromise || stripePromise.publishableKey !== publishableKey) {
    stripePromise = loadStripe(publishableKey);
    stripePromise.publishableKey = publishableKey;
  }
  return stripePromise;
};

export default getStripe;
