import React, { useState } from 'react';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import Toast from './Toast';

const AddToCartButton = ({ 
  productId, 
  productName, 
  quantity = 1, 
  className = "", 
  size = "normal",
  showQuantity = false 
}) => {
  const { addToCart, loading, error } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [localQuantity, setLocalQuantity] = useState(quantity);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      setToastMessage('Please login to add items to cart');
      setToastType('error');
      setShowToast(true);
      navigate(ROUTES.LOGIN);
      return;
    }

    // Check if user can complete purchases (buyers, farmers, etc. but not admins)
    if (user && user.role === 'ADMIN') {
      setToastMessage('Admins cannot purchase products. You can only manage them.');
      setToastType('error');
      setShowToast(true);
      return;
    }

    // Validate productId before sending
    if (!productId || productId === 'undefined' || productId === 'null') {
      setToastMessage('Invalid product ID. Please try again.');
      setToastType('error');
      setShowToast(true);
      console.error('Invalid productId:', productId);
      return;
    }

    // Debug logging
    console.log('AddToCartButton - Data being sent:', {
      productId: String(productId),
      productName,
      localQuantity,
      userRole: user?.role
    });

    const success = await addToCart(String(productId), localQuantity);
    if (success) {
      setToastMessage(`${productName} added to cart successfully!`);
      setToastType('success');
      setShowToast(true);
    } else {
      setToastMessage('Failed to add item to cart');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1) {
      setLocalQuantity(newQuantity);
    }
  };

  const baseClasses = "font-semibold transition-all duration-300 shadow-md";
  const sizeClasses = {
    small: "px-3 py-2 text-sm rounded-lg",
    normal: "px-4 py-3 rounded-xl",
    large: "px-6 py-4 text-lg rounded-xl"
  };

  const buttonClasses = `${baseClasses} ${sizeClasses[size]} ${className}`;

  return (
    <>
      <div className="space-y-2">
        {showQuantity && (
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={() => handleQuantityChange(localQuantity - 1)}
              disabled={localQuantity <= 1 || loading}
              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              -
            </button>
            <span className="w-12 text-center text-sm font-medium">
              {localQuantity}
            </span>
            <button
              onClick={() => handleQuantityChange(localQuantity + 1)}
              disabled={loading}
              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              +
            </button>
          </div>
        )}
        
        <button
          onClick={handleAddToCart}
          disabled={loading}
          className={`${buttonClasses} bg-green-600 text-white hover:bg-green-700 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Adding...
            </div>
          ) : (
            'Add to Cart'
          )}
        </button>
        
        {error && (
          <div className="text-red-600 text-xs text-center">
            {error}
          </div>
        )}
      </div>
      
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </>
  );
};

export default AddToCartButton;
