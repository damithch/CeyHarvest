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
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">No products found for this farmer.</td>
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
    </div>
  );
};

export default FarmerDetails; 