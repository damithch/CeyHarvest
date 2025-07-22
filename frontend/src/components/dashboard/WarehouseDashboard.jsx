import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layout/DashboardLayout';


const user = JSON.parse(localStorage.getItem('user'));
const warehouseId = user?.warehouseId;
console.log('Loaded user:', user, 'Warehouse ID:', warehouseId);

const WarehouseDashboard = () => {
  const [warehouse, setWarehouse] = useState(null);
  const [farmers, setFarmers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Get warehouseId from user info (from localStorage after login)
  const user = JSON.parse(localStorage.getItem('user'));
  const warehouseId = user?.warehouseId;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!warehouseId) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/admin/warehouses/${warehouseId}`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`/api/warehouse/${warehouseId}/farmers`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`/api/warehouse/${warehouseId}/products`, { headers: { Authorization: `Bearer ${token}` } }),
    ])
      .then(async ([wRes, fRes, pRes]) => {
        if (!wRes.ok || !fRes.ok || !pRes.ok) throw new Error('Failed to fetch data');
        setWarehouse(await wRes.json());
        setFarmers(await fRes.json());
        setProducts(await pRes.json());
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [warehouseId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <DashboardLayout>
      <h1>Warehouse Dashboard</h1>
      <section>
        <h2>Warehouse Info</h2>
        <div>District: {warehouse?.district}</div>
        <div>Manager: {warehouse?.managerName}</div>
        <div>Address: {warehouse?.address}</div>
        <div>Phone: {warehouse?.phoneNumber}</div>
      </section>
      <section>
        <h2>Farmers</h2>
        <ul>
          {farmers.map(f => <li key={f.id}>{f.firstName} {f.lastName} ({f.phoneNumber})</li>)}
        </ul>
      </section>
      <section>
        <h2>Products</h2>
        <ul>
          {products.map(p => (
            <li key={p.productId}>
              {p.productName} - Stock: {p.totalStock}, Price: {p.latestPrice}
            </li>
          ))}
        </ul>
      </section>
    </DashboardLayout>
  );
};

export default WarehouseDashboard; 