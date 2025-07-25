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

  // Warehouse product summary state
  const [productSummary, setProductSummary] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [farmersForProduct, setFarmersForProduct] = useState([]);
  const [showFarmersModal, setShowFarmersModal] = useState(false);

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

  useEffect(() => {
    if (!warehouseId) return;
    // Fetch warehouse product summary
    const fetchSummary = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/warehouse/${warehouseId}/products/summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setProductSummary(await res.json());
    };
    fetchSummary();
  }, [warehouseId]);

  const handleProductClick = async (productName) => {
    setSelectedProduct(productName);
    setShowFarmersModal(true);
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/warehouse/${warehouseId}/products/${encodeURIComponent(productName)}/farmers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) setFarmersForProduct(await res.json());
  };

  return (
    <DashboardLayout title="Warehouse Dashboard">
      <div className="space-y-8 max-w-7xl mx-auto px-4 py-6">
        {/* Warehouse Info Card */}
        {warehouse && (
          <div className="bg-white rounded-xl shadow flex flex-col md:flex-row items-center justify-between p-6 mb-6 border border-green-100">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <div className="bg-green-100 text-green-700 rounded-full w-16 h-16 flex items-center justify-center text-3xl font-bold">
                <span className="material-icons">store</span>
              </div>
              <div>
                <div className="text-xl font-bold text-green-700">{warehouse.managerName}</div>
                <div className="text-sm text-gray-600">Manager</div>
              </div>
            </div>
            <div className="flex flex-col gap-1 text-sm text-gray-700">
              <div><span className="font-semibold">District:</span> {warehouse.district}</div>
              <div><span className="font-semibold">Address:</span> {warehouse.address}</div>
              <div><span className="font-semibold">Phone:</span> {warehouse.phoneNumber}</div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-4">
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 flex items-center gap-2 transition"
            onClick={() => setShowFarmerRegister((prev) => !prev)}
          >
            <span className="material-icons">person_add</span>
            {showFarmerRegister ? 'Close Farmer Registration' : 'Register Farmer'}
          </button>
        </div>
        {showFarmerRegister && (
          <div className="mb-8">
            <EnhancedRegister warehouseId={warehouseId} />
          </div>
        )}

        {/* Farmer Management Section */}
        <div className="bg-white rounded-xl shadow p-6 mb-8 border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Farmers Associated with This Warehouse</h3>
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
            <input
              type="text"
              placeholder="Search farmers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-full md:w-64"
            />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2"
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
              className="border border-gray-300 rounded px-3 py-2"
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
              <table className="min-w-full bg-white border border-gray-200 rounded text-sm">
                <thead className="sticky top-0 bg-green-50 z-10">
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
                      <td colSpan={6} className="text-center py-4 text-gray-500">No farmers found for this warehouse.</td>
                    </tr>
                  ) : (
                    farmers.map(farmer => (
                      <tr key={farmer.id} className="hover:bg-green-50 transition">
                        <td className="px-4 py-2 border-b">{farmer.firstName}</td>
                        <td className="px-4 py-2 border-b">{farmer.lastName}</td>
                        <td className="px-4 py-2 border-b">{farmer.email}</td>
                        <td className="px-4 py-2 border-b">{farmer.phoneNumber}</td>
                        <td className="px-4 py-2 border-b">{farmer.createdAt ? new Date(farmer.createdAt).toLocaleString() : ''}</td>
                        <td className="px-4 py-2 border-b">
                          <button
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-xs"
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

        {/* Warehouse Product Summary Section */}
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Warehouse Product Summary</h3>
          <table className="min-w-full bg-white border border-gray-200 rounded text-sm">
            <thead className="sticky top-0 bg-green-50 z-10">
              <tr>
                <th>Product</th>
                <th>Total Stock</th>
                <th>Latest Price</th>
              </tr>
            </thead>
            <tbody>
              {productSummary.map(prod => (
                <tr key={prod.productName} className="cursor-pointer hover:bg-green-50 transition"
                    onClick={() => handleProductClick(prod.productName)}>
                  <td className="font-semibold flex items-center gap-2">
                    <span className="material-icons text-green-600">local_grocery_store</span>
                    {prod.productName}
                  </td>
                  <td>{prod.totalStock}</td>
                  <td>Rs {prod.latestPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal for farmers for a product */}
        {showFarmersModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow max-w-md w-full">
              <h3 className="text-lg font-bold mb-2">Farmers for {selectedProduct}</h3>
              <table className="min-w-full bg-white border border-gray-200 rounded mb-4 text-sm">
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
        <p className="text-gray-700 mt-8">This is your warehouse dashboard. Features for managing inventory, orders, and reports will appear here.</p>
      </div>
    </DashboardLayout>
  );
};

export default WarehouseDashboard;
