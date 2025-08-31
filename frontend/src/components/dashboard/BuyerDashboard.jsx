// BuyerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../layout/DashboardLayout';
import ProfileSettings from '../user/ProfileSettings';
import YieldPrediction from '../prediction/YieldPrediction';
import { ROUTES } from '../../constants/routes';
import AddToCartButton from '../common/AddToCartButton';

const BuyerDashboard = () => {
  const { user, getAuthHeaders } = useAuth();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    favoriteProducts: 0,
    activeOrders: 0
  });

  useEffect(() => {
    if (user && user.id) {
      fetchProducts();
      fetchOrders();
      fetchStats();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/buyer/products`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/buyer/orders`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
        } else {
          setOrders([]);
          console.warn('Unexpected orders API response structure:', data);
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/buyer/${user.email}/stats`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const NavigationBar = () => (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-lg bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">🌾</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                FarmConnect
              </span>
            </div>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  currentView === 'dashboard'
                    ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate(ROUTES.BUYER.MARKETPLACE)}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Marketplace
              </button>
              <button
                onClick={() => setCurrentView('orders')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  currentView === 'orders'
                    ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                My Orders
              </button>
              <button
                onClick={() => setCurrentView('yield-prediction')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  currentView === 'yield-prediction'
                    ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Market Analysis
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(ROUTES.BUYER.CART)}
              className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 5L7 13m0 0h10M7 13v8a2 2 0 002 2h6a2 2 0 002-2v-8" />
              </svg>
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">2</span>
            </button>
            <div className="relative">
              <button
                onClick={() => setCurrentView('profile')}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors duration-200"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <span className="hidden md:block text-sm font-medium">{user?.name || 'User'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );

  const StatCard = ({ title, value, icon, color, change }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change > 0 ? '↗' : '↘'} {Math.abs(change)}%
              </span>
              <span className="text-xs text-gray-500 ml-1">vs last month</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          <span className="text-xl">{icon}</span>
        </div>
      </div>
    </div>
  );

  if (currentView === 'profile') {
    return (
      <>
        <NavigationBar />
        <ProfileSettings onBack={() => setCurrentView('dashboard')} />
      </>
    );
  }

  if (currentView === 'yield-prediction') {
    return (
      <>
        <NavigationBar />
        <DashboardLayout>
          <div className="p-6">
            <YieldPrediction />
          </div>
        </DashboardLayout>
      </>
    );
  }

  return (
    <>
      <NavigationBar />
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Welcome Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl shadow-xl">
              <div className="absolute inset-0 bg-black bg-opacity-10"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white bg-opacity-10 rounded-full -translate-y-32 translate-x-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white bg-opacity-5 rounded-full translate-y-24 -translate-x-24"></div>
              <div className="relative px-8 py-12">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-4xl font-bold text-white mb-2">
                      Welcome back, {user?.name || 'Buyer'}! 👋
                    </h1>
                    <p className="text-indigo-100 text-lg">
                      Discover fresh products from local farmers and manage your orders
                    </p>
                    <div className="mt-6">
                      <button
                        onClick={() => navigate(ROUTES.BUYER.MARKETPLACE)}
                        className="bg-white bg-opacity-20 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold hover:bg-opacity-30 transition-all duration-300 border border-white border-opacity-20"
                      >
                        Start Shopping →
                      </button>
                    </div>
                  </div>
                  <div className="hidden lg:block">
                    <div className="w-32 h-32 bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <span className="text-6xl">🛒</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Orders"
                value={stats.totalOrders || 0}
                icon="📦"
                color="bg-blue-100 text-blue-600"
                change={12}
              />
              <StatCard
                title="Total Spent"
                value={`LKR ${stats.totalSpent?.toLocaleString() || 0}`}
                icon="💰"
                color="bg-green-100 text-green-600"
                change={8}
              />
              <StatCard
                title="Favorites"
                value={stats.favoriteProducts || 0}
                icon="❤️"
                color="bg-red-100 text-red-600"
                change={-3}
              />
              <StatCard
                title="Active Orders"
                value={stats.activeOrders || 0}
                icon="🚚"
                color="bg-yellow-100 text-yellow-600"
                change={25}
              />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Shopping Actions */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
                    <span className="text-xl">🛒</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Shopping</h3>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate(ROUTES.BUYER.MARKETPLACE)}
                    className="w-full bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition-colors duration-200 font-medium"
                  >
                    Browse Products
                  </button>
                  <button
                    onClick={() => navigate(ROUTES.BUYER.CART)}
                    className="w-full bg-green-600 text-white px-4 py-3 rounded-xl hover:bg-green-700 transition-colors duration-200 font-medium"
                  >
                    View Cart
                  </button>
                  <button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-3 rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-colors duration-200 font-medium">
                    Special Offers
                  </button>
                </div>
              </div>

              {/* Account Actions */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mr-3">
                    <span className="text-xl">👤</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">My Account</h3>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => setCurrentView('orders')}
                    className="w-full bg-purple-600 text-white px-4 py-3 rounded-xl hover:bg-purple-700 transition-colors duration-200 font-medium"
                  >
                    My Orders
                  </button>
                  <button
                    onClick={() => setCurrentView('favorites')}
                    className="w-full bg-pink-600 text-white px-4 py-3 rounded-xl hover:bg-pink-700 transition-colors duration-200 font-medium"
                  >
                    Favorites
                  </button>
                  <button
                    onClick={() => setCurrentView('profile')}
                    className="w-full bg-indigo-600 text-white px-4 py-3 rounded-xl hover:bg-indigo-700 transition-colors duration-200 font-medium"
                  >
                    Profile Settings
                  </button>
                </div>
              </div>

              {/* Analytics Actions */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mr-3">
                    <span className="text-xl">📊</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Market Analysis</h3>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => setCurrentView('yield-prediction')}
                    className="w-full bg-emerald-600 text-white px-4 py-3 rounded-xl hover:bg-emerald-700 transition-colors duration-200 font-medium"
                  >
                    🌾 Yield Predictions
                  </button>
                  <button className="w-full bg-cyan-600 text-white px-4 py-3 rounded-xl hover:bg-cyan-700 transition-colors duration-200 font-medium">
                    📊 Price Trends
                  </button>
                  <button className="w-full bg-violet-600 text-white px-4 py-3 rounded-xl hover:bg-violet-700 transition-colors duration-200 font-medium">
                    📈 Market Reports
                  </button>
                </div>
              </div>
            </div>

            {/* Featured Products */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-8 py-6 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-lg">🌟</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Featured Products</h3>
                      <p className="text-sm text-gray-600">Fresh products from local farmers</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(ROUTES.BUYER.MARKETPLACE)}
                    className="text-green-600 hover:text-green-700 font-medium text-sm transition-colors duration-200"
                  >
                    View All →
                  </button>
                </div>
              </div>
              <div className="p-8">
                {products.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.slice(0, 6).map((product, index) => (
                      <div key={index} className="group border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 bg-white">
                        <div className="relative p-8 bg-gradient-to-br from-green-50 to-emerald-50 group-hover:from-green-100 group-hover:to-emerald-100 transition-all duration-300">
                          <div className="text-6xl text-center group-hover:scale-110 transition-transform duration-300">🌽</div>
                          <div className="absolute top-4 right-4">
                            <button className="w-8 h-8 bg-white bg-opacity-70 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all duration-200">
                              <span className="text-sm">❤️</span>
                            </button>
                          </div>
                        </div>
                        <div className="p-6">
                          <h4 className="font-bold text-gray-900 text-lg mb-1">{product.name}</h4>
                          <p className="text-sm text-gray-600 mb-4">By {product.farmerName}</p>
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-xl text-gray-900">LKR {product.price}</span>
                            <AddToCartButton 
                              productId={String(product.id)}
                              productName={product.name}
                              size="small"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="text-8xl mb-4">🌱</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No products available</h3>
                    <p className="text-gray-600 mb-6">Check back soon for fresh products from local farmers!</p>
                    <button
                      onClick={() => navigate(ROUTES.BUYER.MARKETPLACE)}
                      className="bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition-colors duration-200"
                    >
                      Browse Marketplace
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-lg">📋</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Recent Orders</h3>
                      <p className="text-sm text-gray-600">Your latest purchase history</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentView('orders')}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200"
                  >
                    View All →
                  </button>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {orders.length > 0 ? (
                  orders.slice(0, 5).map((order, index) => (
                    <div key={index} className="px-8 py-6 hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <p className="font-bold text-gray-900 text-lg">Order #{order.id}</p>
                            <div className="ml-3 flex items-center">
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                              <span className="text-xs text-gray-500">Active</span>
                            </div>
                          </div>
                          <p className="text-gray-600 mb-2">
                            <span className="font-medium text-gray-900">{order.productName}</span> • Qty: <span className="font-medium">{order.quantity}</span>
                          </p>
                          <p className="text-lg font-bold text-gray-900">LKR {order.total}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className={`px-4 py-2 text-sm font-medium rounded-full ${
                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status}
                          </span>
                          <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-8 py-16 text-center">
                    <div className="text-8xl mb-4">📦</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-gray-600 mb-6">Start shopping to see your orders here!</p>
                    <button
                      onClick={() => navigate(ROUTES.BUYER.MARKETPLACE)}
                      className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200"
                    >
                      Start Shopping
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default BuyerDashboard;