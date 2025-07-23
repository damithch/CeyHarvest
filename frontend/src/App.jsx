import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Welcome from './components/common/Welcome';
import Unauthorized from './components/common/Unauthorized';
import NotFound from './components/common/NotFound';
import Login from './components/auth/Login';
import EnhancedRegister from './components/auth/EnhancedRegister';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import AdminDashboard from './components/dashboard/AdminDashboard';
import FarmerDashboard from './components/dashboard/FarmerDashboard';
import BuyerDashboard from './components/dashboard/BuyerDashboard';
import DriverDashboard from './components/dashboard/DriverDashboard';
import WarehouseDashboard from './components/dashboard/WarehouseDashboard';
import ProfileSettings from './components/user/ProfileSettings';
import FarmerDetails from './components/dashboard/FarmerDetails';
import Marketplace from './components/marketplace/Marketplace';
import { ROUTES, getRoleDashboard } from './constants/routes';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Auto-redirect to role-specific dashboard for better UX
  useEffect(() => {
    if (user?.role) {
      const roleDashboard = getRoleDashboard(user.role);
      if (roleDashboard !== ROUTES.LOGIN) {
        navigate(roleDashboard, { replace: true });
      }
    }
  }, [user, navigate]);

  // Keep existing functionality as fallback for direct access
  switch (user?.role) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'FARMER':
      return <FarmerDashboard />;
    case 'BUYER':
      return <BuyerDashboard />;
    case 'DRIVER':
      return <DriverDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path={ROUTES.HOME} element={<Welcome />} />
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route path={ROUTES.REGISTER} element={<EnhancedRegister />} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
          <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
          <Route path={ROUTES.UNAUTHORIZED} element={<Unauthorized />} />
          
          {/* Main dashboard route - keep existing functionality */}
          <Route 
            path={ROUTES.DASHBOARD}
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Profile route - new addition */}
          <Route 
            path={ROUTES.PROFILE}
            element={
              <ProtectedRoute>
                <ProfileSettings />
              </ProtectedRoute>
            } 
          />
          
          {/* Role-specific dashboard routes - new additions */}
          <Route 
            path={ROUTES.ADMIN.DASHBOARD}
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path={ROUTES.BUYER.DASHBOARD}
            element={
              <ProtectedRoute allowedRoles={['BUYER']}>
                <BuyerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path={ROUTES.BUYER.PROFILE}
            element={
              <ProtectedRoute allowedRoles={['BUYER']}>
                <ProfileSettings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path={ROUTES.BUYER.MARKETPLACE}
            element={
              <ProtectedRoute allowedRoles={['BUYER']}>
                <Marketplace />
              </ProtectedRoute>
            } 
          />
          <Route 
            path={ROUTES.FARMER.DASHBOARD}
            element={
              <ProtectedRoute allowedRoles={['FARMER']}>
                <FarmerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path={ROUTES.FARMER.PROFILE}
            element={
              <ProtectedRoute allowedRoles={['FARMER']}>
                <ProfileSettings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path={ROUTES.DRIVER.DASHBOARD}
            element={
              <ProtectedRoute allowedRoles={['DRIVER']}>
                <DriverDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path={ROUTES.WAREHOUSE.DASHBOARD}
            element={
              <ProtectedRoute allowedRoles={['WAREHOUSE']}>
                <WarehouseDashboard />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/warehouse/farmer/:farmerId"
            element={
              <ProtectedRoute allowedRoles={['WAREHOUSE']}>
                <FarmerDetails />
              </ProtectedRoute>
            }
          />
          <Route 
            path={ROUTES.WAREHOUSE.PROFILE}
            element={
              <ProtectedRoute allowedRoles={['WAREHOUSE']}>
                <ProfileSettings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path={ROUTES.ADMIN.PROFILE}
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <ProfileSettings />
              </ProtectedRoute>
            } 
          />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
