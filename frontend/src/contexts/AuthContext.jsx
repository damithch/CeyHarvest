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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const checkAuth = () => {
      const adminData = localStorage.getItem('admin');
      const farmerData = localStorage.getItem('farmer');
      const buyerData = localStorage.getItem('buyer');

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

  const login = (userData, role) => {
    const userWithRole = { ...userData, role };
    setUser(userWithRole);
    
    // Store in appropriate localStorage key
    localStorage.setItem(role.toLowerCase(), JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('admin');
    localStorage.removeItem('farmer');
    localStorage.removeItem('buyer');
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
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
