import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layout/DashboardLayout';
import UserManagement from '../user/UserManagement';
import {
  BarChart3, Users, Truck, Package, FileText, Settings,
  Plus, X, Menu, Bell, Search, ChevronDown, Home, TrendingUp,
  Activity, Shield, Database, Warehouse, CheckCircle, UserCheck
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

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, active: currentView === 'dashboard' },
    { id: 'farmers', label: 'Farmers', icon: Users, active: currentView === 'farmers', count: stats.totalFarmers },
    { id: 'buyers', label: 'Buyers', icon: UserCheck, active: currentView === 'buyers', count: stats.totalBuyers },
    { id: 'drivers', label: 'Drivers', icon: Truck, active: currentView === 'drivers', count: stats.totalDrivers },
    { id: 'all-users', label: 'All Users', icon: Shield, active: currentView === 'all-users', count: stats.totalFarmers + stats.totalBuyers + stats.totalDrivers },
    { id: 'products', label: 'Products', icon: Package, active: currentView === 'products' },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, active: currentView === 'analytics' },
    { id: 'settings', label: 'Settings', icon: Settings, active: currentView === 'settings' },
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

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Modern Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-white/20 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Admin Portal
                  </h1>
                </div>
              </div>

              <div className="hidden md:flex items-center space-x-1">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                      item.active
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>
                    {item.count !== undefined && (
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        item.active ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {item.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
                />
              </div>
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Header */}
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
              Welcome to Admin Dashboard
            </h2>
            <p className="text-gray-600 text-lg">Monitor and manage your agricultural platform</p>
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
              color="bg-gradient-to-br from-slate-500 to-gray-600"
              trend="+5%"
            />
            <StatCard
              title="Total Admins"
              value={stats.totalAdmins || 0}
              icon={Shield}
              color="bg-gradient-to-br from-red-500 to-pink-600"
              trend="+2%"
            />
          </div>

          {/* Quick Actions */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Quick Actions</h3>
                <p className="text-gray-600">Manage your platform efficiently</p>
              </div>
              <button
                onClick={() => setShowWarehouseForm(!showWarehouseForm)}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {showWarehouseForm ? <X className="w-5 h-5" /> : <Warehouse className="w-5 h-5" />}
                <span>{showWarehouseForm ? 'Close Form' : 'Register Warehouse'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="group p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-emerald-500 rounded-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-emerald-900">User Management</h4>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => setCurrentView('farmers')}
                    className="w-full flex items-center justify-between p-3 bg-white/50 hover:bg-white/80 rounded-lg transition-all duration-200 group"
                  >
                    <span className="text-emerald-700 font-medium">Manage Farmers</span>
                    <span className="px-2 py-1 bg-emerald-200 text-emerald-800 text-xs rounded-full group-hover:scale-110 transition-transform">
                      {stats.totalFarmers || 0}
                    </span>
                  </button>
                  <button
                    onClick={() => setCurrentView('buyers')}
                    className="w-full flex items-center justify-between p-3 bg-white/50 hover:bg-white/80 rounded-lg transition-all duration-200 group"
                  >
                    <span className="text-blue-700 font-medium">Manage Buyers</span>
                    <span className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded-full group-hover:scale-110 transition-transform">
                      {stats.totalBuyers || 0}
                    </span>
                  </button>
                  <button
                    onClick={() => setCurrentView('drivers')}
                    className="w-full flex items-center justify-between p-3 bg-white/50 hover:bg-white/80 rounded-lg transition-all duration-200 group"
                  >
                    <span className="text-gray-700 font-medium">Manage Drivers</span>
                    <span className="px-2 py-1 bg-gray-200 text-gray-800 text-xs rounded-full group-hover:scale-110 transition-transform">
                      {stats.totalDrivers || 0}
                    </span>
                  </button>
                </div>
              </div>

              <div className="group p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-amber-500 rounded-lg">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-amber-900">Product Management</h4>
                </div>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-3 bg-white/50 hover:bg-white/80 rounded-lg transition-all duration-200">
                    <span className="text-amber-700 font-medium">View All Products</span>
                    <Package className="w-4 h-4 text-amber-500" />
                  </button>
                  <button className="w-full flex items-center justify-between p-3 bg-white/50 hover:bg-white/80 rounded-lg transition-all duration-200">
                    <span className="text-orange-700 font-medium">Pending Approvals</span>
                    <span className="px-2 py-1 bg-orange-200 text-orange-800 text-xs rounded-full">0</span>
                  </button>
                  <button className="w-full flex items-center justify-between p-3 bg-white/50 hover:bg-white/80 rounded-lg transition-all duration-200">
                    <span className="text-red-700 font-medium">Reported Products</span>
                    <span className="px-2 py-1 bg-red-200 text-red-800 text-xs rounded-full">0</span>
                  </button>
                </div>
              </div>

              <div className="group p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-purple-900">System Settings</h4>
                </div>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-3 bg-white/50 hover:bg-white/80 rounded-lg transition-all duration-200">
                    <span className="text-purple-700 font-medium">Configuration</span>
                    <Settings className="w-4 h-4 text-purple-500" />
                  </button>
                  <button className="w-full flex items-center justify-between p-3 bg-white/50 hover:bg-white/80 rounded-lg transition-all duration-200">
                    <span className="text-indigo-700 font-medium">Analytics</span>
                    <BarChart3 className="w-4 h-4 text-indigo-500" />
                  </button>
                  <button className="w-full flex items-center justify-between p-3 bg-white/50 hover:bg-white/80 rounded-lg transition-all duration-200">
                    <span className="text-slate-700 font-medium">Maintenance</span>
                    <Database className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Warehouse Registration Form */}
          {showWarehouseForm && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg">
                  <Warehouse className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Register New Warehouse</h3>
                  <p className="text-gray-600">Add a new warehouse to your network</p>
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
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
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
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Verification Statistics</h3>
                  <p className="text-gray-600">Email verification status</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl mx-auto mb-3 flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.verifiedFarmers || 0}</p>
                  <p className="text-sm text-gray-600 font-medium">Verified Farmers</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl mx-auto mb-3 flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.verifiedBuyers || 0}</p>
                  <p className="text-sm text-gray-600 font-medium">Verified Buyers</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl border border-slate-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-gray-500 rounded-xl mx-auto mb-3 flex items-center justify-center">
                    <Truck className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.verifiedDrivers || 0}</p>
                  <p className="text-sm text-gray-600 font-medium">Verified Drivers</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl mx-auto mb-3 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalVerifiedUsers || 0}</p>
                  <p className="text-sm text-gray-600 font-medium">Total Verified</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
                    <p className="text-gray-600">Latest system activities</p>
                  </div>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {recentActivity.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="p-4 hover:bg-gray-50/50 transition-colors duration-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                            <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="font-medium">No recent activity</p>
                    <p className="text-sm text-gray-400 mt-1">Activities will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
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
    </div>
  );
};

export default AdminDashboard;