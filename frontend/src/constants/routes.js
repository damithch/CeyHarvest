export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  UNAUTHORIZED: '/unauthorized',

  // Protected routes
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',

  // Role-specific routes
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    PROFILE: '/admin/profile'
  },
  BUYER: {
    DASHBOARD: '/buyer/dashboard',
    PROFILE: '/buyer/profile'
  },
  FARMER: {
    DASHBOARD: '/farmer/dashboard',
    PROFILE: '/farmer/profile'
  },
  DRIVER: {
    DASHBOARD: '/driver/dashboard',
    PROFILE: '/driver/profile'
  },
  WAREHOUSE: {
    DASHBOARD: '/warehouse/dashboard',
    PROFILE: '/warehouse/profile'
  }
};

export const getRoleDashboard = (role) => {
  const dashboards = {
    ADMIN: ROUTES.ADMIN.DASHBOARD,
    BUYER: ROUTES.BUYER.DASHBOARD,
    FARMER: ROUTES.FARMER.DASHBOARD,
    DRIVER: ROUTES.DRIVER.DASHBOARD,
    WAREHOUSE: ROUTES.WAREHOUSE.DASHBOARD
  };
  return dashboards[role] || ROUTES.LOGIN;
};

export const getRoleProfile = (role) => {
  const profiles = {
    ADMIN: ROUTES.ADMIN.PROFILE,
    BUYER: ROUTES.BUYER.PROFILE,
    FARMER: ROUTES.FARMER.PROFILE,
    DRIVER: ROUTES.DRIVER.PROFILE,
    WAREHOUSE: ROUTES.WAREHOUSE.PROFILE
  };
  return profiles[role] || ROUTES.PROFILE;
};