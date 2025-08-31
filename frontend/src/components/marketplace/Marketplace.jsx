import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../layout/DashboardLayout';
import { Search, Heart, ShoppingCart, User, ChevronLeft, ChevronRight, Star, Tag } from 'lucide-react';

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [addingToCart, setAddingToCart] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { token, isAdmin, isBuyer, isFarmer } = useAuth();

  // Categories for filtering
  const categories = [
    { name: 'All', icon: '🌾' },
    { name: 'Fruits', icon: '🍎' },
    { name: 'Vegetables', icon: '🥬' },
    { name: 'Grains', icon: '🌾' },
    { name: 'Spices', icon: '🌶️' },
    { name: 'Organic', icon: '🌱' },
    { name: 'Fresh', icon: '🥕' },
    { name: 'Premium', icon: '⭐' }
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      // First, create sample data if needed
      await fetch('/api/dev/sample-data/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Then fetch products from the original endpoint
      const response = await fetch('/api/dev/sample-data/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        setError('Failed to load products');
      }
    } catch (err) {
      setError('Error loading products: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    setAddingToCart(productId);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/buyer/cart/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId,
          quantity
        })
      });

      if (response.ok) {
        setSuccess('Product added to cart successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to add product to cart');
      }
    } catch (err) {
      setError('Error adding to cart: ' + err.message);
    } finally {
      setAddingToCart(null);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Enhanced Header Section */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Logo and Category Dropdown */}
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg">🌾</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">CeyHarvest</span>
                </div>
                <div className="hidden lg:block relative">
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="appearance-none bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 pr-8 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category.name} value={category.name}>{category.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Enhanced Search Bar */}
              <div className="flex-1 max-w-2xl mx-8">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search fresh produce..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-600 text-white p-2 rounded-md hover:bg-green-700 transition-colors">
                    <Search size={20} />
                  </button>
                </div>
              </div>

              {/* Right Side Icons */}
              <div className="flex items-center space-x-6">
                <div className="hidden lg:block text-center">
                  <p className="text-sm text-gray-600">Need Help?</p>
                  <p className="text-sm font-semibold text-gray-900">(+94) 123-456-789</p>
                </div>
                <div className="flex items-center space-x-4">
                  <button className="p-2 text-gray-600 hover:text-green-600 transition-colors">
                    <Heart size={24} />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-green-600 transition-colors relative">
                    <ShoppingCart size={24} />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
                  </button>
                  <button className="p-2 text-gray-600 hover:text-green-600 transition-colors">
                    <User size={24} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Role Banner */}
        <div className="bg-green-50 border-b border-green-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  🛍️ Open Marketplace
                </span>
                <span className="text-green-700">Fresh produce from local farmers</span>
              </div>
              {isAdmin && (
                <div className="flex items-center space-x-2 ml-4">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    👑 Admin
                  </span>
                  <span className="text-blue-700">Manage products</span>
                </div>
              )}
              {(isBuyer || isFarmer) && (
                <div className="flex items-center space-x-2 ml-4">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    🛒 Shopper
                  </span>
                  <span className="text-green-700">Shop with confidence</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Alert Messages */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 shadow-md">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6 shadow-md">
              {success}
            </div>
          )}

          {/* Hero Section */}
          <div className="relative bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl overflow-hidden mb-12 shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20"></div>
            <div className="relative flex items-center justify-between p-12">
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-block bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                  Up To 50% Discount
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                  Buy Fresh & Healthy
                  <span className="text-green-600"> Vegetables</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl">
                  Discover the finest selection of organic and fresh produce from local farmers across Sri Lanka
                </p>
                <button className="bg-green-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-green-700 transform hover:scale-105 transition-all duration-300 shadow-lg">
                  SHOP NOW
                </button>
              </div>
            </div>
          </div>

          {/* Categories Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Shop By Category</h2>
              <div className="flex space-x-2">
                <button className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                  <ChevronLeft size={20} />
                </button>
                <button className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-6">
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`text-center group transition-all duration-300 ${
                    selectedCategory === category.name ? 'transform scale-110' : ''
                  }`}
                >
                  <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-2xl mb-3 transition-all duration-300 ${
                    selectedCategory === category.name 
                      ? 'bg-green-600 text-white shadow-lg' 
                      : 'bg-white text-gray-600 shadow-md hover:shadow-lg hover:bg-green-50'
                  }`}>
                    {category.icon}
                  </div>
                  <p className={`text-sm font-medium transition-colors ${
                    selectedCategory === category.name ? 'text-green-600' : 'text-gray-700'
                  }`}>
                    {category.name}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Promotional Banners */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="relative bg-gradient-to-br from-orange-100 to-yellow-100 rounded-3xl overflow-hidden shadow-xl transform hover:-translate-y-2 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-yellow-600/20"></div>
              <div className="relative p-8 text-center">
                <div className="inline-block bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                  Sale! 30% Off
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Best Fruits Collection</h3>
                <p className="text-gray-600 mb-6">Fresh seasonal fruits from local orchards</p>
                <button className="bg-orange-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-orange-700 transform hover:scale-105 transition-all duration-300 shadow-lg">
                  SHOP NOW
                </button>
              </div>
            </div>
            <div className="relative bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl overflow-hidden shadow-xl transform hover:-translate-y-2 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20"></div>
              <div className="relative p-8 text-center">
                <div className="inline-block bg-green-400 text-green-900 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                  Sale! 25% Off
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Healthy & Tasty Vegetables</h3>
                <p className="text-gray-600 mb-6">Fresh organic vegetables from local farmers</p>
                <button className="bg-green-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-700 transform hover:scale-105 transition-all duration-300 shadow-lg">
                  SHOP NOW
                </button>
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
              <div className="flex space-x-2">
                <button className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                  <ChevronLeft size={20} />
                </button>
                <button className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-4xl">🌾</span>
                </div>
                <p className="text-gray-500 text-xl">No products available</p>
                <p className="text-gray-400 mt-2">Try adjusting your search or category filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden group">
                    {/* Product Image */}
                    <div className="relative h-48 bg-gradient-to-br from-green-50 to-emerald-50 overflow-hidden">
                      {product.imageBase64 ? (
                        <img
                          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                          src={`data:image/jpeg;base64,${product.imageBase64}`}
                          alt={product.name}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-6xl opacity-20">🌾</span>
                        </div>
                      )}
                      
                      {/* Discount Badge */}
                      {product.discount && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          -{product.discount}%
                        </div>
                      )}
                      
                      {/* Out of Stock Badge */}
                      {product.quantity === 0 && (
                        <div className="absolute top-3 right-3 bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded-full">
                          OUT OF STOCK
                        </div>
                      )}
                      
                      {/* Wishlist Button */}
                      <button className="absolute top-3 right-3 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Heart size={16} className="text-gray-600" />
                      </button>
                    </div>
                    
                    {/* Product Info */}
                    <div className="p-6">
                      <div className="flex items-center mb-2">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={16} fill="currentColor" />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500 ml-2">(4.8)</span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          {product.category}
                        </span>
                        <span className="text-sm text-gray-500">
                          {product.quantity} available
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-green-600">
                            LKR {product.price.toFixed(2)}
                          </span>
                          {product.discount && (
                            <span className="text-sm text-gray-500 line-through">
                              LKR {(product.price * (1 + product.discount / 100)).toFixed(2)}
                            </span>
                          )}
                        </div>
                        <Tag size={16} className="text-gray-400" />
                      </div>
                      
                      {/* Enhanced Add to Cart Button */}
                      {isAdmin ? (
                        <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 shadow-md">
                          Manage Product
                        </button>
                      ) : (
                        <button
                          onClick={() => addToCart(product.id)}
                          disabled={addingToCart === product.id || product.quantity === 0}
                          className="w-full px-4 py-3 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-md"
                        >
                          {addingToCart === product.id ? (
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Adding...
                            </div>
                          ) : product.quantity === 0 ? (
                            'Out of Stock'
                          ) : (
                            'Add to Cart'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Newsletter Section */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-8 text-center text-white shadow-xl">
            <h3 className="text-3xl font-bold mb-4">Stay Updated</h3>
            <p className="text-green-100 mb-6 max-w-2xl mx-auto">
              Subscribe to our newsletter for the latest updates on fresh produce, seasonal offers, and farming tips.
            </p>
            <div className="flex max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-l-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button className="bg-yellow-400 text-yellow-900 px-6 py-3 rounded-r-lg font-semibold hover:bg-yellow-300 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Marketplace;