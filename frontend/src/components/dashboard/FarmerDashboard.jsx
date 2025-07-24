// FarmerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../layout/DashboardLayout';
import YieldPrediction from '../prediction/YieldPrediction';
import CropFeed from '../social/CropFeed';
import ExpiredProductNotifications from '../products/ExpiredProductNotifications';
import '../../styles/FarmerDashboard.css';

// Enhanced Stat Card Component
const EnhancedStatCard = ({ title, value, icon, gradient, change }) => (
  <div className="stats-card p-6 rounded-xl dashboard-card">
    <div className="flex items-center justify-between">
      <div>
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 bg-gradient-to-r ${gradient} rounded-lg flex items-center justify-center text-2xl`}>
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
      </div>
      <div className="text-right">
        <span className={`text-sm font-medium ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </span>
        <p className="text-xs text-gray-500">vs last month</p>
      </div>
    </div>
  </div>
);

// Enhanced Action Card Component
const EnhancedActionCard = ({ title, icon, gradient, actions }) => (
  <div className="glass-card p-6 rounded-xl dashboard-card">
    <div className="flex items-center space-x-3 mb-6">
      <div className={`w-12 h-12 bg-gradient-to-r ${gradient} rounded-lg flex items-center justify-center text-xl`}>
        {icon}
      </div>
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
    </div>
    <div className="space-y-3">
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={action.onClick}
          className={`enhanced-button w-full bg-gradient-to-r ${gradient} text-white px-4 py-3 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 font-medium`}
        >
          <span>{action.icon}</span>
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  </div>
);

const FarmerDashboard = () => {
  const { user, getAuthHeaders } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [_products, setProducts] = useState([]);
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
      const [productsRes, ordersRes] = await Promise.all([
        fetch(`/api/farmer/${user.id}/products`, {
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          }
        }),
        fetch(`/api/farmer/${user.id}/orders`, {
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          }
        })
      ]);

      if (productsRes.ok && ordersRes.ok) {
        const productsData = await productsRes.json();
        const ordersData = await ordersRes.json();
        
        const totalRevenue = ordersData.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const pendingOrders = ordersData.filter(order => order.status === 'pending').length;

        setStats({
          totalProducts: productsData.length,
          totalOrders: ordersData.length,
          totalRevenue: totalRevenue,
          pendingOrders: pendingOrders
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

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

              <EnhancedActionCard
                title="Smart Farming"
                icon="🧠"
                gradient="from-purple-500 to-indigo-600"
                actions={[
                  { label: "Predict Yield", icon: "📊", onClick: () => setCurrentView('yield-prediction') },
                  { label: "Weather Analysis", icon: "🌡️" },
                  { label: "Crop Analytics", icon: "📈" }
                ]}
              />
            </div>

            {/* Community & Orders Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EnhancedActionCard
                title="Community Hub"
                icon="🤝"
                gradient="from-teal-500 to-cyan-600"
                actions={[
                  { label: "Share Crop Updates", icon: "🌾", onClick: () => setCurrentView('crop-feed') },
                  { label: "Connect with Farmers", icon: "👥" },
                  { label: "Learning Center", icon: "📚" }
                ]}
              />

              <EnhancedActionCard
                title="Order Management"
                icon="📋"
                gradient="from-orange-500 to-red-500"
                actions={[
                  { label: "View All Orders", icon: "📦" },
                  { label: "Pending Orders", icon: "⏰" },
                  { label: "Order History", icon: "📊" }
                ]}
              />
            </div>

            {/* Recent Orders Section */}
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center">
                  📦 Recent Orders
                </h3>
                <p className="text-green-100 mt-1">Latest orders for your products</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {orders.length > 0 ? (
                    orders.slice(0, 5).map((order, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-white/50 rounded-lg hover:bg-white/70 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center text-xl">
                            📦
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">Order #{order.id}</div>
                            <div className="text-sm text-gray-600">{order.productName} | Qty: {order.quantity}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        📦
                      </div>
                      <p className="text-gray-500">No orders yet</p>
                      <p className="text-sm text-gray-400 mt-1">Orders will appear here once customers start purchasing your products</p>
                    </div>
                  )}
                </div>
              </div>
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
