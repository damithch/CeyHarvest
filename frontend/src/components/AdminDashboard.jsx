import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalFarmers: 0,
    totalBuyers: 0,
    totalProducts: 0,
    totalOrders: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    // Fetch admin statistics
    fetchStats();
    fetchRecentActivity();
  }, []);

  const fetchStats = async () => {
    try {
      // Replace with actual API endpoints
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const response = await fetch('/api/admin/recent-activity');
      if (response.ok) {
        const data = await response.json();
        setRecentActivity(data);
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error);
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
    <DashboardLayout title="Admin Dashboard">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Farmers"
            value={stats.totalFarmers}
            icon="👨‍🌾"
            color="text-green-600"
          />
          <StatCard
            title="Total Buyers"
            value={stats.totalBuyers}
            icon="👥"
            color="text-blue-600"
          />
          <StatCard
            title="Total Products"
            value={stats.totalProducts}
            icon="🌽"
            color="text-yellow-600"
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon="📦"
            color="text-purple-600"
          />
        </div>

        {/* Management Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">User Management</h3>
            <div className="space-y-3">
              <button className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Manage Farmers
              </button>
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Manage Buyers
              </button>
              <button className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
                View All Users
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Product Management</h3>
            <div className="space-y-3">
              <button className="w-full bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">
                View All Products
              </button>
              <button className="w-full bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">
                Pending Approvals
              </button>
              <button className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                Reported Products
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">System Settings</h3>
            <div className="space-y-3">
              <button className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
                System Configuration
              </button>
              <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                Reports & Analytics
              </button>
              <button className="w-full bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700">
                Backup & Maintenance
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Activity
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Latest system activities and user actions
            </p>
          </div>
          <ul className="divide-y divide-gray-200">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <li key={index} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-900">
                      {activity.description}
                    </div>
                    <div className="text-sm text-gray-500">
                      {activity.timestamp}
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-4 py-4 sm:px-6">
                <div className="text-sm text-gray-500">No recent activity</div>
              </li>
            )}
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
