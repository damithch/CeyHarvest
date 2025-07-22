import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const checkAuth = () => {
      const storedToken = localStorage.getItem('token');
      const adminData = localStorage.getItem('admin');
      const farmerData = localStorage.getItem('farmer');
      const buyerData = localStorage.getItem('buyer');

      if (storedToken) {
        setToken(storedToken);
      }

      if (adminData) {
        setUser({ ...JSON.parse(adminData), role: 'ADMIN' });
      } else if (farmerData) {
        setUser({ ...JSON.parse(farmerData), role: 'FARMER' });
      } else if (buyerData) {
        setUser({ ...JSON.parse(buyerData), role: 'BUYER' });
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = (response, role) => {
    const { token: jwtToken, user: userData } = response;
    const userWithRole = { ...userData, role };
    setUser(userWithRole);
    setToken(jwtToken);
    // Store JWT token and user data
    localStorage.setItem('token', jwtToken);
    // Store the full response (role, user, token, etc.) for dashboard access
    localStorage.setItem('user', JSON.stringify(response));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    localStorage.removeItem('farmer');
    localStorage.removeItem('buyer');
  };

  // Function to get authorization headers for API calls
  const getAuthHeaders = () => {
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  const value = {
    user,
    token,
    login,
    logout,
    loading,
    getAuthHeaders,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'ADMIN',
    isFarmer: user?.role === 'FARMER',
    isBuyer: user?.role === 'BUYER'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
