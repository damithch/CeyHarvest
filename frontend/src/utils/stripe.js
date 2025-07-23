import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
// This will be fetched from the backend during payment intent creation
let stripePromise = null;

export const getStripe = (publishableKey) => {
  // Handle mock mode - don't initialize Stripe with mock keys
  if (publishableKey === 'pk_test_mock_key_for_development' || 
      publishableKey?.includes('PASTE_YOUR_ACTUAL')) {
    console.log('Mock Stripe mode - returning null stripe instance');
    return null;
  }

  if (!stripePromise || stripePromise.publishableKey !== publishableKey) {
    stripePromise = loadStripe(publishableKey);
    stripePromise.publishableKey = publishableKey;
  }
  return stripePromise;
};

export default getStripe;
