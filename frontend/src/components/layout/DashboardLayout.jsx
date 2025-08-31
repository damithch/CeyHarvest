import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

const DashboardLayout = ({ children, title }) => {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [cartItemCount, setCartItemCount] = useState(0);

  // Fetch cart item count for buyers
  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const response = await fetch('/api/buyer/cart', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          const totalItems = data.items?.reduce((total, item) => total + item.quantity, 0) || 0;
          setCartItemCount(totalItems);
        }
      } catch (error) {
        console.error('Error fetching cart count:', error);
        // Silently fail for cart count - don't show errors in the navigation
        setCartItemCount(0);
      }
    };

    if (user?.role === 'BUYER' && token) {
      fetchCartCount();
    }
  }, [user, token]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'FARMER': return 'bg-green-100 text-green-800';
      case 'BUYER': return 'bg-blue-100 text-blue-800';
      case 'DRIVER': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none -z-10">
        <div className="absolute top-0 left-0 w-full h-full" 
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-11.046 8.954-20 20-20s20 8.954 20 20-8.954 20-20 20-20-8.954-20-20zm-10 0c0-16.569 13.431-30 30-30s30 13.431 30 30-13.431 30-30 30-30-13.431-30-30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
               backgroundSize: '60px 60px'
             }}>
        </div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-green-200 rounded-full opacity-20 animate-float"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-emerald-200 rounded-full opacity-20 animate-float-delay-1"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-teal-200 rounded-full opacity-20 animate-float-delay-2"></div>
        <div className="absolute bottom-40 right-1/3 w-12 h-12 bg-lime-200 rounded-full opacity-20 animate-float"></div>
      </div>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">🌾</span>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  CeyHarvest
                </h1>
              </div>
              <span className="ml-4 text-lg text-gray-600 font-medium">{title}</span>
            </div>
            <div className="flex items-center space-x-4">
              {/* Buyer-specific navigation */}
              {user?.role === 'BUYER' && (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => navigate(ROUTES.BUYER.MARKETPLACE)}
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Marketplace
                  </button>
                  <button
                    onClick={() => navigate(ROUTES.BUYER.CART)}
                    className="relative text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                  >
                    <span className="mr-1">🛒</span>
                    Cart
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cartItemCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => navigate(ROUTES.BUYER.ORDERS)}
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Orders
                  </button>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Welcome, {user?.username}</span>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user?.role)}`}>
                  {user?.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
