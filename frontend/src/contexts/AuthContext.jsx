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
      const combined = localStorage.getItem('user');
      const adminData = localStorage.getItem('admin');
      const farmerData = localStorage.getItem('farmer');
      const buyerData = localStorage.getItem('buyer');

      if (storedToken) setToken(storedToken);

      // Prefer the combined 'user' payload if present
      if (combined) {
        try {
          const parsed = JSON.parse(combined);
          const normalizedRole = parsed.role?.startsWith('ROLE_') ? parsed.role.replace('ROLE_', '') : parsed.role;
          if (parsed.token && !storedToken) setToken(parsed.token);
          
          // Handle different user data structures
          if (parsed.user) {
            // Structure: { role, user: {...}, token }
            setUser({ ...parsed.user, role: normalizedRole });
          } else if (normalizedRole === 'WAREHOUSE') {
            // Handle warehouse user structure
            setUser({ ...parsed, role: normalizedRole });
          } else {
            // Direct user object with role
            setUser({ ...parsed, role: normalizedRole });
          }
        } catch (error) {
          console.error('Error parsing combined user data:', error);
          // Fallback to legacy keys if combined parsing fails
          if (adminData) {
            try {
              setUser({ ...JSON.parse(adminData), role: 'ADMIN' });
            } catch (e) {
              console.error('Error parsing admin data:', e);
            }
          } else if (farmerData) {
            try {
              setUser({ ...JSON.parse(farmerData), role: 'FARMER' });
            } catch (e) {
              console.error('Error parsing farmer data:', e);
            }
          } else if (buyerData) {
            try {
              setUser({ ...JSON.parse(buyerData), role: 'BUYER' });
            } catch (e) {
              console.error('Error parsing buyer data:', e);
            }
          }
        }
      } else {
        // Fallback to individual role-specific keys
        try {
          if (adminData) {
            setUser({ ...JSON.parse(adminData), role: 'ADMIN' });
          } else if (farmerData) {
            setUser({ ...JSON.parse(farmerData), role: 'FARMER' });
          } else if (buyerData) {
            setUser({ ...JSON.parse(buyerData), role: 'BUYER' });
          }
        } catch (error) {
          console.error('Error parsing legacy user data:', error);
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = (response, role) => {
    // Normalize role (strip ROLE_ prefix if present)
    let normalizedRole = role;
    if (role && role.startsWith('ROLE_')) {
      normalizedRole = role.replace('ROLE_', '');
    }
    
    const { token: jwtToken, user: userData } = response;
    const userWithRole = { ...userData, role: normalizedRole };
    
    setUser(userWithRole);
    setToken(jwtToken);
    
    // Store JWT token and user data
    localStorage.setItem('token', jwtToken);
    // Store the full response (role, user, token, etc.) for dashboard access, with normalized role
    localStorage.setItem('user', JSON.stringify({ ...response, role: normalizedRole }));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
    isBuyer: user?.role === 'BUYER',
    isWarehouse: user?.role === 'WAREHOUSE'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};