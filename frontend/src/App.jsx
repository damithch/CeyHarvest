import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';
import { ROUTES, getRoleDashboard } from './constants/routes';

// Lazy-loaded components for better performance
const Welcome = lazy(() => import('./components/common/Welcome'));
const Unauthorized = lazy(() => import('./components/common/Unauthorized'));
const NotFound = lazy(() => import('./components/common/NotFound'));
const Login = lazy(() => import('./components/auth/Login'));
const EnhancedRegister = lazy(() => import('./components/auth/EnhancedRegister'));
const ForgotPassword = lazy(() => import('./components/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./components/auth/ResetPassword'));
const AdminDashboard = lazy(() => import('./components/dashboard/AdminDashboard'));
const FarmerDashboard = lazy(() => import('./components/dashboard/FarmerDashboard'));
const BuyerDashboard = lazy(() => import('./components/dashboard/BuyerDashboard'));
const DriverDashboard = lazy(() => import('./components/dashboard/DriverDashboard'));
const WarehouseDashboard = lazy(() => import('./components/dashboard/WarehouseDashboard'));
const ProfileSettings = lazy(() => import('./components/user/ProfileSettings'));

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role) {
      const roleDashboard = getRoleDashboard(user.role);
      if (roleDashboard !== ROUTES.LOGIN) {
        navigate(roleDashboard, { replace: true });
      }
    }
  }, [user, navigate]);

  return (
    <Suspense fallback={<LoadingSpinner fullPage />}>
      {user?.role === 'ADMIN' && <AdminDashboard />}
      {user?.role === 'FARMER' && <FarmerDashboard />}
      {user?.role === 'BUYER' && <BuyerDashboard />}
      {user?.role === 'DRIVER' && <DriverDashboard />}
      {user?.role === 'WAREHOUSE' && <WarehouseDashboard />}
      {!user && <Navigate to={ROUTES.LOGIN} replace />}
    </Suspense>
  );
};

const RouteConfig = () => {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={
        <Suspense fallback={<LoadingSpinner />}>
          <Welcome />
        </Suspense>
      } />

      {/* Auth Routes */}
      <Route path={ROUTES.LOGIN} element={
        <Suspense fallback={<LoadingSpinner />}>
          <Login />
        </Suspense>
      } />
      <Route path={ROUTES.REGISTER} element={
        <Suspense fallback={<LoadingSpinner />}>
          <EnhancedRegister />
        </Suspense>
      } />
      <Route path={ROUTES.FORGOT_PASSWORD} element={
        <Suspense fallback={<LoadingSpinner />}>
          <ForgotPassword />
        </Suspense>
      } />
      <Route path={ROUTES.RESET_PASSWORD} element={
        <Suspense fallback={<LoadingSpinner />}>
          <ResetPassword />
        </Suspense>
      } />

      {/* Error Routes */}
      <Route path={ROUTES.UNAUTHORIZED} element={
        <Suspense fallback={<LoadingSpinner />}>
          <Unauthorized />
        </Suspense>
      } />
      <Route path="*" element={
        <Suspense fallback={<LoadingSpinner />}>
          <NotFound />
        </Suspense>
      } />

      {/* Protected Routes */}
      <Route path={ROUTES.DASHBOARD} element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />

      <Route path={ROUTES.PROFILE} element={
        <ProtectedRoute>
          <Suspense fallback={<LoadingSpinner />}>
            <ProfileSettings />
          </Suspense>
        </ProtectedRoute>
      } />

      {/* Role-specific Routes */}
      {Object.entries(ROUTES).filter(([key]) =>
        ['ADMIN', 'FARMER', 'BUYER', 'DRIVER', 'WAREHOUSE'].includes(key)
      ).map(([role, routes]) => (
        <React.Fragment key={role}>
          <Route
            path={routes.DASHBOARD}
            element={
              <ProtectedRoute allowedRoles={[role]}>
                <Suspense fallback={<LoadingSpinner />}>
                  {role === 'ADMIN' && <AdminDashboard />}
                  {role === 'FARMER' && <FarmerDashboard />}
                  {role === 'BUYER' && <BuyerDashboard />}
                  {role === 'DRIVER' && <DriverDashboard />}
                  {role === 'WAREHOUSE' && <WarehouseDashboard />}
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path={routes.PROFILE}
            element={
              <ProtectedRoute allowedRoles={[role]}>
                <Suspense fallback={<LoadingSpinner />}>
                  <ProfileSettings />
                </Suspense>
              </ProtectedRoute>
            }
          />
        </React.Fragment>
      ))}
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<LoadingSpinner fullPage />}>
          <RouteConfig />
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;