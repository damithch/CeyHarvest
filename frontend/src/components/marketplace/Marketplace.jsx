import React, { useEffect, useState } from 'react';

const productImages = {
  'Coconut': '/images/coconut.jpg',
  'Big Onions': '/images/onion.jpg',
  'Papaya': '/images/papaya.jpg',
  'Rice Red Kekulu Bulk Kg - Local': '/images/rice.jpg',
  'Ambewela Full Cream Fresh Milk Tetra 1L': '/images/milk.jpg',
  // Add more mappings as needed
};

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const url = selectedDistrict
          ? `/api/warehouse/marketplace/products?district=${encodeURIComponent(selectedDistrict)}`
          : '/api/warehouse/marketplace/products';
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
          // Extract unique districts for filter
          const uniqueDistricts = Array.from(new Set(data.map(p => p.district))).filter(Boolean);
          setDistricts(uniqueDistricts);
        } else {
          setError('Failed to fetch products');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedDistrict]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-green-700">Marketplace</h2>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
        <label className="font-medium">Filter by District:</label>
        <select
          value={selectedDistrict}
          onChange={e => setSelectedDistrict(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        >
          <option value="">All Districts</option>
          {districts.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>
      {loading ? (
        <div>Loading products...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map(prod => (
            <div
              key={prod.productId}
              className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center transition-transform transform hover:scale-105 hover:shadow-lg"
            >
              <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                <img
                  src={productImages[prod.productName] || '/images/default.jpg'}
                  alt={prod.productName}
                  className="object-contain w-full h-full"
                />
              </div>
              <div className="font-bold text-lg mb-1 text-center">{prod.productName}</div>
              <div className="text-green-700 font-semibold mb-1 text-lg">
                Rs {prod.latestPrice.toLocaleString()}
              </div>
              <div className="mb-1">
                {prod.totalStock > 0 ? (
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    In Stock: {prod.totalStock}
                  </span>
                ) : (
                  <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                    Out of Stock
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 flex items-center mb-1">
                <span className="material-icons text-base mr-1">store</span>
                {prod.warehouseManager}
              </div>
              <div className="text-xs text-gray-500 flex items-center mb-1">
                <span className="material-icons text-base mr-1">location_on</span>
                {prod.district}
              </div>
              <div className="text-xs text-gray-400 text-center mb-2">{prod.address}</div>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 w-full flex items-center justify-center transition"
              >
                <span className="material-icons mr-2">add_shopping_cart</span>
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Marketplace; 