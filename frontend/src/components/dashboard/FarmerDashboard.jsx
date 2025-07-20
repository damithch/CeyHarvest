import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../layout/DashboardLayout';
import AddProductForm from '../farmer/AddProductForm';

const FarmerDashboard = () => {
  const { user, getAuthHeaders } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0
  });
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [editEntry, setEditEntry] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.id) {
      fetchProducts();
      fetchOrders();
      fetchStats();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/farmer/${user.id}/products`, {
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
      const response = await fetch(`/api/farmer/${user.id}/orders`, {
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
      const response = await fetch(`/api/farmer/${user.id}/stats`, {
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

  // Group products by category (name)
  const groupedProducts = products.reduce((acc, product) => {
    if (!acc[product.name]) acc[product.name] = [];
    acc[product.name].push(product);
    return acc;
  }, {});

  // Handle category click
  const handleCategoryClick = async (category) => {
    // Fetch products for this category (sorted by harvestDate desc)
    const response = await fetch(`/api/farmer/${user.id}/products/category/${encodeURIComponent(category)}`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });
    if (response.ok) {
      const data = await response.json();
      setCategoryProducts(data);
      setSelectedCategory(category);
    }
  };

  // Calculate total stock and latest price for selected category
  const getCategoryStats = (products) => {
    if (!products || products.length === 0) return { totalStock: 0, latestPrice: 0 };
    const totalStock = products.reduce((sum, p) => sum + (p.quantity || 0), 0);
    // Sort by harvestDate descending
    const sorted = [...products].sort((a, b) => new Date(b.harvestDate) - new Date(a.harvestDate));
    const latestPrice = sorted[0]?.price || 0;
    return { totalStock, latestPrice };
  };

  // Delete entire category
  const handleDeleteCategory = async () => {
    if (!window.confirm(`Are you sure you want to delete all entries for ${selectedCategory}?`)) return;
    setLoading(true);
    const response = await fetch(`/api/farmer/${user.id}/products/category/${encodeURIComponent(selectedCategory)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });
    setLoading(false);
    if (response.ok) {
      setSelectedCategory(null);
      setCategoryProducts([]);
      fetchProducts();
    } else {
      alert('Failed to delete category');
    }
  };

  // Delete single entry
  const handleDeleteEntry = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    setLoading(true);
    const response = await fetch(`/api/farmer/${user.id}/products/${productId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });
    setLoading(false);
    if (response.ok) {
      setCategoryProducts((prev) => prev.filter((p) => p.id !== productId));
      fetchProducts();
    } else {
      alert('Failed to delete entry');
    }
  };

  // Start editing an entry
  const handleEditEntry = (entry) => {
    setEditEntry(entry.id);
    setEditForm({
      productName: entry.name,
      grade: entry.grade,
      location: entry.location,
      quantity: entry.quantity,
      price: entry.price,
      harvestDate: entry.harvestDate,
      description: entry.description || ''
    });
  };

  // Submit edit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const response = await fetch(`/api/farmer/${user.id}/products/${editEntry}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(editForm)
    });
    setLoading(false);
    if (response.ok) {
      const updated = await response.json();
      setCategoryProducts((prev) => prev.map((p) => p.id === updated.id ? updated : p));
      fetchProducts();
      setEditEntry(null);
    } else {
      alert('Failed to update entry');
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
    <DashboardLayout title="Farmer Dashboard">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="My Products"
            value={stats.totalProducts}
            icon="🌽"
            color="text-green-600"
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon="📦"
            color="text-blue-600"
          />
          <StatCard
            title="Total Revenue"
            value={`LKR ${stats.totalRevenue}`}
            icon="💰"
            color="text-yellow-600"
          />
          <StatCard
            title="Pending Orders"
            value={stats.pendingOrders}
            icon="⏳"
            color="text-red-600"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Product Management</h3>
            <div className="space-y-3">
              <button 
                className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                onClick={() => setShowAddProductForm(true)}
              >
                Add New Product
              </button>
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                View My Products
              </button>
              <button className="w-full bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">
                Update Inventory
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Management</h3>
            <div className="space-y-3">
              <button className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
                View All Orders
              </button>
              <button className="w-full bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">
                Pending Orders
              </button>
              <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                Order History
              </button>
            </div>
          </div>
        </div>

        {/* Recent Products - Grouped by Category */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Products
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Your product categories
            </p>
          </div>
          <ul className="divide-y divide-gray-200">
            {Object.keys(groupedProducts).length > 0 ? (
              Object.keys(groupedProducts).map((category) => {
                const { totalStock, latestPrice } = getCategoryStats(groupedProducts[category]);
                return (
                  <li key={category} className="px-4 py-4 sm:px-6 cursor-pointer hover:bg-gray-50" onClick={() => handleCategoryClick(category)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">{category.split(' ')[1] || '🍃'}</span>
                        <div className="ml-2">
                          <div className="text-sm font-medium text-gray-900">{category}</div>
                          <div className="text-xs text-gray-500">{groupedProducts[category].length} entries</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-700 font-semibold">
                        📦 {totalStock}kg &nbsp; | &nbsp; 💰 Rs. {latestPrice}/kg
                      </div>
                      <div className="text-sm text-gray-500 ml-4">View Details →</div>
                    </div>
                  </li>
                );
              })
            ) : (
              <li className="px-4 py-4 sm:px-6">
                <div className="text-sm text-gray-500">No products yet</div>
              </li>
            )}
          </ul>
        </div>

        {/* Category Detail Modal */}
        {selectedCategory && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 relative max-w-2xl w-full">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-2xl font-bold"
                onClick={() => { setSelectedCategory(null); setCategoryProducts([]); setEditEntry(null); }}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold mb-2">{selectedCategory} Category View</h2>
              <div className="mb-4 flex justify-between items-center">
                {(() => {
                  const { totalStock, latestPrice } = getCategoryStats(categoryProducts);
                  return (
                    <>
                      <div>
                        <div className="text-lg font-semibold">📦 Total Stock: {totalStock}kg</div>
                        <div className="text-lg font-semibold">💰 Current Price: Rs. {latestPrice}/kg</div>
                      </div>
                      <button
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-semibold"
                        onClick={handleDeleteCategory}
                        disabled={loading}
                      >
                        Delete Category
                      </button>
                    </>
                  );
                })()}
              </div>
              <div className="mb-2 text-md font-semibold">Date-wise product listings</div>
              <ul className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
                {categoryProducts.length > 0 ? (
                  categoryProducts.map((prod, idx) => (
                    <li key={prod.id} className="py-2 flex flex-col md:flex-row md:items-center md:justify-between">
                      {editEntry === prod.id ? (
                        <form className="flex flex-col md:flex-row md:items-center w-full gap-2" onSubmit={handleEditSubmit}>
                          <input type="text" className="border rounded px-2 py-1 w-24" value={editForm.productName} onChange={e => setEditForm(f => ({ ...f, productName: e.target.value }))} required />
                          <input type="number" className="border rounded px-2 py-1 w-16" value={editForm.quantity} onChange={e => setEditForm(f => ({ ...f, quantity: e.target.value }))} required min="0" />
                          <input type="number" className="border rounded px-2 py-1 w-20" value={editForm.price} onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))} required min="0" step="0.01" />
                          <input type="date" className="border rounded px-2 py-1 w-32" value={editForm.harvestDate} onChange={e => setEditForm(f => ({ ...f, harvestDate: e.target.value }))} required />
                          <input type="text" className="border rounded px-2 py-1 w-32" value={editForm.location} onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))} required />
                          <select className="border rounded px-2 py-1 w-16" value={editForm.grade} onChange={e => setEditForm(f => ({ ...f, grade: e.target.value }))} required>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                          </select>
                          <input type="text" className="border rounded px-2 py-1 w-32" value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" />
                          <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700" disabled={loading}>Save</button>
                          <button type="button" className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500" onClick={() => setEditEntry(null)} disabled={loading}>Cancel</button>
                        </form>
                      ) : (
                        <>
                          <span className="mr-2">🗓️ {prod.harvestDate}</span>
                          <span className="mr-2">- {prod.name} - {prod.quantity}kg @ Rs. {prod.price}/kg</span>
                          <div className="flex gap-2 mt-2 md:mt-0">
                            <button className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 text-xs" onClick={() => handleEditEntry(prod)} disabled={loading}>Edit</button>
                            <button className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 text-xs" onClick={() => handleDeleteEntry(prod.id)} disabled={loading}>Delete</button>
                          </div>
                        </>
                      )}
                    </li>
                  ))
                ) : (
                  <li className="py-2 text-gray-500">No entries for this category.</li>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* Recent Orders */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Orders
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Latest orders for your products
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
                          {order.productName} | Qty: {order.quantity}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.status}
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
              {showAddProductForm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 relative max-w-2xl w-full">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-2xl font-bold"
                onClick={() => setShowAddProductForm(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <AddProductForm onSuccess={() => {
                setShowAddProductForm(false);
                fetchProducts(); // Refresh the products list
              }} />
            </div>
          </div>
        )}
    </DashboardLayout>
  );
};

export default FarmerDashboard;
