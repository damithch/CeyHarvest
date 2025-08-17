import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

const PaymentForm = ({
  paymentIntent,
  totalLkr,
  onPaymentSuccess,
  onPaymentError
}) => {
  const stripe   = useStripe();
  const elements = useElements();

  const [cardError, setCardError]       = useState('');
  const [cardComplete, setCardComplete] = useState(false);
  const [processing, setProcessing]     = useState(false);

  const handleCardChange = e => {
    setCardError('');
    if (e.error) setCardError(e.error.message);
    setCardComplete(e.complete);
  };

  const handleSubmit = async ev => {
    ev.preventDefault();
    if (!stripe || !elements || !cardComplete) {
      if (!cardComplete) setCardError('Please enter your full card details.');
      return;
    }

    setProcessing(true);
    setCardError('');

    try {
      const cardElement  = elements.getElement(CardElement);
      const clientSecret = paymentIntent.clientSecret;

      const { error: confirmError, paymentIntent: pi } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: { card: cardElement }
        });

      if (confirmError) {
        setCardError(confirmError.message);
        onPaymentError?.(confirmError);
      } else {
        onPaymentSuccess?.(pi);
      }
    } catch (err) {
      setCardError('An unexpected error occurred.');
      onPaymentError?.(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border border-gray-300 rounded-md">
        <CardElement
          options={{ style: { base: { fontSize: '16px' } } }}
          onChange={handleCardChange}
        />
      </div>

      {cardError && (
        <div className="text-red-600 text-sm">{cardError}</div>
      )}

      <button
        type="submit"
        disabled={!stripe || !cardComplete || processing}
        className="w-full px-6 py-3 bg-green-600 text-white rounded-lg disabled:opacity-50"
      >
        {processing
          ? 'Processing…'
          : `Pay LKR ${totalLkr.toFixed(2)}`}
      </button>
    </form>
  );
};

export default PaymentForm;
