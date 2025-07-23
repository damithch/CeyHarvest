# Phase 4: Frontend Integration - Checkout UI Components

## 🎯 Overview
Build React/Vue.js checkout UI components that integrate with the Phase 3 payment backend.

## 📋 Implementation Plan

### 1. **Checkout Flow Components**

#### **A. Cart Review Component**
```jsx
// components/checkout/CartReview.jsx
import React from 'react';

const CartReview = ({ cartItems, totalAmount, onProceedToCheckout }) => {
  return (
    <div className="cart-review">
      <h2>Review Your Cart</h2>
      <div className="cart-items">
        {cartItems.map(item => (
          <div key={item.id} className="cart-item">
            <img src={item.image} alt={item.productName} />
            <div className="item-details">
              <h3>{item.productName}</h3>
              <p>Quantity: {item.quantity}</p>
              <p>Price: LKR {item.productPrice}</p>
              <p>Total: LKR {item.totalAmount}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="cart-total">
        <h3>Total: LKR {totalAmount}</h3>
        <button onClick={onProceedToCheckout}>Proceed to Checkout</button>
      </div>
    </div>
  );
};
```

#### **B. Delivery Information Component**
```jsx
// components/checkout/DeliveryForm.jsx
import React, { useState } from 'react';

const DeliveryForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    deliveryAddress: '',
    deliveryCity: '',
    deliveryPostalCode: '',
    contactPhone: '',
    instructions: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="delivery-form">
      <h2>Delivery Information</h2>
      <div className="form-group">
        <label>Delivery Address *</label>
        <input
          type="text"
          value={formData.deliveryAddress}
          onChange={(e) => setFormData({...formData, deliveryAddress: e.target.value})}
          required
        />
      </div>
      <div className="form-group">
        <label>City *</label>
        <input
          type="text"
          value={formData.deliveryCity}
          onChange={(e) => setFormData({...formData, deliveryCity: e.target.value})}
          required
        />
      </div>
      <div className="form-group">
        <label>Postal Code *</label>
        <input
          type="text"
          value={formData.deliveryPostalCode}
          onChange={(e) => setFormData({...formData, deliveryPostalCode: e.target.value})}
          required
        />
      </div>
      <div className="form-group">
        <label>Contact Phone *</label>
        <input
          type="tel"
          value={formData.contactPhone}
          onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
          required
        />
      </div>
      <div className="form-group">
        <label>Special Instructions</label>
        <textarea
          value={formData.instructions}
          onChange={(e) => setFormData({...formData, instructions: e.target.value})}
        />
      </div>
      <button type="submit">Create Order</button>
    </form>
  );
};
```

#### **C. Payment Component**
```jsx
// components/checkout/PaymentForm.jsx
import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const PaymentForm = ({ orderId, clientSecret, onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      }
    });

    if (result.error) {
      console.error(result.error);
    } else {
      onPaymentSuccess(result.paymentIntent);
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <h2>Payment Information</h2>
      <div className="card-element">
        <CardElement />
      </div>
      <button type="submit" disabled={!stripe || loading}>
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
};

const WrappedPaymentForm = (props) => (
  <Elements stripe={stripePromise}>
    <PaymentForm {...props} />
  </Elements>
);
```

#### **D. Main Checkout Container**
```jsx
// pages/Checkout.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CartReview from '../components/checkout/CartReview';
import DeliveryForm from '../components/checkout/DeliveryForm';
import PaymentForm from '../components/checkout/PaymentForm';
import { checkoutAPI } from '../services/api';

const Checkout = () => {
  const [step, setStep] = useState(1);
  const [cartData, setCartData] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [paymentIntent, setPaymentIntent] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Load cart data
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const response = await checkoutAPI.getCart();
      setCartData(response.data);
    } catch (error) {
      console.error('Failed to load cart:', error);
    }
  };

  const handleCreateOrder = async (deliveryInfo) => {
    try {
      const response = await checkoutAPI.createOrder(deliveryInfo);
      setOrderData(response.data.order);
      
      // Create payment intent
      const paymentResponse = await checkoutAPI.createPaymentIntent({
        orderId: response.data.order.id,
        paymentMethod: 'CARD'
      });
      setPaymentIntent(paymentResponse.data.paymentIntent);
      
      setStep(3);
    } catch (error) {
      console.error('Failed to create order:', error);
    }
  };

  const handlePaymentSuccess = async (paymentIntentResult) => {
    try {
      await checkoutAPI.confirmPayment({
        paymentIntentId: paymentIntentResult.id,
        orderId: orderData.id
      });
      
      navigate('/order-success', { state: { orderId: orderData.id } });
    } catch (error) {
      console.error('Failed to confirm payment:', error);
    }
  };

  return (
    <div className="checkout-container">
      <div className="checkout-steps">
        <div className={`step ${step >= 1 ? 'active' : ''}`}>1. Review Cart</div>
        <div className={`step ${step >= 2 ? 'active' : ''}`}>2. Delivery Info</div>
        <div className={`step ${step >= 3 ? 'active' : ''}`}>3. Payment</div>
      </div>

      {step === 1 && cartData && (
        <CartReview
          cartItems={cartData.cartItems}
          totalAmount={cartData.cart.totalAmount}
          onProceedToCheckout={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <DeliveryForm onSubmit={handleCreateOrder} />
      )}

      {step === 3 && paymentIntent && (
        <PaymentForm
          orderId={orderData.id}
          clientSecret={paymentIntent.client_secret}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};
```

### 2. **API Integration Service**
```javascript
// services/checkoutAPI.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const checkoutAPI = {
  getCart: () => api.get('/api/buyer/cart'),
  createOrder: (data) => api.post('/api/buyer/checkout/create-order', data),
  createPaymentIntent: (data) => api.post('/api/buyer/checkout/create-payment-intent', data),
  confirmPayment: (data) => api.post('/api/buyer/checkout/confirm-payment', data),
  getOrders: () => api.get('/api/buyer/checkout/orders'),
  getOrder: (id) => api.get(`/api/buyer/checkout/order/${id}`),
  cancelOrder: (id) => api.post(`/api/buyer/checkout/cancel-order/${id}`)
};
```

### 3. **Styling (CSS/SCSS)**
```scss
// styles/checkout.scss
.checkout-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;

  .checkout-steps {
    display: flex;
    justify-content: space-between;
    margin-bottom: 30px;
    
    .step {
      padding: 10px 20px;
      background: #f5f5f5;
      border-radius: 5px;
      
      &.active {
        background: #007bff;
        color: white;
      }
    }
  }

  .cart-review {
    .cart-item {
      display: flex;
      align-items: center;
      padding: 15px;
      border: 1px solid #ddd;
      margin-bottom: 10px;
      border-radius: 5px;
      
      img {
        width: 80px;
        height: 80px;
        object-fit: cover;
        margin-right: 15px;
      }
    }
    
    .cart-total {
      text-align: right;
      margin-top: 20px;
      
      button {
        background: #28a745;
        color: white;
        padding: 12px 30px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
      }
    }
  }

  .delivery-form {
    .form-group {
      margin-bottom: 20px;
      
      label {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
      }
      
      input, textarea {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 5px;
      }
    }
  }

  .payment-form {
    .card-element {
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    
    button {
      background: #007bff;
      color: white;
      padding: 12px 30px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      
      &:disabled {
        background: #ccc;
        cursor: not-allowed;
      }
    }
  }
}
```

## 📦 Required Dependencies
```json
{
  "dependencies": {
    "@stripe/stripe-js": "^1.54.0",
    "@stripe/react-stripe-js": "^1.16.5",
    "axios": "^1.4.0",
    "react-router-dom": "^6.14.0"
  }
}
```

## 🔧 Environment Variables
```env
REACT_APP_API_BASE_URL=http://localhost:8080
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
```

## ✅ Implementation Checklist
- [ ] Install required dependencies
- [ ] Set up environment variables
- [ ] Create checkout components
- [ ] Implement API service layer
- [ ] Add routing for checkout flow
- [ ] Style components
- [ ] Test payment flow
- [ ] Add error handling
- [ ] Implement loading states
- [ ] Add form validation
