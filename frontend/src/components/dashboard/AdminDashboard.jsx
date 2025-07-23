import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layout/DashboardLayout';
import UserManagement from '../user/UserManagement';
import { useAuth } from '../../contexts/AuthContext';

const DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle', 'Gampaha', 'Hambantota',
  'Jaffna', 'Kalutara', 'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar', 'Matale',
  'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya', 'Polonnaruwa', 'Puttalam', 'Ratnapura',
  'Trincomalee', 'Vavuniya'
];

const AdminDashboard = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [stats, setStats] = useState({
    totalFarmers: 0,
    totalBuyers: 0,
    totalDrivers: 0,
    totalAdmins: 0,
    totalProducts: 0,
    totalOrders: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [showWarehouseForm, setShowWarehouseForm] = useState(false);
  const [warehouseForm, setWarehouseForm] = useState({
    managerName: '',
    district: '',
    address: '',
    phoneNumber: '',
    password: ''
  });
  const [formError, setFormError] = useState('');
  const [warehouses, setWarehouses] = useState([]);
  const [warehouseProductSummaries, setWarehouseProductSummaries] = useState({});
  const [selectedWarehouseProduct, setSelectedWarehouseProduct] = useState(null);
  const [farmersForProduct, setFarmersForProduct] = useState([]);
  const [showFarmersModal, setShowFarmersModal] = useState(false);
  const { user } = useAuth();

  // Fetch all warehouses and their product summaries
  const fetchWarehouses = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/admin/warehouses', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setWarehouses(data);
      // For each warehouse, fetch product summary (sequentially)
      for (const wh of data) {
        const summaryRes = await fetch(`/api/warehouse/${wh.id}/products/summary`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (summaryRes.ok) {
          const summary = await summaryRes.json();
          setWarehouseProductSummaries(prev => ({ ...prev, [wh.id]: summary }));
        }
      }
    }
  };

  useEffect(() => {
    // Fetch admin statistics
    fetchStats();
    fetchRecentActivity();
    fetchWarehouses();
  }, []);

  const handleWarehouseInputChange = (e) => {
    const { name, value } = e.target;
    setWarehouseForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleWarehouseSubmit = async (e) => {
    e.preventDefault();
    // Simple validation
    if (!warehouseForm.managerName || !warehouseForm.district || !warehouseForm.address || !warehouseForm.phoneNumber || !warehouseForm.password) {
      setFormError('All fields are required.');
      return;
    }
    setFormError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/warehouses/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(warehouseForm),
      });
      if (response.ok) {
        alert('Warehouse registered successfully!');
        setShowWarehouseForm(false);
        setWarehouseForm({ managerName: '', district: '', address: '', phoneNumber: '', password: '' });
      } else {
        const errorMsg = await response.text();
        setFormError(errorMsg);
      }
    } catch (err) {
      setFormError('Network error. Please try again.');
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
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

  const fetchRecentActivity = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/recent-activity', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setRecentActivity(data);
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const handleProductClick = async (warehouseId, productName) => {
    setSelectedWarehouseProduct({ warehouseId, productName });
    setShowFarmersModal(true);
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/warehouse/${warehouseId}/products/${encodeURIComponent(productName)}/farmers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) setFarmersForProduct(await res.json());
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

  // Render user management views
  if (currentView === 'farmers') {
    return <UserManagement userType="FARMER" onBack={() => setCurrentView('dashboard')} />;
  }
  
  if (currentView === 'buyers') {
    return <UserManagement userType="BUYER" onBack={() => setCurrentView('dashboard')} />;
  }
  
  if (currentView === 'drivers') {
    return <UserManagement userType="DRIVER" onBack={() => setCurrentView('dashboard')} />;
  }
  
  if (currentView === 'all-users') {
    return <UserManagement userType="ALL" onBack={() => setCurrentView('dashboard')} />;
  }

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard
            title="Total Farmers"
            value={stats.totalFarmers || 0}
            icon="👨‍🌾"
            color="text-green-600"
          />
          <StatCard
            title="Total Buyers"
            value={stats.totalBuyers || 0}
            icon="👥"
            color="text-blue-600"
          />
          <StatCard
            title="Total Drivers"
            value={stats.totalDrivers || 0}
            icon="🚚"
            color="text-gray-600"
          />
          <StatCard
            title="Total Admins"
            value={stats.totalAdmins || 0}
            icon="⚡"
            color="text-red-600"
          />
          <StatCard
            title="Total Users"
            value={stats.totalUsers || 0}
            icon="�"
            color="text-purple-600"
          />
        </div>

        {/* Management Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">User Management</h3>
            <div className="space-y-3">
              <button 
                onClick={() => setCurrentView('farmers')}
                className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
              >
                👨‍🌾 Manage Farmers ({stats.totalFarmers || 0})
              </button>
              <button 
                onClick={() => setCurrentView('buyers')}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                👥 Manage Buyers ({stats.totalBuyers || 0})
              </button>
              <button 
                onClick={() => setCurrentView('drivers')}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                🚚 Manage Drivers ({stats.totalDrivers || 0})
              </button>
              <button 
                onClick={() => setCurrentView('all-users')}
                className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
              >
                👤 View All Users ({stats.totalUsers || 0})
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
              <button
                className="w-full bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
                onClick={() => setShowWarehouseForm((prev) => !prev)}
              >
                {showWarehouseForm ? 'Close Warehouse Registration' : 'Register New Warehouse'}
              </button>
              {showWarehouseForm && (
                <form className="mt-4 space-y-3 bg-gray-50 p-4 rounded" onSubmit={handleWarehouseSubmit}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Manager Name</label>
                    <input
                      type="text"
                      name="managerName"
                      value={warehouseForm.managerName}
                      onChange={handleWarehouseInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded px-2 py-1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">District</label>
                    <select
                      name="district"
                      value={warehouseForm.district}
                      onChange={handleWarehouseInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="">Select District</option>
                      {DISTRICTS.map((district) => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={warehouseForm.address}
                      onChange={handleWarehouseInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded px-2 py-1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      type="text"
                      name="phoneNumber"
                      value={warehouseForm.phoneNumber}
                      onChange={handleWarehouseInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded px-2 py-1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={warehouseForm.password}
                      onChange={handleWarehouseInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded px-2 py-1"
                    />
                  </div>
                  {formError && <div className="text-red-600 text-sm">{formError}</div>}
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-2"
                  >
                    Register
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Verification Statistics */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Email Verification Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.verifiedFarmers || 0}</div>
              <div className="text-sm text-gray-500">Verified Farmers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.verifiedBuyers || 0}</div>
              <div className="text-sm text-gray-500">Verified Buyers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{stats.verifiedDrivers || 0}</div>
              <div className="text-sm text-gray-500">Verified Drivers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.totalVerifiedUsers || 0}</div>
              <div className="text-sm text-gray-500">Total Verified</div>
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
        {/* Warehouses Section */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">All Warehouses</h3>
          {warehouses.length === 0 ? (
            <div className="text-gray-500">No warehouses found.</div>
          ) : (
            warehouses.map(wh => (
              <div key={wh.id} className="mb-8 p-4 bg-gray-50 rounded shadow">
                <div className="mb-2 font-bold text-green-700">Warehouse: {wh.managerName} ({wh.district})</div>
                <div className="mb-2 text-sm text-gray-700">
                  <span className="mr-4">Address: <strong>{wh.address}</strong></span>
                  <span className="mr-4">Phone: <strong>{wh.phoneNumber}</strong></span>
                </div>
                <h4 className="font-semibold mb-1">Product Summary</h4>
                <table className="min-w-full bg-white border border-gray-200 rounded mb-2">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Total Stock</th>
                      <th>Latest Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(warehouseProductSummaries[wh.id] || []).map(prod => (
                      <tr key={prod.productName} className="cursor-pointer hover:bg-gray-100"
                          onClick={() => handleProductClick(wh.id, prod.productName)}>
                        <td>{prod.productName}</td>
                        <td>{prod.totalStock}</td>
                        <td>{prod.latestPrice}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </div>
        {/* Modal for farmers for a product in a warehouse */}
        {showFarmersModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow max-w-md w-full">
              <h3 className="text-lg font-bold mb-2">Farmers for {selectedWarehouseProduct?.productName} (Warehouse)</h3>
              <table className="min-w-full bg-white border border-gray-200 rounded mb-4">
                <thead>
                  <tr>
                    <th>Farmer</th>
                    <th>Stock</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {farmersForProduct.length === 0 ? (
                    <tr><td colSpan={3} className="text-center py-2 text-gray-500">No farmers found</td></tr>
                  ) : (
                    farmersForProduct.map(f => (
                      <tr key={f.farmerId}>
                        <td>{f.farmerName}</td>
                        <td>{f.stock}</td>
                        <td>{f.price}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <div className="flex justify-end">
                <button className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => setShowFarmersModal(false)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
