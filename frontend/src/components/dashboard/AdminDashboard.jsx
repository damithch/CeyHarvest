import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Truck, Package, FileText, Settings, Plus, X, Menu, Bell, Search, ChevronDown } from 'lucide-react';

const DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle', 'Gampaha', 'Hambantota',
  'Jaffna', 'Kalutara', 'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar', 'Matale',
  'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya', 'Polonnaruwa', 'Puttalam', 'Ratnapura',
  'Trincomalee', 'Vavuniya'
];

// Mock UserManagement component for demo
const UserManagement = ({ userType, onBack }) => (
  <div className="min-h-screen bg-gray-50">
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 capitalize">
            {userType === 'all-users' ? 'All Users' : userType} Management
          </h1>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-700">
          {userType === 'all-users' ? 'All Users' : userType.charAt(0).toUpperCase() + userType.slice(1)} Management Interface
        </h2>
        <p className="text-gray-500 mt-2">User management functionality would be implemented here</p>
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState({
    totalFarmers: 1250,
    totalBuyers: 890,
    totalDrivers: 340,
    totalAdmins: 12,
    totalProducts: 5680,
    totalOrders: 2340,
    verifiedFarmers: 1180,
    verifiedBuyers: 820,
    verifiedDrivers: 310,
    totalVerifiedUsers: 2310
  });
  const [recentActivity, setRecentActivity] = useState([
    { description: 'New farmer registered from Colombo district', timestamp: '2 minutes ago' },
    { description: 'Order #ORD-2024-001 completed successfully', timestamp: '15 minutes ago' },
    { description: 'Product approval request from farmer John Doe', timestamp: '1 hour ago' },
    { description: 'New warehouse registered in Kandy', timestamp: '2 hours ago' },
    { description: 'System backup completed', timestamp: '3 hours ago' }
  ]);
  const [showWarehouseForm, setShowWarehouseForm] = useState(false);
  const [warehouseForm, setWarehouseForm] = useState({
    managerName: '',
    district: '',
    address: '',
    phoneNumber: '',
    password: ''
  });
  const [formError, setFormError] = useState('');

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'farmers', label: 'Farmers', icon: Users, count: stats.totalFarmers },
    { id: 'buyers', label: 'Buyers', icon: Users, count: stats.totalBuyers },
    { id: 'drivers', label: 'Drivers', icon: Truck, count: stats.totalDrivers },
    { id: 'all-users', label: 'All Users', icon: Users, count: stats.totalFarmers + stats.totalBuyers + stats.totalDrivers },
    { id: 'products', label: 'Products', icon: Package, count: stats.totalProducts },
    { id: 'orders', label: 'Orders', icon: FileText, count: stats.totalOrders },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  useEffect(() => {
    // Simulate API calls - in real app these would be actual API calls
    // fetchStats();
    // fetchRecentActivity();
  }, []);

  const handleWarehouseInputChange = (e) => {
    const { name, value } = e.target;
    setWarehouseForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleWarehouseSubmit = async (e) => {
    e.preventDefault();
    if (!warehouseForm.managerName || !warehouseForm.district || !warehouseForm.address || !warehouseForm.phoneNumber || !warehouseForm.password) {
      setFormError('All fields are required.');
      return;
    }
    setFormError('');
    try {
      // In real app, this would use actual localStorage and API
      // const token = localStorage.getItem('token');
      // const response = await fetch('/api/admin/warehouses/register', { ... });

      // Simulate success
      alert('Warehouse registered successfully!');
      setShowWarehouseForm(false);
      setWarehouseForm({ managerName: '', district: '', address: '', phoneNumber: '', password: '' });
    } catch (err) {
      setFormError('Network error. Please try again.');
    }
  };

  const StatCard = ({ title, value, icon: Icon, trend, trendValue }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value?.toLocaleString() || 0}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? '↗' : '↘'} {trendValue}% from last month
            </p>
          )}
        </div>
        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  // Handle navigation for user management views
  if (['farmers', 'buyers', 'drivers', 'all-users'].includes(currentView)) {
    return <UserManagement userType={currentView} onBack={() => setCurrentView('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-xl transition-colors ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.count && (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      isActive ? 'bg-white bg-opacity-20' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                A
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">Super Administrator</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="relative p-2 rounded-lg hover:bg-gray-100">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Farmers" value={stats.totalFarmers} icon={Users} trend="up" trendValue="12" />
            <StatCard title="Total Buyers" value={stats.totalBuyers} icon={Users} trend="up" trendValue="8" />
            <StatCard title="Total Drivers" value={stats.totalDrivers} icon={Truck} trend="up" trendValue="5" />
            <StatCard title="Total Products" value={stats.totalProducts} icon={Package} trend="up" trendValue="15" />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Product Management */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Management</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  <span className="text-blue-700 font-medium">View All Products</span>
                  <Package className="w-4 h-4 text-blue-500" />
                </button>
                <button className="w-full flex items-center justify-between p-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors">
                  <span className="text-yellow-700 font-medium">Pending Approvals</span>
                  <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded-full">12</span>
                </button>
                <button className="w-full flex items-center justify-between p-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                  <span className="text-red-700 font-medium">Reported Products</span>
                  <span className="px-2 py-1 bg-red-200 text-red-800 text-xs rounded-full">3</span>
                </button>
              </div>
            </div>

            {/* System Management */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Management</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <span className="text-gray-700 font-medium">System Configuration</span>
                  <Settings className="w-4 h-4 text-gray-500" />
                </button>
                <button className="w-full flex items-center justify-between p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
                  <span className="text-indigo-700 font-medium">Reports & Analytics</span>
                  <BarChart3 className="w-4 h-4 text-indigo-500" />
                </button>
                <button className="w-full flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                  <span className="text-purple-700 font-medium">Backup & Maintenance</span>
                  <Settings className="w-4 h-4 text-purple-500" />
                </button>
              </div>
            </div>

            {/* Warehouse Registration */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Warehouse Management</h3>
              <button
                onClick={() => setShowWarehouseForm(!showWarehouseForm)}
                className="w-full flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-colors"
              >
                {showWarehouseForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span className="font-medium">
                  {showWarehouseForm ? 'Close Form' : 'Register New Warehouse'}
                </span>
              </button>
            </div>
          </div>

          {/* Warehouse Registration Form */}
          {showWarehouseForm && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Register New Warehouse</h3>
              <form onSubmit={handleWarehouseSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Manager Name</label>
                    <input
                      type="text"
                      name="managerName"
                      value={warehouseForm.managerName}
                      onChange={handleWarehouseInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter manager name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                    <select
                      name="district"
                      value={warehouseForm.district}
                      onChange={handleWarehouseInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select District</option>
                      {DISTRICTS.map((district) => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={warehouseForm.address}
                      onChange={handleWarehouseInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter warehouse address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="text"
                      name="phoneNumber"
                      value={warehouseForm.phoneNumber}
                      onChange={handleWarehouseInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={warehouseForm.password}
                      onChange={handleWarehouseInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter password"
                    />
                  </div>
                  {formError && (
                    <div className="md:col-span-2">
                      <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{formError}</p>
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                    >
                      Register Warehouse
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Verification Statistics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Email Verification Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl mx-auto mb-3 flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.verifiedFarmers || 0}</p>
                <p className="text-sm text-gray-600">Verified Farmers</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl mx-auto mb-3 flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.verifiedBuyers || 0}</p>
                <p className="text-sm text-gray-600">Verified Buyers</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl mx-auto mb-3 flex items-center justify-center">
                  <Truck className="w-8 h-8 text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.verifiedDrivers || 0}</p>
                <p className="text-sm text-gray-600">Verified Drivers</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl mx-auto mb-3 flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalVerifiedUsers || 0}</p>
                <p className="text-sm text-gray-600">Total Verified</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <p className="text-sm text-gray-500">Latest system activities and user actions</p>
            </div>
            <div className="divide-y divide-gray-100">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={index} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">{activity.timestamp}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-gray-500">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default AdminDashboard;