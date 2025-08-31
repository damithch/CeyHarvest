// Test script to verify cart functionality
// Run this in the browser console to test cart operations

const API_BASE_URL = 'http://localhost:8080/api';

// Test adding item to cart using development endpoint
async function testAddToCart() {
  try {
    const testBuyerEmail = 'test@buyer.com';
    const productId = '1'; // Use a valid product ID from your database
    const quantity = 1;

    console.log('Testing add to cart...');
    
    const response = await fetch(`${API_BASE_URL}/dev/cart/${testBuyerEmail}/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId,
        quantity
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Add to cart successful:', data);
      return true;
    } else {
      const errorText = await response.text();
      console.error('❌ Add to cart failed:', response.status, errorText);
      return false;
    }
  } catch (error) {
    console.error('❌ Add to cart error:', error);
    return false;
  }
}

// Test getting cart items
async function testGetCart() {
  try {
    const testBuyerEmail = 'test@buyer.com';
    
    console.log('Testing get cart...');
    
    const response = await fetch(`${API_BASE_URL}/dev/cart/${testBuyerEmail}`, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Get cart successful:', data);
      return true;
    } else {
      const errorText = await response.text();
      console.error('❌ Get cart failed:', response.status, errorText);
      return false;
    }
  } catch (error) {
    console.error('❌ Get cart error:', error);
    return false;
  }
}

// Test buyer endpoint with authentication
async function testBuyerEndpoint() {
  try {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('❌ No authentication token found');
      return false;
    }

    console.log('Testing buyer endpoint with token...');
    
    const response = await fetch(`${API_BASE_URL}/buyer/cart`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Buyer endpoint successful:', data);
      return true;
    } else {
      const errorText = await response.text();
      console.error('❌ Buyer endpoint failed:', response.status, errorText);
      return false;
    }
  } catch (error) {
    console.error('❌ Buyer endpoint error:', error);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🧪 Starting cart functionality tests...\n');
  
  console.log('1. Testing development endpoint (add to cart):');
  await testAddToCart();
  
  console.log('\n2. Testing development endpoint (get cart):');
  await testGetCart();
  
  console.log('\n3. Testing buyer endpoint with authentication:');
  await testBuyerEndpoint();
  
  console.log('\n✅ All tests completed!');
}

// Export functions for manual testing
window.testCart = {
  testAddToCart,
  testGetCart,
  testBuyerEndpoint,
  runAllTests
};

console.log('Cart test functions available as window.testCart');
console.log('Run window.testCart.runAllTests() to test all functionality');
