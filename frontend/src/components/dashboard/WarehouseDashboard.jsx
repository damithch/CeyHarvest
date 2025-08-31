import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../layout/DashboardLayout';
import EnhancedRegister from '../auth/EnhancedRegister';
import { useNavigate } from 'react-router-dom';

const WarehouseDashboard = () => {
  const navigate = useNavigate();
  
  // State management
  const [userData, setUserData] = useState(null);
  const [warehouseId, setWarehouseId] = useState(null);
  const [showFarmerRegister, setShowFarmerRegister] = useState(false);
  const [farmers, setFarmers] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [loadingFarmers, setLoadingFarmers] = useState(false);
  const [farmerError, setFarmerError] = useState('');
  const [productSummary, setProductSummary] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [farmersForProduct, setFarmersForProduct] = useState([]);
  const [showFarmersModal, setShowFarmersModal] = useState(false);
  const [authError, setAuthError] = useState('');

  // Get warehouse info from localStorage
  const getUserData = useCallback(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        return null;
      }
      
      const userData = JSON.parse(userStr);
      if (!userData || userData.role !== 'WAREHOUSE') {
        return null;
      }
      
      return userData;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }, []);

  // Initialize user data on component mount
  useEffect(() => {
    const data = getUserData();
    if (data) {
      setUserData(data);
      setWarehouseId(data.user?.id || null);
    }
  }, [getUserData]);

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAuthError('No authentication token found. Please login again.');
      return;
    }

    if (!warehouseId) {
      setAuthError('Invalid warehouse data. Please login again.');
      return;
    }

    setAuthError('');
  }, [warehouseId]);

  // Fetch farmers
  const fetchFarmers = useCallback(async () => {
    if (!warehouseId) {
      return;
    }

    setLoadingFarmers(true);
    setFarmerError('');

    try {
      const params = new URLSearchParams({
        search: search.trim(),
        sortBy,
        sortDir,
      });

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`/api/warehouse/${warehouseId}/farmers?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to fetch farmers'}`);
      }

      const data = await response.json();
      setFarmers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching farmers:', err);
      setFarmerError(err.message || 'Failed to fetch farmers');
    } finally {
      setLoadingFarmers(false);
    }
  }, [warehouseId, search, sortBy, sortDir]);

  // Fetch farmers when dependencies change
  useEffect(() => {
    if (warehouseId) {
      fetchFarmers();
    }
  }, [warehouseId, search, sortBy, sortDir, showFarmerRegister]);

  // Fetch product summary
  const fetchProductSummary = useCallback(async () => {
    if (!warehouseId) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`/api/warehouse/${warehouseId}/products/summary`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      setProductSummary(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching product summary:', error);
    }
  }, [warehouseId]);

  useEffect(() => {
    fetchProductSummary();
  }, [fetchProductSummary]);

  // Event handlers
  const handleRegisterFarmer = useCallback(() => {
    setShowFarmerRegister(prev => !prev);
  }, []);

  const handleViewFarmerDetails = useCallback((farmerId) => {
    if (!farmerId) {
      return;
    }
    try {
      navigate(`/warehouse/farmer/${farmerId}`);
    } catch (error) {
      console.error('Navigation error:', error);
      alert('Navigation failed. Please try again.');
    }
  }, [navigate]);

  const handleProductClick = useCallback(async (productName) => {
    setSelectedProduct(productName);
    setShowFarmersModal(true);
    setFarmersForProduct([]);

    if (!warehouseId || !productName) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token');
      }

      const url = `/api/warehouse/${warehouseId}/products/${encodeURIComponent(productName)}/farmers`;
      const response = await fetch(url, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      setFarmersForProduct(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching farmers for product:', error);
    }
  }, [warehouseId]);

  const handleCloseModal = useCallback(() => {
    setShowFarmersModal(false);
    setSelectedProduct(null);
    setFarmersForProduct([]);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearch(e.target.value);
  }, []);

  const handleSortByChange = useCallback((e) => {
    setSortBy(e.target.value);
  }, []);

  const handleSortDirChange = useCallback((e) => {
    setSortDir(e.target.value);
  }, []);

  // Show error if authentication issues
  if (authError) {
    return (
      <DashboardLayout title="Warehouse Dashboard">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">⚠️ Authentication Error</div>
            <p className="text-gray-600 mb-4">{authError}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Loading state
  if (!warehouseId) {
    return (
      <DashboardLayout title="Warehouse Dashboard">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading warehouse information...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Warehouse Dashboard">
      <div className="space-y-8 max-w-7xl mx-auto px-4 py-6">
        {/* Warehouse Info Card */}
        {userData?.user && (
          <div className="bg-white rounded-xl shadow-lg border border-green-100">
            <div className="flex flex-col md:flex-row items-center justify-between p-6">
              <div className="flex items-center gap-4 mb-4 md:mb-0">
                <div className="bg-green-100 text-green-700 rounded-full w-16 h-16 flex items-center justify-center text-3xl font-bold">
                  🏪
                </div>
                <div>
                  <div className="text-xl font-bold text-green-700">{userData.user.managerName}</div>
                  <div className="text-sm text-gray-600">Manager</div>
                </div>
              </div>
              <div className="flex flex-col gap-1 text-sm text-gray-700">
                <div><span className="font-semibold">District:</span> {userData.user.district}</div>
                <div><span className="font-semibold">Address:</span> {userData.user.address}</div>
                <div><span className="font-semibold">Phone:</span> {userData.user.phoneNumber}</div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <button
            type="button"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 active:bg-blue-800 flex items-center gap-2 transition-all duration-200 transform hover:scale-105"
            onClick={handleRegisterFarmer}
          >
            <span>👤</span>
            {showFarmerRegister ? 'Close Farmer Registration' : 'Register Farmer'}
          </button>
          
          <button
            type="button"
            className="bg-purple-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-purple-700 active:bg-purple-800 transition-all duration-200 transform hover:scale-105"
            onClick={fetchFarmers}
          >
            🔄 Refresh Farmers
          </button>
        </div>

        {/* Farmer Registration Form */}
        {showFarmerRegister && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Register New Farmer</h3>
            <EnhancedRegister 
              warehouseId={warehouseId} 
              onSuccess={() => {
                setShowFarmerRegister(false);
                fetchFarmers();
              }}
            />
          </div>
        )}

        {/* Farmer Management Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Farmers Associated with This Warehouse</h3>
            
            {/* Search and Filter Form */}
            <form
              className="flex flex-col md:flex-row md:items-center gap-4 mb-6"
              onSubmit={(e) => {
                e.preventDefault();
                fetchFarmers();
              }}
            >
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search farmers by name, email, or phone..."
                  value={search}
                  onChange={handleSearchChange}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={sortBy}
                onChange={handleSortByChange}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="createdAt">Sort by: Created At</option>
                <option value="firstName">First Name</option>
                <option value="lastName">Last Name</option>
                <option value="email">Email</option>
                <option value="phoneNumber">Phone Number</option>
              </select>
              
              <select
                value={sortDir}
                onChange={handleSortDirChange}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
              
              <button
                type="submit"
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                🔍 Search
              </button>
            </form>

            {/* Farmers Table */}
            {loadingFarmers ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading farmers...</p>
              </div>
            ) : farmerError ? (
              <div className="text-center py-8">
                <div className="text-red-600 text-lg mb-2">❌ {farmerError}</div>
                <button
                  onClick={fetchFarmers}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  🔄 Retry
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full bg-white">
                  <thead className="bg-green-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        First Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {farmers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          <div className="text-4xl mb-2">📝</div>
                          No farmers found for this warehouse.
                          {search && <p className="mt-2 text-sm">Try adjusting your search criteria.</p>}
                        </td>
                      </tr>
                    ) : (
                      farmers.map(farmer => (
                        <tr key={farmer.id} className="hover:bg-green-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {farmer.firstName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {farmer.lastName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {farmer.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {farmer.phoneNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {farmer.createdAt ? new Date(farmer.createdAt).toLocaleString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              type="button"
                              className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 active:bg-green-800 transition-colors text-xs"
                              onClick={() => handleViewFarmerDetails(farmer.id)}
                            >
                              📋 View Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Warehouse Product Summary Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Warehouse Product Summary</h3>
            
            {productSummary.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📦</div>
                <p>No products found in this warehouse.</p>
                <button
                  onClick={fetchProductSummary}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  🔄 Refresh Products
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full bg-white">
                  <thead className="bg-green-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Latest Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {productSummary.map(prod => (
                      <tr
                        key={prod.productName}
                        className="cursor-pointer hover:bg-green-50 transition-colors"
                        onClick={() => handleProductClick(prod.productName)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <div className="flex items-center gap-2">
                            <span>🛒</span>
                            {prod.productName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {prod.totalStock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          Rs {prod.latestPrice}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Farmers Modal */}
        {showFarmersModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleCloseModal();
              }
            }}
          >
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    🧑‍🌾 Farmers for {selectedProduct}
                  </h3>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                    onClick={handleCloseModal}
                  >
                    ×
                  </button>
                </div>
                
                <div className="overflow-y-auto max-h-64">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Farmer
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Stock
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Price
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {farmersForProduct.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                            <div className="text-2xl mb-2">🔍</div>
                            No farmers found for this product
                          </td>
                        </tr>
                      ) : (
                        farmersForProduct.map(f => (
                          <tr key={f.farmerId} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm text-gray-900">{f.farmerName}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{f.stock}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">Rs {f.price}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                
                <div className="flex justify-end mt-6">
                  <button
                    type="button"
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    onClick={handleCloseModal}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <p className="text-gray-600">
            🏪 This is your warehouse dashboard. All features for managing inventory, orders, and reports are now functional.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WarehouseDashboard;