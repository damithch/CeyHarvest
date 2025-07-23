// Route constants to avoid typos and centralize route management
export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  UNAUTHORIZED: '/unauthorized',

  // General protected routes
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',

  // Admin routes
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    PROFILE: '/admin/profile',
    USERS: '/admin/users',
    REPORTS: '/admin/reports',
  },

  // Buyer routes
  BUYER: {
    DASHBOARD: '/buyer/dashboard',
    PROFILE: '/buyer/profile',
    ORDERS: '/buyer/orders',
    MARKETPLACE: '/buyer/marketplace',
    CART: '/buyer/cart',
    CHECKOUT: '/buyer/checkout',
  },

  // Farmer routes
  FARMER: {
    DASHBOARD: '/farmer/dashboard',
    PROFILE: '/farmer/profile',
    PRODUCTS: '/farmer/products',
    ORDERS: '/farmer/orders',
  },

  // Driver routes
  DRIVER: {
    DASHBOARD: '/driver/dashboard',
    PROFILE: '/driver/profile',
    DELIVERIES: '/driver/deliveries',
  },

  // Warehouse routes
  WAREHOUSE: {
    DASHBOARD: '/warehouse/dashboard',
    PROFILE: '/warehouse/profile',
  },
};

// Helper function to get role-specific dashboard route
export const getRoleDashboard = (role) => {
  switch (role) {
    case 'ADMIN':
      return ROUTES.ADMIN.DASHBOARD;
    case 'BUYER':
      return ROUTES.BUYER.DASHBOARD;
    case 'FARMER':
      return ROUTES.FARMER.DASHBOARD;
    case 'DRIVER':
      return ROUTES.DRIVER.DASHBOARD;
    case 'WAREHOUSE':
      return ROUTES.WAREHOUSE.DASHBOARD;
    default:
      return ROUTES.LOGIN;
  }
};

// Helper function to get role-specific profile route
export const getRoleProfile = (role) => {
  switch (role) {
    case 'ADMIN':
      return ROUTES.ADMIN.PROFILE;
    case 'BUYER':
      return ROUTES.BUYER.PROFILE;
    case 'FARMER':
      return ROUTES.FARMER.PROFILE;
    case 'DRIVER':
      return ROUTES.DRIVER.PROFILE;
    case 'WAREHOUSE':
      return ROUTES.WAREHOUSE.PROFILE;
    default:
      return ROUTES.PROFILE;
  }
};
