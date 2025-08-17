import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Elements } from '@stripe/react-stripe-js';
import { getStripe } from '../../utils/stripe';
import PaymentForm from '../payment/PaymentForm';
import DashboardLayout from '../layout/DashboardLayout';
import { ROUTES } from '../../constants/routes';

const Checkout = () => {
  const [cartItems, setCartItems]         = useState([]);
  const [loading, setLoading]             = useState(true);
  const [processing, setProcessing]       = useState(false);
  const [error, setError]                 = useState('');
  const [success, setSuccess]             = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [stripePromise, setStripePromise] = useState(null);
  const [currentStep, setCurrentStep]     = useState(1); // 1: Details, 2: Payment
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '', address: '', city: '', postalCode: '', phoneNumber: ''
  });

  const { token, user } = useAuth();
  const navigate        = useNavigate();

  useEffect(() => {
    fetchCartItems();
    if (user) {
      setShippingAddress(prev => ({
        ...prev,
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        phoneNumber: user.phoneNumber || ''
      }));
    }
  }, [user]);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/buyer/cart', {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error('Failed to load cart items');
      const data = await res.json();
      setCartItems(data.items || []);
      if (!data.items?.length) navigate(ROUTES.BUYER.CART);
    } catch (e) {
      setError('Error loading cart: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = () =>
    cartItems.reduce((sum, item) => sum + item.productPrice * item.quantity, 0);

  const calculateShipping = () => (calculateSubtotal() > 5000 ? 0 : 200);

  const calculateTotal = () => calculateSubtotal() + calculateShipping();

  const handleInputChange = e => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const { fullName, address, city, postalCode, phoneNumber } = shippingAddress;
    if (!fullName.trim())      { setError('Full name is required');    return false; }
    if (!address.trim())       { setError('Address is required');      return false; }
    if (!city.trim())          { setError('City is required');         return false; }
    if (!postalCode.trim())    { setError('Postal code is required');  return false; }
    if (!phoneNumber.trim())   { setError('Phone number is required'); return false; }
    return true;
  };

  const processOrder = async () => {
    if (!validateForm()) return;
    setProcessing(true);
    setError('');
    try {
      // 1) create order
      const orderRes = await fetch('/api/buyer/checkout/create-order', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliveryAddress:    shippingAddress.address,
          deliveryCity:       shippingAddress.city,
          deliveryPostalCode: shippingAddress.postalCode,
          contactPhone:       shippingAddress.phoneNumber,
          instructions:       ''
        })
      });
      if (!orderRes.ok) {
        const err = await orderRes.json();
        throw new Error(err.message || 'Failed to create order');
      }
      const { orderId } = await orderRes.json();

      // 2) create payment intent
      const payRes = await fetch('/api/buyer/checkout/create-payment-intent', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, paymentMethod })
      });
      if (!payRes.ok) {
        const err = await payRes.json();
        throw new Error(err.message || 'Failed to create payment intent');
      }
      const payData = await payRes.json();

      setStripePromise(getStripe(payData.publishableKey));
      setPaymentIntent({ ...payData.paymentIntent, orderId });

      if (paymentMethod === 'card') {
        setCurrentStep(2);
      } else {
        await completeOrder(orderId, null);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setProcessing(false);
    }
  };

  const completeOrder = async (orderId, paymentIntentId) => {
    try {
      const confirmRes = await fetch('/api/buyer/checkout/confirm-payment', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId: paymentIntentId || 'cod_payment',
          orderId
        })
      });
      if (!confirmRes.ok) {
        const err = await confirmRes.json();
        throw new Error(err.message || 'Payment confirmation failed');
      }
      setSuccess(`Order placed successfully! Order ID: ${orderId}`);
      setTimeout(() => navigate(ROUTES.BUYER.ORDERS), 3000);
    } catch (e) {
      setError(e.message);
    }
  };

  const handlePaymentSuccess = async confirmedPI => {
    setProcessing(true);
    try {
      await completeOrder(paymentIntent.orderId, confirmedPI.id);
    } catch (e) {
      setError(e.message);
    } finally {
      setProcessing(false);
    }
  };

  const handlePaymentError = err => setError(`Payment failed: ${err.message}`);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (success) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-2">Order Placed Successfully!</h2>
            <p className="mb-4">{success}</p>
            <p className="text-sm">You will be redirected to your orders page...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>

        {/* === STEP 1: Order Details === */}
        {currentStep === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-4 mb-6">
                {cartItems.map(item => (
                  <div key={item.productId} className="flex items-center space-x-4">
                    <div className="flex-shrink-0 h-12 w-12">
                      {item.imageBase64 ? (
                        <img
                          className="h-12 w-12 rounded object-cover"
                          src={`data:image/jpeg;base64,${item.imageBase64}`}
                          alt={item.productName}
                        />
                      ) : (
                        <div className="h-12 w-12 rounded bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{item.productName}</div>
                      <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                    </div>
                    <div className="text-sm font-medium">
                      LKR {(item.productPrice * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>LKR {calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>
                    {calculateShipping() === 0
                      ? 'Free'
                      : `LKR ${calculateShipping().toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t pt-2">
                  <span>Total</span>
                  <span>LKR {calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Shipping & Payment Method Form */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={shippingAddress.fullName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={shippingAddress.address}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={shippingAddress.city}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={shippingAddress.postalCode}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={shippingAddress.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={e => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <span>Credit/Debit Card (Stripe)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={e => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <span>Cash on Delivery</span>
                  </label>
                </div>
                {paymentMethod === 'card' && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800">
                      <strong>Secure Payment:</strong> Your payment will be processed securely using Stripe.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => navigate(ROUTES.BUYER.CART)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Back to Cart
                </button>
                <button
                  onClick={processOrder}
                  disabled={processing}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {processing ? 'Processing…' : 'Continue to Payment'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* === STEP 2: Payment === */}
        {currentStep === 2 && paymentIntent && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Complete Payment</h2>
              <div className="mb-4 p-4 bg-gray-50 rounded-md">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Amount:</span>
                  <span>LKR {calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              {stripePromise ? (
                <Elements stripe={stripePromise}>
                  <PaymentForm
                    paymentIntent={paymentIntent}
                    totalLkr={calculateTotal()}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                  />
                </Elements>
              ) : (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md mb-4">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                    Mock Payment Mode
                  </h3>
                  <p className="text-yellow-700 mb-4">
                    Stripe is not configured. This is a mock payment for demonstration purposes.
                  </p>
                  <button
                    onClick={() =>
                      completeOrder(paymentIntent.orderId, paymentIntent.paymentIntentId)
                    }
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Complete Mock Payment
                  </button>
                </div>
              )}

              <button
                onClick={() => setCurrentStep(1)}
                className="mt-4 w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Back to Order Details
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Checkout;
