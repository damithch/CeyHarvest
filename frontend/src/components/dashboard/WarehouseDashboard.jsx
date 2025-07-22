import React, { useState } from 'react';
import DashboardLayout from '../layout/DashboardLayout';
import EnhancedRegister from '../auth/EnhancedRegister';

const WarehouseDashboard = () => {
  // Get warehouse info from localStorage (set after login)
  const userData = JSON.parse(localStorage.getItem('user'));
  const warehouse = userData && userData.role === 'WAREHOUSE' ? userData.user : null;
  const warehouseId = warehouse ? warehouse.id : null;
  const [showFarmerRegister, setShowFarmerRegister] = useState(false);

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
        <p className="text-gray-700">This is your warehouse dashboard. Features for managing inventory, orders, and reports will appear here.</p>
      </div>
    </DashboardLayout>
  );
};

export default WarehouseDashboard;
