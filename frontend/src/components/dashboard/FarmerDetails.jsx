import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const FarmerDetails = () => {
  const { farmerId } = useParams();
  const [farmer, setFarmer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showProductForm, setShowProductForm] = useState(false);
  const [product, setProduct] = useState({
    location: '',
    productName: '',
    quantity: '',
    harvestDay: '',
    shelfLife: '',
    price: ''
  });
  const [receipt, setReceipt] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState('');
  const [editProduct, setEditProduct] = useState(null);
  const [showHistory, setShowHistory] = useState(null);

  useEffect(() => {
    const fetchFarmer = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/warehouse/farmer/${farmerId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setFarmer(data);
        } else {
          setError('Failed to fetch farmer details');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };
    const fetchProducts = async () => {
      setLoadingProducts(true);
      setProductError('');
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/warehouse/farmer/${farmerId}/products`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        } else {
          setProductError('Failed to fetch products');
        }
      } catch (err) {
        setProductError('Network error');
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchFarmer();
    fetchProducts();
  }, [farmerId]);

  const handleProductChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setReceipt(null);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        productName: product.productName,
        location: product.location,
        totalStock: parseInt(product.quantity, 10),
        latestPrice: parseFloat(product.price),
        harvestDay: product.harvestDay,
        shelfLife: parseInt(product.shelfLife, 10)
      };
      const response = await fetch(`/api/warehouse/farmer/${farmerId}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const saved = await response.json();
        setReceipt({ ...product, farmer });
        setShowProductForm(false);
        setProduct({ location: '', productName: '', quantity: '', harvestDay: '', shelfLife: '', price: '' });
        // Refresh product list
        const productsRes = await fetch(`/api/warehouse/farmer/${farmerId}/products`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (productsRes.ok) {
          setProducts(await productsRes.json());
        }
      } else {
        setProductError('Failed to add product');
      }
    } catch (err) {
      setProductError('Network error');
    }
  };

  // Analytics
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + (p.totalStock || 0), 0);
  const avgPrice = products.length ? (products.reduce((sum, p) => sum + (p.latestPrice || 0), 0) / products.length).toFixed(2) : 0;

  // Edit product handlers
  const handleEditClick = (prod) => {
    setEditProduct({ ...prod });
  };
  const handleEditChange = (e) => {
    setEditProduct({ ...editProduct, [e.target.name]: e.target.value });
  };
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        productName: editProduct.productName,
        location: editProduct.location,
        totalStock: parseInt(editProduct.totalStock, 10),
        latestPrice: parseFloat(editProduct.latestPrice),
        harvestDay: editProduct.harvestDay,
        shelfLife: parseInt(editProduct.shelfLife, 10)
      };
      const response = await fetch(`/api/warehouse/farmer/${farmerId}/products/${editProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        setEditProduct(null);
        // Refresh product list
        const productsRes = await fetch(`/api/warehouse/farmer/${farmerId}/products`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (productsRes.ok) {
          setProducts(await productsRes.json());
        }
      } else {
        setProductError('Failed to update product');
      }
    } catch (err) {
      setProductError('Network error');
    }
  };
  const handleDelete = async (prod) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/warehouse/farmer/${farmerId}/products/${prod.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        // Refresh product list
        const productsRes = await fetch(`/api/warehouse/farmer/${farmerId}/products`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (productsRes.ok) {
          setProducts(await productsRes.json());
        }
      } else {
        setProductError('Failed to delete product');
      }
    } catch (err) {
      setProductError('Network error');
    }
  };

  const productOptions = [
    '🥕 Carrot', '🥔 Potato', '🧅 Onion', '🌽 Corn', '🥒 Cucumber', '🫑 Bell Pepper',
    '🍆 Eggplant', '🥬 Leafy Greens', '🥦 Broccoli', '🧄 Garlic', '🍎 Apple',
    '🍌 Banana', '🍇 Grapes', '🍊 Orange', '🍉 Watermelon', '🍓 Strawberry',
    '🍍 Pineapple', '🥭 Mango', '🍒 Cherry', '🥝 Kiwi'
  ];

  if (loading) return <div>Loading farmer details...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!farmer) return <div>No farmer found.</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h2 className="text-2xl font-bold mb-4">Farmer Details</h2>
      <div className="mb-4">
        <div><strong>Name:</strong> {farmer.firstName} {farmer.lastName}</div>
        <div><strong>Email:</strong> {farmer.email}</div>
        <div><strong>Phone:</strong> {farmer.phoneNumber}</div>
        <div><strong>Address:</strong> {farmer.address}</div>
        <div><strong>City:</strong> {farmer.city}</div>
      </div>
      <h3 className="text-lg font-semibold mb-2 mt-6">Products Provided</h3>
      <div className="mb-2 text-sm text-gray-700">
        <span className="mr-4">Total Products: <strong>{totalProducts}</strong></span>
        <span className="mr-4">Total Stock: <strong>{totalStock}</strong></span>
        <span>Average Price: <strong>{avgPrice}</strong></span>
      </div>
      {loadingProducts ? (
        <div>Loading products...</div>
      ) : productError ? (
        <div className="text-red-600">{productError}</div>
      ) : (
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full bg-white border border-gray-200 rounded">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b">Product</th>
                <th className="px-4 py-2 border-b">Location</th>
                <th className="px-4 py-2 border-b">Total Stock</th>
                <th className="px-4 py-2 border-b">Latest Price</th>
                <th className="px-4 py-2 border-b">Harvest Day</th>
                <th className="px-4 py-2 border-b">Shelf Life</th>
                <th className="px-4 py-2 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500">No products found for this farmer.</td>
                </tr>
              ) : (
                products.map(prod => (
                  <tr key={prod.id}>
                    <td className="px-4 py-2 border-b">{prod.productName}</td>
                    <td className="px-4 py-2 border-b">{prod.location}</td>
                    <td className="px-4 py-2 border-b">{prod.totalStock}</td>
                    <td className="px-4 py-2 border-b">{prod.latestPrice}</td>
                    <td className="px-4 py-2 border-b">{prod.harvestDay}</td>
                    <td className="px-4 py-2 border-b">{prod.shelfLife}</td>
                    <td className="px-4 py-2 border-b space-x-2">
                      <button className="bg-blue-500 text-white px-2 py-1 rounded text-xs" onClick={() => setShowHistory(prod)}>View History</button>
                      <button className="bg-yellow-500 text-white px-2 py-1 rounded text-xs" onClick={() => handleEditClick(prod)}>Edit</button>
                      <button className="bg-red-600 text-white px-2 py-1 rounded text-xs" onClick={() => handleDelete(prod)}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {!receipt && (
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
          onClick={() => setShowProductForm((prev) => !prev)}
        >
          {showProductForm ? 'Cancel' : 'Add Product'}
        </button>
      )}
      {showProductForm && (
        <form className="space-y-3 bg-gray-50 p-4 rounded mb-4" onSubmit={handleProductSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input type="text" name="location" value={product.location} onChange={handleProductChange} className="mt-1 block w-full border border-gray-300 rounded px-2 py-1" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Product Name</label>
            <select
              name="productName"
              value={product.productName}
              onChange={handleProductChange}
              className="mt-1 block w-full border border-gray-300 rounded px-2 py-1"
              required
            >
              <option value="">Select a product</option>
              {productOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Quantity</label>
            <input type="number" name="quantity" value={product.quantity} onChange={handleProductChange} className="mt-1 block w-full border border-gray-300 rounded px-2 py-1" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Harvest Day</label>
            <input type="date" name="harvestDay" value={product.harvestDay} onChange={handleProductChange} className="mt-1 block w-full border border-gray-300 rounded px-2 py-1" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Shelf Life (days)</label>
            <input type="number" name="shelfLife" value={product.shelfLife} onChange={handleProductChange} className="mt-1 block w-full border border-gray-300 rounded px-2 py-1" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Price</label>
            <input type="number" name="price" value={product.price} onChange={handleProductChange} className="mt-1 block w-full border border-gray-300 rounded px-2 py-1" required />
          </div>
          <button type="submit" className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mt-2">Submit</button>
        </form>
      )}
      {receipt && (
        <div className="bg-green-50 border border-green-200 rounded p-4 mt-4">
          <h3 className="text-lg font-bold mb-2">Receipt</h3>
          <div><strong>Farmer:</strong> {farmer.firstName} {farmer.lastName}</div>
          <div><strong>Product:</strong> {receipt.productName}</div>
          <div><strong>Location:</strong> {receipt.location}</div>
          <div><strong>Quantity:</strong> {receipt.quantity}</div>
          <div><strong>Harvest Day:</strong> {receipt.harvestDay}</div>
          <div><strong>Shelf Life:</strong> {receipt.shelfLife} days</div>
          <div><strong>Price:</strong> {receipt.price}</div>
        </div>
      )}
      {/* Edit Product Modal */}
      {editProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-md w-full">
            <h3 className="text-lg font-bold mb-2">Edit Product</h3>
            <form className="space-y-3" onSubmit={handleEditSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700">Product Name</label>
                <input type="text" name="productName" value={editProduct.productName} onChange={handleEditChange} className="mt-1 block w-full border border-gray-300 rounded px-2 py-1" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input type="text" name="location" value={editProduct.location} onChange={handleEditChange} className="mt-1 block w-full border border-gray-300 rounded px-2 py-1" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Total Stock</label>
                <input type="number" name="totalStock" value={editProduct.totalStock} onChange={handleEditChange} className="mt-1 block w-full border border-gray-300 rounded px-2 py-1" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Latest Price</label>
                <input type="number" name="latestPrice" value={editProduct.latestPrice} onChange={handleEditChange} className="mt-1 block w-full border border-gray-300 rounded px-2 py-1" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Harvest Day</label>
                <input type="date" name="harvestDay" value={editProduct.harvestDay} onChange={handleEditChange} className="mt-1 block w-full border border-gray-300 rounded px-2 py-1" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Shelf Life</label>
                <input type="number" name="shelfLife" value={editProduct.shelfLife} onChange={handleEditChange} className="mt-1 block w-full border border-gray-300 rounded px-2 py-1" required />
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => setEditProduct(null)}>Cancel</button>
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Product History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-md w-full">
            <h3 className="text-lg font-bold mb-2">Product History: {showHistory.productName}</h3>
            <table className="min-w-full bg-white border border-gray-200 rounded mb-4">
              <thead>
                <tr>
                  <th className="px-4 py-2 border-b">Price</th>
                  <th className="px-4 py-2 border-b">Stock Added</th>
                  <th className="px-4 py-2 border-b">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {showHistory.priceHistory && showHistory.priceHistory.length > 0 ? (
                  showHistory.priceHistory.map((h, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2 border-b">{h.price}</td>
                      <td className="px-4 py-2 border-b">{h.stockAdded}</td>
                      <td className="px-4 py-2 border-b">{h.timestamp ? new Date(h.timestamp).toLocaleString() : ''}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={3} className="text-center py-2 text-gray-500">No history</td></tr>
                )}
              </tbody>
            </table>
            <div className="flex justify-end">
              <button className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => setShowHistory(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerDetails; 