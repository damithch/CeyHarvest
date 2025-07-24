// DriverDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../layout/DashboardLayout';
import ProfileSettings from '../user/ProfileSettings';

const DriverDashboard = () => {
  const { user, getAuthHeaders } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [deliveries, setDeliveries] = useState([]);
  const [stats, setStats] = useState({
    totalDeliveries: 0,
    completedDeliveries: 0,
    pendingDeliveries: 0,
    totalEarnings: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.id) {
      fetchDeliveries();
      fetchStats();
    }
  }, [user]);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      // Note: This endpoint would need to be implemented in the backend
      const response = await fetch(`/api/driver/${user.id}/deliveries`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      });
      if (response.ok) {
        const data = await response.json();
        setDeliveries(data);
      }
    } catch (error) {
      console.error('Error fetching deliveries:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Note: This endpoint would need to be implemented in the backend
      const response = await fetch(`/api/driver/${user.id}/stats`, {
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

  const updateDeliveryStatus = async (deliveryId, newStatus) => {
    try {
      const response = await fetch(`/api/driver/${user.id}/deliveries/${deliveryId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        fetchDeliveries(); // Refresh the deliveries list
        fetchStats(); // Refresh stats
      }
    } catch (error) {
      console.error('Error updating delivery status:', error);
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m0 0V9a2 2 0 012-2h2m0 0V6a2 2 0 012-2h1a2 2 0 012 2v1m0 0h2" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Deliveries</h3>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalDeliveries}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Completed</h3>
              <p className="text-2xl font-semibold text-gray-900">{stats.completedDeliveries}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Pending</h3>
              <p className="text-2xl font-semibold text-gray-900">{stats.pendingDeliveries}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Earnings</h3>
              <p className="text-2xl font-semibold text-gray-900">LKR {stats.totalEarnings?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Deliveries */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">🚚 Active Deliveries</h2>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading deliveries...</p>
            </div>
          ) : deliveries.length > 0 ? (
            <div className="space-y-4">
              {deliveries.map((delivery) => (
                <div key={delivery.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        Delivery #{delivery.id?.substring(0, 8) || 'N/A'}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        📍 From: {delivery.pickupAddress || 'Not specified'}
                      </p>
                      <p className="text-sm text-gray-600">
                        📍 To: {delivery.deliveryAddress || 'Not specified'}
                      </p>
                      <p className="text-sm text-gray-600">
                        📦 Items: {delivery.items?.length || 0} items
                      </p>
                      <p className="text-sm text-gray-600">
                        💰 Delivery Fee: LKR {delivery.deliveryFee || 0}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        delivery.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        delivery.status === 'IN_TRANSIT' ? 'bg-blue-100 text-blue-800' :
                        delivery.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {delivery.status || 'UNKNOWN'}
                      </span>
                      {delivery.status === 'PENDING' && (
                        <button
                          onClick={() => updateDeliveryStatus(delivery.id, 'IN_TRANSIT')}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Start Delivery
                        </button>
                      )}
                      {delivery.status === 'IN_TRANSIT' && (
                        <button
                          onClick={() => updateDeliveryStatus(delivery.id, 'DELIVERED')}
                          className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Mark Delivered
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m0 0V9a2 2 0 012-2h2m0 0V6a2 2 0 012-2h1a2 2 0 012 2v1m0 0h2" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Deliveries</h3>
              <p className="text-gray-500">You don't have any active deliveries at the moment.</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">🎯 Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors">
              <div className="text-center">
                <svg className="w-8 h-8 text-green-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <h3 className="font-medium text-gray-900">Update Location</h3>
                <p className="text-sm text-gray-500 mt-1">Share your current location</p>
              </div>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <div className="text-center">
                <svg className="w-8 h-8 text-blue-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="font-medium text-gray-900">Delivery History</h3>
                <p className="text-sm text-gray-500 mt-1">View past deliveries</p>
              </div>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors">
              <div className="text-center">
                <svg className="w-8 h-8 text-purple-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <h3 className="font-medium text-gray-900">Earnings Report</h3>
                <p className="text-sm text-gray-500 mt-1">View earnings summary</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <ProfileSettings onBack={() => setCurrentView('dashboard')} />
  );

  // Render different views based on currentView state
  if (currentView === 'profile') {
    return renderProfile();
  }

  return (
    <DashboardLayout title="Driver Dashboard">
      <div className="space-y-6">
        {/* Welcome Message */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName || user?.username || 'Driver'}! 🚚
          </h2>
          <p className="text-gray-600">Manage your deliveries and track your earnings</p>
        </div>

        {renderDashboard()}

        {/* Navigation Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Account Settings</h3>
          <button
            onClick={() => setCurrentView('profile')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile Settings
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DriverDashboard;
