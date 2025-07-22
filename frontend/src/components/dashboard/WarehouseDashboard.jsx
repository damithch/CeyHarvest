import React from 'react';
import DashboardLayout from '../layout/DashboardLayout';

const WarehouseDashboard = () => {
  // Get warehouse info from localStorage (set after login)
  const userData = JSON.parse(localStorage.getItem('user'));
  const warehouse = userData && userData.role === 'WAREHOUSE' ? userData.user : null;

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
        <p className="text-gray-700">This is your warehouse dashboard. Features for managing inventory, orders, and reports will appear here.</p>
      </div>
    </DashboardLayout>
  );
};

export default WarehouseDashboard;
