import React from 'react';
import DashboardLayout from '../layout/DashboardLayout';

const WarehouseDashboard = () => {
  return (
    <DashboardLayout title="Warehouse Dashboard">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-green-700">Welcome, Warehouse Manager!</h2>
        <p className="text-gray-700">This is your warehouse dashboard. Features for managing inventory, orders, and reports will appear here.</p>
      </div>
    </DashboardLayout>
  );
};

export default WarehouseDashboard;
