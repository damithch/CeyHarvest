import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layout/DashboardLayout';
import EnhancedRegister from '../auth/EnhancedRegister';
import { useNavigate } from 'react-router-dom';

const WarehouseDashboard = () => {
  // Get warehouse info from localStorage (set after login)
  const userData = JSON.parse(localStorage.getItem('user'));
  const warehouse = userData && userData.role === 'WAREHOUSE' ? userData.user : null;
  const warehouseId = warehouse ? warehouse.id : null;
  const [showFarmerRegister, setShowFarmerRegister] = useState(false);
  const navigate = useNavigate();

  // Farmer management state
  const [farmers, setFarmers] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [loadingFarmers, setLoadingFarmers] = useState(false);
  const [farmerError, setFarmerError] = useState('');

  // Fetch farmers for this warehouse
  useEffect(() => {
    if (!warehouseId) return;
    const fetchFarmers = async () => {
      setLoadingFarmers(true);
      setFarmerError('');
      try {
        const params = new URLSearchParams({
          search,
          sortBy,
          sortDir,
        });
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/warehouse/${warehouseId}/farmers?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const data = await response.json();
          setFarmers(data);
        } else {
          setFarmerError('Failed to fetch farmers');
        }
      } catch (err) {
        setFarmerError('Network error');
      } finally {
        setLoadingFarmers(false);
      }
    };
    fetchFarmers();
  }, [warehouseId, search, sortBy, sortDir, showFarmerRegister]);

  return (
    <DashboardLayout title="Warehouse Dashboard">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-green-700">Welcome, Warehouse Manager!</h2>
        {warehouse && (
          <div className="bg-white rounded shadow p-4 mb-4">
            <div><strong>Manager Name:</strong> {warehouse.managerName}</div>
            <div><strong>District:</strong> {warehouse.district}</div>
            <div><strong>Address:</strong> {warehouse.address}</div>
            <div><strong>Phone Number:</strong> {warehouse.phoneNumber}</div>
          </div>
        )}
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => setShowFarmerRegister((prev) => !prev)}
        >
          {showFarmerRegister ? 'Close Farmer Registration' : 'Register Farmer'}
        </button>
        {showFarmerRegister && (
          <div className="mt-6">
            <EnhancedRegister warehouseId={warehouseId} />
          </div>
        )}
        {/* Farmer Management Section */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-2">Farmers Associated with This Warehouse</h3>
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4 space-y-2 md:space-y-0">
            <input
              type="text"
              placeholder="Search farmers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 w-full md:w-64"
            />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1"
            >
              <option value="createdAt">Sort by: Created At</option>
              <option value="firstName">First Name</option>
              <option value="lastName">Last Name</option>
              <option value="email">Email</option>
              <option value="phoneNumber">Phone Number</option>
            </select>
            <select
              value={sortDir}
              onChange={e => setSortDir(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
          {loadingFarmers ? (
            <div>Loading farmers...</div>
          ) : farmerError ? (
            <div className="text-red-600">{farmerError}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded">
                <thead>
                  <tr>
                    <th className="px-4 py-2 border-b">First Name</th>
                    <th className="px-4 py-2 border-b">Last Name</th>
                    <th className="px-4 py-2 border-b">Email</th>
                    <th className="px-4 py-2 border-b">Phone</th>
                    <th className="px-4 py-2 border-b">Created At</th>
                    <th className="px-4 py-2 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {farmers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-gray-500">No farmers found for this warehouse.</td>
                    </tr>
                  ) : (
                    farmers.map(farmer => (
                      <tr key={farmer.id}>
                        <td className="px-4 py-2 border-b">{farmer.firstName}</td>
                        <td className="px-4 py-2 border-b">{farmer.lastName}</td>
                        <td className="px-4 py-2 border-b">{farmer.email}</td>
                        <td className="px-4 py-2 border-b">{farmer.phoneNumber}</td>
                        <td className="px-4 py-2 border-b">{farmer.createdAt ? new Date(farmer.createdAt).toLocaleString() : ''}</td>
                        <td className="px-4 py-2 border-b">
                          <button
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                            onClick={() => navigate(`/warehouse/farmer/${farmer.id}`)}
                          >
                            View Details
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
        <p className="text-gray-700 mt-8">This is your warehouse dashboard. Features for managing inventory, orders, and reports will appear here.</p>
      </div>
    </DashboardLayout>
  );
};

export default WarehouseDashboard;
