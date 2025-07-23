import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';
import { ROUTES, getRoleDashboard } from './constants/routes';

// Lazy-loaded components
const HomePage = lazy(() => import('./components/common/HomePage'));
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
const Unauthorized = lazy(() => import('./components/common/Unauthorized'));
const NotFound = lazy(() => import('./components/common/NotFound'));

const AppRouter = () => {
  return (
    <Routes>
      {/* Root path - shows HomePage or redirects to dashboard */}
      <Route path={ROUTES.HOME} element={<HomeOrDashboard />} />

      {/* Auth routes */}
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

      {/* Protected routes */}
      <Route path={ROUTES.DASHBOARD} element={
        <ProtectedRoute>
          <DashboardRedirect />
        </ProtectedRoute>
      } />
      <Route path={ROUTES.PROFILE} element={
        <ProtectedRoute>
          <Suspense fallback={<LoadingSpinner />}>
            <ProfileSettings />
          </Suspense>
        </ProtectedRoute>
      } />

      {/* Role-specific routes */}
      <Route path={ROUTES.ADMIN.DASHBOARD} element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <Suspense fallback={<LoadingSpinner />}>
            <AdminDashboard />
          </Suspense>
        </ProtectedRoute>
      } />
      {/* Add similar routes for other roles... */}

      {/* Error routes */}
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
    </Routes>
  );
};

const HomeOrDashboard = () => {
  const { user } = useAuth();
  return user ? (
    <Navigate to={getRoleDashboard(user.role)} replace />
  ) : (
    <Suspense fallback={<LoadingSpinner />}>
      <HomePage />
    </Suspense>
  );
};

const DashboardRedirect = () => {
  const { user } = useAuth();
  return <Navigate to={getRoleDashboard(user.role)} replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<LoadingSpinner fullPage />}>
          <AppRouter />
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;