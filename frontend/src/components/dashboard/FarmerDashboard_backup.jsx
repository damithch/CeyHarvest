// FarmerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../layout/DashboardLayout';
import YieldPrediction from '../prediction/YieldPrediction';
import CropFeed from '../social/CropFeed';
import ExpiredProductNotifications from '../products/ExpiredProductNotifications';
import '../../styles/FarmerDashboard.css';

const FarmerDashboard = () => {
  const { user, getAuthHeaders } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0
  });

  useEffect(() => {
    if (user && user.id) {
      fetchProducts();
      fetchOrders();
      fetchStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/farmer/${user.id}/products`, {
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
      const response = await fetch(`/api/farmer/${user.id}/orders`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/farmer/${user.id}/stats`, {
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

  const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`text-2xl ${color}`}>{icon}</div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="text-lg font-medium text-gray-900">
                {value}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout title="Farmer Dashboard">
      <div className="relative z-10">
        {/* Navigation Tabs */}
        <div className="glass-card rounded-lg mb-6 p-1">
          <nav className="flex space-x-1">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`enhanced-tab flex-1 py-3 px-6 rounded-md font-medium text-sm transition-all duration-300 ${
                currentView === 'dashboard'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg active'
                  : 'text-gray-600 hover:text-green-600 hover:bg-white/50'
              }`}
            >
              🏡 Dashboard
            </button>
            <button
              onClick={() => setCurrentView('crop-feed')}
              className={`enhanced-tab flex-1 py-3 px-6 rounded-md font-medium text-sm transition-all duration-300 ${
                currentView === 'crop-feed'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg active'
                  : 'text-gray-600 hover:text-green-600 hover:bg-white/50'
              }`}
            >
              🌾 Crop Feed
            </button>
            <button
              onClick={() => setCurrentView('expired-products')}
              className={`enhanced-tab flex-1 py-3 px-6 rounded-md font-medium text-sm transition-all duration-300 ${
                currentView === 'expired-products'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg active'
                  : 'text-gray-600 hover:text-orange-600 hover:bg-white/50'
              }`}
            >
              ⚠️ Alerts
            </button>
            <button
              onClick={() => setCurrentView('yield-prediction')}
              className={`enhanced-tab flex-1 py-3 px-6 rounded-md font-medium text-sm transition-all duration-300 ${
                currentView === 'yield-prediction'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg active'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-white/50'
              }`}
            >
              📊 Predictions
            </button>
          </nav>
        </div>

        {/* Content based on current view */}
        {currentView === 'dashboard' && (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="glass-card p-8 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Welcome back, {user?.name || user?.username}! 🌱
                  </h2>
                  <p className="text-gray-600 mt-2">Here's what's happening with your farm today</p>
                </div>
                <div className="hidden md:block">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-4xl animate-float">
                    🚜
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <EnhancedStatCard
                title="My Products"
                value={stats.totalProducts}
                icon="🌽"
                gradient="from-green-400 to-emerald-500"
                change="+12%"
              />
              <EnhancedStatCard
                title="Total Orders"
                value={stats.totalOrders}
                icon="📦"
                gradient="from-blue-400 to-blue-500"
                change="+8%"
              />
              <EnhancedStatCard
                title="Total Revenue"
                value={`LKR ${stats.totalRevenue}`}
                icon="💰"
                gradient="from-yellow-400 to-orange-500"
                change="+25%"
              />
              <EnhancedStatCard
                title="Pending Orders"
                value={stats.pendingOrders}
                icon="⏳"
                gradient="from-red-400 to-pink-500"
                change="-5%"
              />
            </div>

            {/* Enhanced Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <EnhancedActionCard
                title="Product Management"
                icon="🌽"
                gradient="from-green-500 to-emerald-600"
                actions={[
                  { label: "Add New Product", icon: "➕" },
                  { label: "View My Products", icon: "👁️" },
                  { label: "Check Expired Items", icon: "⚠️", onClick: () => setCurrentView('expired-products') }
                ]}
              />

              <EnhancedActionCard
                title="Inventory & Stock"
                icon="📊"
                gradient="from-blue-500 to-indigo-600"
                actions={[
                  { label: "Current Stock", icon: "📦" },
                  { label: "Low Stock Alerts", icon: "⚡" },
                  { label: "Update Inventory", icon: "🔄" }
                ]}
              />
                  <button className="w-full bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">
                    Update Inventory
                  </button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Smart Farming</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => setCurrentView('yield-prediction')}
                    className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                  >
                    📊 Predict Yield
                  </button>
                  <button className="w-full bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">
                    🌡️ Weather Analysis
                  </button>
                  <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                    � Crop Analytics
                  </button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Community</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => setCurrentView('crop-feed')}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    🌾 Share Crop Updates
                  </button>
                  <button className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    🤝 Connect with Farmers
                  </button>
                  <button className="w-full bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700">
                    📚 Learn & Tips
                  </button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Order Management</h3>
                <div className="space-y-3">
                  <button className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
                    View All Orders
                  </button>
                  <button className="w-full bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">
                    Pending Orders
                  </button>
                  <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                    Order History
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Products */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Recent Products
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Your latest product listings
                </p>
              </div>
              <ul className="divide-y divide-gray-200">
                {products.length > 0 ? (
                  products.slice(0, 5).map((product, index) => (
                    <li key={index} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              Price: LKR {product.price} | Stock: {product.stock}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.status}
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-4 sm:px-6">
                    <div className="text-sm text-gray-500">No products yet</div>
                  </li>
                )}
              </ul>
            </div>

            {/* Recent Orders */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Recent Orders
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Latest orders for your products
                </p>
              </div>
              <ul className="divide-y divide-gray-200">
                {orders.length > 0 ? (
                  orders.slice(0, 5).map((order, index) => (
                    <li key={index} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              Order #{order.id}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.productName} | Qty: {order.quantity}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.status}
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-4 sm:px-6">
                    <div className="text-sm text-gray-500">No orders yet</div>
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* Yield Prediction View */}
        {currentView === 'yield-prediction' && (
          <YieldPrediction />
        )}

        {/* Crop Feed View */}
        {currentView === 'crop-feed' && (
          <CropFeed />
        )}

        {/* Expired Products View */}
        {currentView === 'expired-products' && (
          <ExpiredProductNotifications />
        )}
      </div>
    </DashboardLayout>
  );
};

export default FarmerDashboard;
