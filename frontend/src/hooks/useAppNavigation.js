import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES, getRoleDashboard, getRoleProfile } from '../constants/routes';

/**
 * Custom hook for consistent navigation throughout the app
 * Provides role-aware navigation methods
 */
export const useAppNavigation = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const goToDashboard = () => {
    if (user?.role) {
      const roleDashboard = getRoleDashboard(user.role);
      navigate(roleDashboard);
    } else {
      navigate(ROUTES.LOGIN);
    }
  };

  const goToProfile = () => {
    if (user?.role) {
      const roleProfile = getRoleProfile(user.role);
      navigate(roleProfile);
    } else {
      navigate(ROUTES.LOGIN);
    }
  };

  const goToLogin = () => {
    navigate(ROUTES.LOGIN);
  };

  const goToHome = () => {
    navigate(ROUTES.HOME);
  };

  const goToUnauthorized = () => {
    navigate(ROUTES.UNAUTHORIZED);
  };

  // Role-specific navigation methods
  const goToBuyerOrders = () => {
    if (user?.role === 'BUYER') {
      navigate(ROUTES.BUYER.ORDERS);
    } else {
      goToUnauthorized();
    }
  };

  const goToBuyerMarketplace = () => {
    if (user?.role === 'BUYER') {
      navigate(ROUTES.BUYER.MARKETPLACE);
    } else {
      goToUnauthorized();
    }
  };

  const goToFarmerProducts = () => {
    if (user?.role === 'FARMER') {
      navigate(ROUTES.FARMER.PRODUCTS);
    } else {
      goToUnauthorized();
    }
  };

  const goToDriverDeliveries = () => {
    if (user?.role === 'DRIVER') {
      navigate(ROUTES.DRIVER.DELIVERIES);
    } else {
      goToUnauthorized();
    }
  };

  const goToAdminUsers = () => {
    if (user?.role === 'ADMIN') {
      navigate(ROUTES.ADMIN.USERS);
    } else {
      goToUnauthorized();
    }
  };

  return {
    // General navigation
    goToDashboard,
    goToProfile,
    goToLogin,
    goToHome,
    goToUnauthorized,
    
    // Role-specific navigation
    goToBuyerOrders,
    goToBuyerMarketplace,
    goToFarmerProducts,
    goToDriverDeliveries,
    goToAdminUsers,
    
    // Direct navigate access for custom navigation
    navigate,
    
    // Current user info
    user,
    userRole: user?.role,
    isLoggedIn: !!user,
  };
};
