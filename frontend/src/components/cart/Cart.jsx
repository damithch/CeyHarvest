import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../layout/DashboardLayout';
import { ROUTES } from '../../constants/routes';
import { useCart } from '../../hooks/useCart';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const { token } = useAuth();
  const navigate = useNavigate();
  const { 
    getCartItems, 
    updateCartItem, 
    removeFromCart, 
    clearCart, 
    loading, 
    error 
  } = useCart();

  // Load cart items on component mount
  useEffect(() => {
    if (token) {
      loadCartItems();
    }
  }, [token]);

  const loadCartItems = async () => {
    const items = await getCartItems();
    setCartItems(items);
  };



  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveFromCart(productId);
      return;
    }

    const success = await updateCartItem(productId, newQuantity);
    if (success) {
      loadCartItems(); // Refresh cart
    }
  };

  const handleRemoveFromCart = async (productId) => {
    const success = await removeFromCart(productId);
    if (success) {
      loadCartItems(); // Refresh cart
    }
  };

  const handleClearCart = async () => {
    const success = await clearCart();
    if (success) {
      setCartItems([]);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.totalAmount || 0);
    }, 0).toFixed(2);
  };

  const proceedToCheckout = () => {
    if (cartItems.length === 0) {
      setError('Cart is empty');
      return;
    }
    navigate(ROUTES.BUYER.CHECKOUT);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Shopping Cart</h1>
          {cartItems.length > 0 && (
            <button
              onClick={handleClearCart}
              className="px-4 py-2 text-red-600 border border-red-600 rounded hover:bg-red-50 transition-colors"
            >
              Clear Cart
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <div className="font-medium">Error:</div>
            <div>{error}</div>
            {error.includes('Backend server is not running') && (
              <div className="mt-2 text-sm">
                <strong>Quick Fix:</strong>
                <ol className="list-decimal list-inside mt-1">
                  <li>Open a terminal in the backend directory</li>
                  <li>Run: <code className="bg-gray-200 px-1 rounded">mvn spring-boot:run</code></li>
                  <li>Wait for the server to start on port 8080</li>
                  <li>Refresh this page</li>
                </ol>
              </div>
            )}
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-xl mb-4">Your cart is empty</div>
            <button
              onClick={() => {
                try {
                  navigate(ROUTES.BUYER.MARKETPLACE);
                } catch (err) {
                  console.error('Navigation error:', err);
                  window.location.href = '/buyer/marketplace';
                }
              }}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <tr key={item.productId}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-16 w-16">
                            {item.imageBase64 ? (
                              <img
                                className="h-16 w-16 rounded-lg object-cover"
                                src={`data:image/jpeg;base64,${item.imageBase64}`}
                                alt={item.productName}
                              />
                            ) : (
                              <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-400 text-xs">No Image</span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {item.productName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        LKR {item.productPrice?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                          >
                            -
                          </button>
                          <span className="w-12 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        LKR {item.totalAmount?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleRemoveFromCart(item.productId)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-gray-50 px-6 py-4">
              <div className="flex justify-between items-center">
                <div className="text-lg font-medium text-gray-900">
                  Total: LKR {calculateTotal()}
                </div>
                <div className="space-x-4">
                  <button
                    onClick={() => {
                      try {
                        navigate(ROUTES.BUYER.MARKETPLACE);
                      } catch (err) {
                        console.error('Navigation error:', err);
                        window.location.href = '/buyer/marketplace';
                      }
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Continue Shopping
                  </button>
                  <button
                    onClick={proceedToCheckout}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Cart;
