import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { cartService } from '../services/cartService';

export const useCart = () => {
  const { token, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addToCart = useCallback(async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      setError('Please login to add items to cart');
      return false;
    }

    try {
      setLoading(true);
      setError('');
      
      await cartService.addToCart(productId, quantity, token);
      
      // Show success message (you can implement a toast notification here)
      console.log('Item added to cart successfully');
      return true;
    } catch (err) {
      if (err.message.includes('403')) {
        setError('Access denied. You may need to login with a shopping-enabled account.');
      } else {
        setError(err.message || 'Failed to add item to cart');
      }
      console.error('Add to cart error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [token, isAuthenticated]);

  const updateCartItem = useCallback(async (productId, quantity) => {
    if (!isAuthenticated) {
      setError('Please login to update cart');
      return false;
    }

    try {
      setLoading(true);
      setError('');
      
      await cartService.updateCartItem(productId, quantity, token);
      return true;
    } catch (err) {
      setError(err.message || 'Failed to update cart item');
      console.error('Update cart item error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [token, isAuthenticated]);

  const removeFromCart = useCallback(async (productId) => {
    if (!isAuthenticated) {
      setError('Please login to remove items from cart');
      return false;
    }

    try {
      setLoading(true);
      setError('');
      
      await cartService.removeFromCart(productId, token);
      return true;
    } catch (err) {
      setError(err.message || 'Failed to remove item from cart');
      console.error('Remove from cart error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [token, isAuthenticated]);

  const clearCart = useCallback(async () => {
    if (!isAuthenticated) {
      setError('Please login to clear cart');
      return false;
    }

    try {
      setLoading(true);
      setError('');
      
      await cartService.clearCart(token);
      return true;
    } catch (err) {
      setError(err.message || 'Failed to clear cart');
      console.error('Clear cart error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [token, isAuthenticated]);

  const getCartItems = useCallback(async () => {
    if (!isAuthenticated) {
      return [];
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await cartService.getCartItems(token);
      return response.items || [];
    } catch (err) {
      setError(err.message || 'Failed to fetch cart items');
      console.error('Get cart items error:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [token, isAuthenticated]);

  return {
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartItems,
    loading,
    error,
    clearError: () => setError('')
  };
};
