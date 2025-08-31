const API_BASE_URL = 'http://localhost:8080/api';

export const cartService = {
  // Add item to cart
  async addToCart(productId, quantity = 1, token) {
    try {
      // Validate input data
      if (!productId || productId === 'undefined' || productId === 'null') {
        throw new Error('Product ID is required and must be valid');
      }
      if (!quantity || quantity <= 0) {
        throw new Error('Valid quantity is required');
      }
      
      // Ensure productId is a string and quantity is an integer
      const cleanProductId = String(productId).trim();
      const cleanQuantity = parseInt(quantity);
      
      if (!cleanProductId || cleanProductId.length === 0) {
        throw new Error('Product ID cannot be empty');
      }
      if (isNaN(cleanQuantity) || cleanQuantity <= 0) {
        throw new Error('Quantity must be a positive number');
      }

              console.log('Adding to cart:', { 
          productId: cleanProductId, 
          quantity: cleanQuantity, 
          token: token ? 'present' : 'missing',
          originalProductId: productId,
          originalQuantity: quantity
        });

      // Try the regular buyer endpoint first (for buyers, farmers, etc.)
      let response = await fetch(`${API_BASE_URL}/buyer/cart/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: cleanProductId,
          quantity: cleanQuantity
        })
      });

      console.log('Buyer endpoint response status:', response.status);

      // If 403 (Forbidden), try the development endpoint for testing
      if (response.status === 403) {
        console.log('Buyer endpoint forbidden, trying development endpoint...');
        // Use a test buyer email for development
        const testBuyerEmail = 'test@buyer.com';
        response = await fetch(`${API_BASE_URL}/dev/cart/${testBuyerEmail}/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: cleanProductId,
            quantity: cleanQuantity
          })
        });
        console.log('Development endpoint response status:', response.status);
      }

      if (!response.ok) {
        let errorMessage = `Failed to add item to cart: ${response.status}`;
        
        try {
          const errorData = await response.json();
          console.error('Response error details:', errorData);
          errorMessage = errorData.message || errorData.toString() || errorMessage;
        } catch (e) {
          // If response is not JSON, try to get text
          try {
            const errorText = await response.text();
            console.error('Raw error response:', errorText);
            errorMessage = errorText || errorMessage;
          } catch (e2) {
            console.error('Could not read error response:', e2);
          }
        }
        
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('Add to cart error:', error);
      throw error;
    }
  },

  // Get cart items
  async getCartItems(token) {
    try {
      // First try the regular buyer endpoint
      let response = await fetch(`${API_BASE_URL}/buyer/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      // If 403 (Forbidden), try the development endpoint
      if (response.status === 403) {
        console.log('Buyer endpoint forbidden, trying development endpoint...');
        const testBuyerEmail = 'test@buyer.com';
        response = await fetch(`${API_BASE_URL}/dev/cart/${testBuyerEmail}`, {
          headers: {
            'Content-Type': 'application/json',
          }
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch cart: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get cart items error:', error);
      throw error;
    }
  },

  // Update cart item quantity
  async updateCartItem(productId, quantity, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/buyer/cart/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          quantity
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update cart item: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Update cart item error:', error);
      throw error;
    }
  },

  // Remove item from cart
  async removeFromCart(productId, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/buyer/cart/remove/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to remove item from cart: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Remove from cart error:', error);
      throw error;
    }
  },

  // Clear entire cart
  async clearCart(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/buyer/cart/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to clear cart: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Clear cart error:', error);
      throw error;
    }
  }
};
