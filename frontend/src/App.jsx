import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Welcome from './components/Welcome';
import Login from './components/Login';
import EnhancedRegister from './components/EnhancedRegister';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './components/ResetPassword';
import AdminDashboard from './components/AdminDashboard';
import FarmerDashboard from './components/FarmerDashboard';
import BuyerDashboard from './components/BuyerDashboard';
import AddproductForm from './components/AddProductForm';
const Dashboard = () => {
  const { user } = useAuth();

  switch (user?.role) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'FARMER':
      return <FarmerDashboard />;
    case 'BUYER':
      return <BuyerDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<EnhancedRegister />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          < Route path="/add-product" element={<AddproductForm />} />
          <Route path="*" element={<div style={{padding: '20px'}}>Page not found - but router is working!</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
