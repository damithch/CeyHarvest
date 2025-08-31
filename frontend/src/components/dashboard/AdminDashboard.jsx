import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layout/DashboardLayout';
import UserManagement from '../user/UserManagement';
import {
  BarChart3, Users, Truck, Package, FileText, Settings,
  Plus, X, Menu, Bell, Search, ChevronDown, Home, TrendingUp,
  Activity, Shield, Database, Warehouse, CheckCircle, UserCheck,
  LogOut, User, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle', 'Gampaha', 'Hambantota',
  'Jaffna', 'Kalutara', 'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar', 'Matale',
  'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya', 'Polonnaruwa', 'Puttalam', 'Ratnapura',
  'Trincomalee', 'Vavuniya'
];

const AdminDashboard = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [stats, setStats] = useState({
    totalFarmers: 0,
    totalBuyers: 0,
    totalDrivers: 0,
    totalAdmins: 0,
    totalProducts: 0,
    totalOrders: 0,
    verifiedFarmers: 0,
    verifiedBuyers: 0,
    verifiedDrivers: 0,
    totalVerifiedUsers: 0
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
  const { user, logout } = useAuth();

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

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { 
      id: 'users', 
      label: 'User Management', 
      icon: Users, 
      children: [
        { id: 'farmers', label: 'Farmers', icon: Users, count: stats.totalFarmers },
        { id: 'buyers', label: 'Buyers', icon: UserCheck, count: stats.totalBuyers },
        { id: 'drivers', label: 'Drivers', icon: Truck, count: stats.totalDrivers },
        { id: 'all-users', label: 'All Users', icon: Shield, count: stats.totalFarmers + stats.totalBuyers + stats.totalDrivers }
      ]
    },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'warehouses', label: 'Warehouses', icon: Warehouse },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

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
        fetchWarehouses();
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

  const handleLogout = () => {
    logout();
  };

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="group relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity duration-300" style={{ background: color }}></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl shadow-lg ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend && (
            <div className="flex items-center space-x-1 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">{trend}</span>
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            {value?.toLocaleString() || 0}
          </p>
        </div>
      </div>
    </div>
  );

  // Render user management views
  if (['farmers', 'buyers', 'drivers', 'all-users'].includes(currentView)) {
    const userTypeMap = {
      'farmers': 'FARMER',
      'buyers': 'BUYER', 
      'drivers': 'DRIVER',
      'all-users': 'ALL'
    };
    return <UserManagement userType={userTypeMap[currentView]} onBack={() => setCurrentView('dashboard')} />;
  }

  const renderDashboardContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            {/* Welcome Header */}
            <div className="text-center space-y-4 py-8">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Manage and monitor your agricultural platform with comprehensive insights and controls
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Farmers"
                value={stats.totalFarmers || 0}
                icon={Users}
                color="bg-gradient-to-br from-emerald-500 to-green-600"
                trend="+12%"
              />
              <StatCard
                title="Total Buyers"
                value={stats.totalBuyers || 0}
                icon={UserCheck}
                color="bg-gradient-to-br from-blue-500 to-cyan-600"
                trend="+8%"
              />
              <StatCard
                title="Total Drivers"
                value={stats.totalDrivers || 0}
                icon={Truck}
                color="bg-gradient-to-br from-violet-500 to-purple-600"
                trend="+5%"
              />
              <StatCard
                title="Total Admins"
                value={stats.totalAdmins || 0}
                icon={Shield}
                color="bg-gradient-to-br from-rose-500 to-pink-600"
                trend="+2%"
              />
            </div>

            {/* Quick Actions */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Quick Actions</h2>
                  <p className="text-gray-600 mt-2">Manage your platform efficiently</p>
                </div>
                <button
                  onClick={() => setShowWarehouseForm(!showWarehouseForm)}
                  className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  {showWarehouseForm ? <X className="w-5 h-5" /> : <Warehouse className="w-5 h-5" />}
                  <span>{showWarehouseForm ? 'Close Form' : 'Register Warehouse'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="group p-8 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-200 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-emerald-900">User Management</h3>
                  </div>
                  <div className="space-y-4">
                    {[
                      { id: 'farmers', label: 'Manage Farmers', color: 'emerald', count: stats.totalFarmers },
                      { id: 'buyers', label: 'Manage Buyers', color: 'blue', count: stats.totalBuyers },
                      { id: 'drivers', label: 'Manage Drivers', color: 'violet', count: stats.totalDrivers }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setCurrentView(item.id)}
                        className="w-full flex items-center justify-between p-4 bg-white/70 hover:bg-white/90 rounded-xl transition-all duration-200 group/btn"
                      >
                        <span className={`text-${item.color}-700 font-semibold`}>{item.label}</span>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 bg-${item.color}-200 text-${item.color}-800 text-sm rounded-full font-medium group-hover/btn:scale-110 transition-transform`}>
                            {item.count || 0}
                          </span>
                          <ChevronRight className={`w-4 h-4 text-${item.color}-500 group-hover/btn:translate-x-1 transition-transform`} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="group p-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-amber-900">Product Management</h3>
                  </div>
                  <div className="space-y-4">
                    <button 
                      onClick={() => setCurrentView('products')}
                      className="w-full flex items-center justify-between p-4 bg-white/70 hover:bg-white/90 rounded-xl transition-all duration-200 group/btn"
                    >
                      <span className="text-amber-700 font-semibold">View All Products</span>
                      <ChevronRight className="w-4 h-4 text-amber-500 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                    <button className="w-full flex items-center justify-between p-4 bg-white/70 hover:bg-white/90 rounded-xl transition-all duration-200 group/btn">
                      <span className="text-orange-700 font-semibold">Pending Approvals</span>
                      <span className="px-3 py-1 bg-orange-200 text-orange-800 text-sm rounded-full font-medium">0</span>
                    </button>
                    <button className="w-full flex items-center justify-between p-4 bg-white/70 hover:bg-white/90 rounded-xl transition-all duration-200 group/btn">
                      <span className="text-red-700 font-semibold">Reported Products</span>
                      <span className="px-3 py-1 bg-red-200 text-red-800 text-sm rounded-full font-medium">0</span>
                    </button>
                  </div>
                </div>

                <div className="group p-8 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-200 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                      <Settings className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-purple-900">System Settings</h3>
                  </div>
                  <div className="space-y-4">
                    <button 
                      onClick={() => setCurrentView('settings')}
                      className="w-full flex items-center justify-between p-4 bg-white/70 hover:bg-white/90 rounded-xl transition-all duration-200 group/btn"
                    >
                      <span className="text-purple-700 font-semibold">Configuration</span>
                      <ChevronRight className="w-4 h-4 text-purple-500 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                    <button 
                      onClick={() => setCurrentView('analytics')}
                      className="w-full flex items-center justify-between p-4 bg-white/70 hover:bg-white/90 rounded-xl transition-all duration-200 group/btn"
                    >
                      <span className="text-indigo-700 font-semibold">Analytics</span>
                      <ChevronRight className="w-4 h-4 text-indigo-500 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                    <button className="w-full flex items-center justify-between p-4 bg-white/70 hover:bg-white/90 rounded-xl transition-all duration-200 group/btn">
                      <span className="text-slate-700 font-semibold">Maintenance</span>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Warehouse Registration Form */}
            {showWarehouseForm && (
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
                    <Warehouse className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">Register New Warehouse</h2>
                    <p className="text-gray-600 mt-1">Add a new warehouse to your network</p>
                  </div>
                </div>
                <form onSubmit={handleWarehouseSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Manager Name</label>
                      <input
                        type="text"
                        name="managerName"
                        value={warehouseForm.managerName}
                        onChange={handleWarehouseInputChange}
                        className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter manager name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">District</label>
                      <select
                        name="district"
                        value={warehouseForm.district}
                        onChange={handleWarehouseInputChange}
                        className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="">Select District</option>
                        {DISTRICTS.map((district) => (
                          <option key={district} value={district}>{district}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Address</label>
                      <input
                        type="text"
                        name="address"
                        value={warehouseForm.address}
                        onChange={handleWarehouseInputChange}
                        className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter warehouse address"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Phone Number</label>
                      <input
                        type="text"
                        name="phoneNumber"
                        value={warehouseForm.phoneNumber}
                        onChange={handleWarehouseInputChange}
                        className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Password</label>
                      <input
                        type="password"
                        name="password"
                        value={warehouseForm.password}
                        onChange={handleWarehouseInputChange}
                        className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter password"
                      />
                    </div>
                    {formError && (
                      <div className="md:col-span-2">
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                          <p className="text-red-600 text-sm font-medium">{formError}</p>
                        </div>
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                      >
                        Register Warehouse
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* Two Column Layout for Verification Stats and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Verification Statistics */}
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Verification Statistics</h2>
                    <p className="text-gray-600">Email verification status</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.verifiedFarmers || 0}</p>
                    <p className="text-sm text-gray-600 font-medium mt-1">Verified Farmers</p>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                      <UserCheck className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.verifiedBuyers || 0}</p>
                    <p className="text-sm text-gray-600 font-medium mt-1">Verified Buyers</p>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-200">
                    <div className="w-16 h-16 bg-gradient-to-br from-violet-400 to-purple-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                      <Truck className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.verifiedDrivers || 0}</p>
                    <p className="text-sm text-gray-600 font-medium mt-1">Verified Drivers</p>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalVerifiedUsers || 0}</p>
                    <p className="text-sm text-gray-600 font-medium mt-1">Total Verified</p>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
                <div className="p-8 border-b border-gray-100">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                      <Activity className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
                      <p className="text-gray-600">Latest system activities</p>
                    </div>
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {recentActivity.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {recentActivity.map((activity, index) => (
                        <div key={index} className="p-6 hover:bg-gray-50/50 transition-colors duration-200">
                          <div className="flex items-center space-x-4">
                            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                              <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center text-gray-500">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl mx-auto mb-6 flex items-center justify-center">
                        <FileText className="w-10 h-10 text-gray-400" />
                      </div>
                      <p className="font-semibold text-lg">No recent activity</p>
                      <p className="text-sm text-gray-400 mt-2">Activities will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'warehouses':
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Warehouse Management
                </h1>
                <p className="text-gray-600 mt-2">View and manage all warehouses in your network</p>
              </div>
              <button
                onClick={() => setShowWarehouseForm(!showWarehouseForm)}
                className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
                <span>Add Warehouse</span>
              </button>
            </div>

            {warehouses.length === 0 ? (
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-12 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl mx-auto mb-6 flex items-center justify-center">
                  <Warehouse className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No warehouses found</h3>
                <p className="text-gray-600">Register your first warehouse to get started</p>
              </div>
            ) : (
              <div className="grid gap-8">
                {warehouses.map(wh => (
                  <div key={wh.id} className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
                    <div className="p-8 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl">
                            <Warehouse className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900">{wh.managerName}</h2>
                            <p className="text-emerald-600 font-semibold">{wh.district}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Address</p>
                          <p className="font-semibold text-gray-900">{wh.address}</p>
                          <p className="text-sm text-gray-600 mt-1">Phone: {wh.phoneNumber}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <Package className="w-6 h-6 mr-2 text-blue-600" />
                        Product Summary
                      </h3>
                      
                      {(warehouseProductSummaries[wh.id] || []).length === 0 ? (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500 font-medium">No products available</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full bg-white rounded-xl shadow-lg overflow-hidden">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                              <tr>
                                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Total Stock</th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Latest Price</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {(warehouseProductSummaries[wh.id] || []).map(prod => (
                                <tr 
                                  key={prod.productName} 
                                  className="cursor-pointer hover:bg-blue-50 transition-colors duration-200"
                                  onClick={() => handleProductClick(wh.id, prod.productName)}
                                >
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-semibold text-gray-900">{prod.productName}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-green-100 text-green-800">
                                      {prod.totalStock}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm font-bold text-gray-900">Rs. {prod.latestPrice}</span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl mx-auto mb-6 flex items-center justify-center">
              <Settings className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Coming Soon</h2>
            <p className="text-gray-600 text-lg">This feature is under development</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Top Navigation Bar */}
      <nav className="bg-white/95 backdrop-blur-lg border-b border-white/20 shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 lg:hidden"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
                    AgriAdmin
                  </h1>
                  <p className="text-xs text-gray-500 font-medium">Management Portal</p>
                </div>
              </div>
            </div>

            {/* Search and Actions */}
            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search anything..."
                  className="pl-12 pr-4 py-3 w-80 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 text-sm"
                />
              </div>
              
              <button className="relative p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-2xl transition-all duration-200">
                <Bell className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">3</span>
              </button>

              {/* User Profile Dropdown */}
              <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-2xl">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-gray-900">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-40 w-80 bg-white/95 backdrop-blur-lg shadow-2xl border-r border-white/20 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 mt-20 lg:mt-0`}>
          <div className="flex flex-col h-full pt-6 pb-4">
            <div className="px-6 mb-8">
              <h2 className="text-lg font-bold text-gray-900">Navigation</h2>
              <p className="text-sm text-gray-600">Manage your platform</p>
            </div>
            
            <nav className="flex-1 px-4 space-y-2">
              {navigationItems.map((item) => (
                <div key={item.id}>
                  <button
                    onClick={() => setCurrentView(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-2xl transition-all duration-200 ${
                      currentView === item.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.children && (
                      <ChevronDown className={`w-4 h-4 transition-transform ${
                        currentView === item.id ? 'rotate-180' : ''
                      }`} />
                    )}
                  </button>
                  
                  {/* Sub-navigation for User Management */}
                  {item.children && currentView === item.id && (
                    <div className="mt-2 ml-4 space-y-1">
                      {item.children.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => setCurrentView(child.id)}
                          className="w-full flex items-center justify-between px-4 py-2 text-left text-sm rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
                        >
                          <div className="flex items-center space-x-3">
                            <child.icon className="w-4 h-4" />
                            <span>{child.label}</span>
                          </div>
                          {child.count !== undefined && (
                            <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full font-medium">
                              {child.count}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {renderDashboardContent()}
          </div>
        </main>
      </div>

      {/* Modal for farmers for a product in a warehouse */}
      {showFarmersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-96 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Farmers for {selectedWarehouseProduct?.productName}
                  </h3>
                  <p className="text-gray-600">Warehouse inventory details</p>
                </div>
                <button
                  onClick={() => setShowFarmersModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="overflow-y-auto max-h-80">
              {farmersForProduct.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No farmers found for this product</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Farmer</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Stock</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {farmersForProduct.map(f => (
                        <tr key={f.farmerId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">{f.farmerName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-green-100 text-green-800">
                              {f.stock}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-bold text-gray-900">Rs. {f.price}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;