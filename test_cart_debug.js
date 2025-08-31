// Debug script to test cart functionality and identify 400 error
// Run this in the browser console

const API_BASE_URL = 'http://localhost:8080/api';

// Test 1: Check what products data looks like
function debugProductsData() {
  console.log('🔍 Debugging products data...');
  
  // Check if products are loaded in the component
  const products = document.querySelectorAll('[data-product]') || [];
  console.log('Products found in DOM:', products.length);
  
  // Check localStorage for any stored data
  const storedData = localStorage.getItem('products');
  console.log('Stored products data:', storedData);
  
  // Check if there are any product elements with IDs
  const productElements = document.querySelectorAll('[class*="product"]');
  console.log('Product elements found:', productElements.length);
}

// Test 2: Test cart API directly
async function testCartAPI() {
  console.log('🧪 Testing cart API directly...');
  
  try {
    // Test with minimal data
    const testData = {
      productId: 'test-product-123',
      quantity: 1
    };
    
    console.log('Sending test data:', testData);
    
    // Test buyer endpoint
    const response = await fetch(`${API_BASE_URL}/buyer/cart/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || 'test-token'}`
      },
      body: JSON.stringify(testData)
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      
      try {
        const errorJson = JSON.parse(errorText);
        console.error('Parsed error:', errorJson);
      } catch (e) {
        console.error('Raw error text:', errorText);
      }
    } else {
      const data = await response.json();
      console.log('Success response:', data);
    }
    
  } catch (error) {
    console.error('API test error:', error);
  }
}

// Test 3: Test development endpoint
async function testDevCartAPI() {
  console.log('🧪 Testing development cart API...');
  
  try {
    const testData = {
      productId: 'test-product-123',
      quantity: 1
    };
    
    console.log('Sending test data to dev endpoint:', testData);
    
    const response = await fetch(`${API_BASE_URL}/dev/cart/test@buyer.com/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    console.log('Dev endpoint response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Dev endpoint error:', errorText);
    } else {
      const data = await response.json();
      console.log('Dev endpoint success:', data);
    }
    
  } catch (error) {
    console.error('Dev API test error:', error);
  }
}

// Test 4: Check authentication state
function checkAuthState() {
  console.log('🔐 Checking authentication state...');
  
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  console.log('Token present:', !!token);
  console.log('User data present:', !!user);
  
  if (user) {
    try {
      const userData = JSON.parse(user);
      console.log('User role:', userData.role);
      console.log('User data:', userData);
    } catch (e) {
      console.error('Failed to parse user data:', e);
    }
  }
}

// Test 5: Simulate the exact request being made
function simulateAddToCart() {
  console.log('🎯 Simulating add to cart request...');
  
  // Get the first product button
  const addToCartButton = document.querySelector('button:contains("Add to Cart")') || 
                         document.querySelector('[class*="AddToCartButton"]') ||
                         document.querySelector('button');
  
  if (addToCartButton) {
    console.log('Found add to cart button:', addToCartButton);
    console.log('Button text:', addToCartButton.textContent);
    console.log('Button classes:', addToCartButton.className);
    
    // Try to click it to see what happens
    console.log('Attempting to click button...');
    addToCartButton.click();
  } else {
    console.log('No add to cart button found');
  }
}

// Run all tests
async function runAllDebugTests() {
  console.log('🚀 Starting comprehensive cart debug tests...\n');
  
  console.log('1. Checking products data...');
  debugProductsData();
  
  console.log('\n2. Checking authentication...');
  checkAuthState();
  
  console.log('\n3. Testing cart API directly...');
  await testCartAPI();
  
  console.log('\n4. Testing development endpoint...');
  await testDevCartAPI();
  
  console.log('\n5. Simulating add to cart...');
  simulateAddToCart();
  
  console.log('\n✅ All debug tests completed!');
  console.log('Check the console above for detailed information about the 400 error.');
}

// Export functions for manual testing
window.cartDebug = {
  debugProductsData,
  testCartAPI,
  testDevCartAPI,
  checkAuthState,
  simulateAddToCart,
  runAllDebugTests
};

console.log('Cart debug functions available as window.cartDebug');
console.log('Run window.cartDebug.runAllDebugTests() to debug the 400 error');
