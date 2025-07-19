import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import ProfileSettings from '../components/ProfileSettings';

const BuyerDashboard = () => {
  const { user, getAuthHeaders } = useAuth();
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
      // For buyers, we can use any identifier since they see all products
      const response = await fetch(`/api/buyer/${user.email}/products`, {
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
      // Use email for buyer orders since Order.customerEmail is used
      const response = await fetch(`/api/buyer/${user.email}/orders`, {
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

  // Render different views based on currentView state
  if (currentView === 'profile') {
    return <ProfileSettings onBack={() => setCurrentView('dashboard')} />;
  }

  return (
    <DashboardLayout title="Buyer Dashboard">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon="📦"
            color="text-blue-600"
          />
          <StatCard
            title="Total Spent"
            value={`$${stats.totalSpent}`}
            icon="💰"
            color="text-green-600"
          />
          <StatCard
            title="Favorite Products"
            value={stats.favoriteProducts}
            icon="❤️"
            color="text-red-600"
          />
          <StatCard
            title="Active Orders"
            value={stats.activeOrders}
            icon="⏳"
            color="text-yellow-600"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Shopping</h3>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Browse Products
              </button>
              <button className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Fresh Arrivals
              </button>
              <button className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
                Special Offers
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">My Account</h3>
            <div className="space-y-3">
              <button 
                onClick={() => setCurrentView('orders')}
                className="w-full bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
              >
                My Orders
              </button>
              <button 
                onClick={() => setCurrentView('favorites')}
                className="w-full bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700"
              >
                Favorites
              </button>
              <button 
                onClick={() => setCurrentView('profile')}
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                Profile Settings
              </button>
            </div>
          </div>
        </div>

        {/* Featured Products */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Featured Products
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Fresh products from local farmers
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {products.length > 0 ? (
              products.slice(0, 6).map((product, index) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg mb-3">
                    <div className="flex items-center justify-center text-gray-400">
                      🌽
                    </div>
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    {product.name}
                  </h4>
                  <p className="text-sm text-gray-500 mb-2">
                    By {product.farmerName}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-green-600">
                      ${product.price}
                    </span>
                    <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <div className="text-gray-500">No products available</div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Orders
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Your latest purchase history
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
                          {order.productName} | Qty: {order.quantity} | Total: ${order.total}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status}
                      </span>
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
    </DashboardLayout>
  );
};

export default BuyerDashboard;
