import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../layout/DashboardLayout';
import AddProductForm from '../farmer/AddProductForm';
import toast, { Toaster } from 'react-hot-toast';
import { InformationCircleIcon, PencilSquareIcon, TrashIcon, PlusCircleIcon } from '@heroicons/react/24/outline';

// Modal component for reuse
function Modal({ open, onClose, children }) {
  React.useEffect(() => {
    if (!open) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center transition-all"
      style={{ backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full relative animate-fadeInUp"
        onClick={e => e.stopPropagation()}
      >
        {children}
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-red-600 text-2xl font-bold focus:outline-none"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
      </div>
      <style>{`
        .animate-fadeInUp {
          animation: fadeInUp 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

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
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (user && user.id) {
      setPageLoading(true);
      Promise.all([fetchProducts(), fetchOrders(), fetchStats()]).finally(() => setPageLoading(false));
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
      toast.success('Category deleted successfully');
      setSelectedCategory(null);
      setCategoryProducts([]);
      fetchProducts();
    } else {
      toast.error('Failed to delete category');
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
      toast.success('Entry deleted successfully');
      setCategoryProducts((prev) => prev.filter((p) => p.id !== productId));
      fetchProducts();
    } else {
      toast.error('Failed to delete entry');
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
      toast.success('Entry updated successfully');
      setCategoryProducts((prev) => prev.map((p) => p.id === updated.id ? updated : p));
      fetchProducts();
      setEditEntry(null);
    } else {
      toast.error('Failed to update entry');
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
      <Toaster position="top-right" />
      {pageLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-70">
          <span className="loader w-8 h-8 border-4 border-blue-300 border-t-blue-600"></span>
        </div>
      )}
      <div className="space-y-8 px-2 md:px-8 py-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="My Products"
            value={stats.totalProducts}
            icon={<PlusCircleIcon className="w-7 h-7 text-green-600" />}
            color=""
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={<InformationCircleIcon className="w-7 h-7 text-blue-600" />}
            color=""
          />
          <StatCard
            title="Total Revenue"
            value={`LKR ${stats.totalRevenue}`}
            icon={<span className="text-yellow-600">💰</span>}
            color=""
          />
          <StatCard
            title="Pending Orders"
            value={stats.pendingOrders}
            icon={<span className="text-red-600">⏳</span>}
            color=""
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <PlusCircleIcon className="w-5 h-5 text-green-600" /> Product Management
            </h3>
            <div className="flex flex-col gap-3">
              <button
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 focus:ring-2 focus:ring-green-400 font-semibold flex items-center gap-2 transition"
                onClick={() => setShowAddProductForm(true)}
              >
                <PlusCircleIcon className="w-5 h-5" /> Add New Product
              </button>
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 font-semibold flex items-center gap-2 transition">
                <InformationCircleIcon className="w-5 h-5" /> View My Products
              </button>
              <button className="w-full bg-yellow-600 text-white px-4 py-2 rounded-lg shadow hover:bg-yellow-700 focus:ring-2 focus:ring-yellow-400 font-semibold flex items-center gap-2 transition">
                <PencilSquareIcon className="w-5 h-5" /> Update Inventory
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <InformationCircleIcon className="w-5 h-5 text-purple-600" /> Order Management
            </h3>
            <div className="flex flex-col gap-3">
              <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-700 focus:ring-2 focus:ring-purple-400 font-semibold flex items-center gap-2 transition">
                <InformationCircleIcon className="w-5 h-5" /> View All Orders
              </button>
              <button className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg shadow hover:bg-orange-700 focus:ring-2 focus:ring-orange-400 font-semibold flex items-center gap-2 transition">
                <InformationCircleIcon className="w-5 h-5" /> Pending Orders
              </button>
              <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-400 font-semibold flex items-center gap-2 transition">
                <InformationCircleIcon className="w-5 h-5" /> Order History
              </button>
            </div>
          </div>
        </div>

        {/* Recent Products - Grouped by Category */}
        <div className="bg-white shadow rounded-2xl overflow-hidden">
          <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl leading-6 font-bold text-gray-900 mb-1">Recent Products</h3>
              <p className="max-w-2xl text-sm text-gray-500">Your product categories</p>
            </div>
            <button
              className="bg-green-100 text-green-700 px-3 py-1 rounded-lg flex items-center gap-1 hover:bg-green-200 transition"
              onClick={() => setShowAddProductForm(true)}
              title="Add New Product"
            >
              <PlusCircleIcon className="w-5 h-5" /> Add
            </button>
          </div>
          <ul className="divide-y divide-gray-200">
            {Object.keys(groupedProducts).length > 0 ? (
              Object.keys(groupedProducts).map((category) => {
                const { totalStock, latestPrice } = getCategoryStats(groupedProducts[category]);
                return (
                  <li key={category} className="px-4 py-4 sm:px-6 cursor-pointer hover:bg-green-50 transition rounded flex items-center justify-between" onClick={() => handleCategoryClick(category)} title={`View details for ${category}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl mr-2">{category.split(' ')[1] || '🍃'}</span>
                      <div className="ml-2">
                        <div className="text-base font-semibold text-gray-900">{category}</div>
                        <div className="text-xs text-gray-500">{groupedProducts[category].length} entries</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 font-semibold">
                      📦 {totalStock}kg &nbsp; | &nbsp; 💰 Rs. {latestPrice}/kg
                    </div>
                    <div className="text-sm text-gray-400 ml-4 flex items-center gap-1">
                      <InformationCircleIcon className="w-4 h-4" /> View Details
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
        <Modal open={!!selectedCategory} onClose={() => { setSelectedCategory(null); setCategoryProducts([]); setEditEntry(null); }}>
          {selectedCategory && (
            <div>
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
                        className="bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700 focus:ring-2 focus:ring-red-400 font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
                        onClick={handleDeleteCategory}
                        disabled={loading}
                      >
                        {loading ? <span className="loader mr-2"></span> : null} Delete Category
                      </button>
                    </>
                  );
                })()}
              </div>
              <div className="mb-2 text-md font-semibold">Date-wise product listings</div>
              <div className="overflow-x-auto">
                <table className="min-w-full border rounded-lg">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Date</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Product</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Quantity (kg)</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Price (Rs/kg)</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Location</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Grade</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Description</th>
                      <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryProducts.length > 0 ? (
                      categoryProducts.map((prod, idx) => (
                        <tr key={prod.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          {editEntry === prod.id ? (
                            <td colSpan={8} className="p-2">
                              <form className="flex flex-wrap gap-2 items-center" onSubmit={handleEditSubmit}>
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
                                <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded-lg shadow hover:bg-green-700 focus:ring-2 focus:ring-green-400 transition disabled:opacity-60 disabled:cursor-not-allowed" disabled={loading}>{loading ? <span className="loader mr-2"></span> : null} Save</button>
                                <button type="button" className="bg-gray-400 text-white px-3 py-1 rounded-lg shadow hover:bg-gray-500 focus:ring-2 focus:ring-gray-300 transition" onClick={() => setEditEntry(null)} disabled={loading}>Cancel</button>
                              </form>
                            </td>
                          ) : (
                            <>
                              <td className="px-3 py-2 text-sm">{prod.harvestDate}</td>
                              <td className="px-3 py-2 text-sm">{prod.name}</td>
                              <td className="px-3 py-2 text-sm">{prod.quantity}</td>
                              <td className="px-3 py-2 text-sm">{prod.price}</td>
                              <td className="px-3 py-2 text-sm">{prod.location}</td>
                              <td className="px-3 py-2 text-sm">{prod.grade}</td>
                              <td className="px-3 py-2 text-sm">{prod.description}</td>
                              <td className="px-3 py-2 text-center">
                                <button className="bg-blue-600 text-white px-2 py-1 rounded-lg shadow hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 text-xs transition mr-1 disabled:opacity-60 disabled:cursor-not-allowed" onClick={() => handleEditEntry(prod)} disabled={loading}>Edit</button>
                                <button className="bg-red-600 text-white px-2 py-1 rounded-lg shadow hover:bg-red-700 focus:ring-2 focus:ring-red-400 text-xs transition disabled:opacity-60 disabled:cursor-not-allowed" onClick={() => handleDeleteEntry(prod.id)} disabled={loading}>Delete</button>
                              </td>
                            </>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={8} className="py-2 text-gray-500 text-center">No entries for this category.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Modal>

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
          <Modal open={showAddProductForm} onClose={() => setShowAddProductForm(false)}>
            <AddProductForm onSuccess={() => {
              setShowAddProductForm(false);
              fetchProducts(); // Refresh the products list
            }} />
          </Modal>
        )}
    </DashboardLayout>
  );
};

export default FarmerDashboard;

// Loader spinner CSS
// Add this at the end of the file or in your global CSS
<style>{`
.loader {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 0.8s linear infinite;
  display: inline-block;
  vertical-align: middle;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`}</style>
