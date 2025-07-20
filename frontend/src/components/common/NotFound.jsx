import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getRoleDashboard } from '../../constants/routes';

const NotFound = () => {
  const { user } = useAuth();
  const dashboardRoute = user ? getRoleDashboard(user.role) : '/login';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
          <h2 className="mt-4 text-3xl font-bold text-gray-900">
            Page Not Found
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="mt-8 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 text-left">
                <h3 className="text-sm font-medium text-blue-800">
                  Looking for something specific?
                </h3>
                <p className="mt-1 text-sm text-blue-700">
                  Try navigating from your dashboard or homepage.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4">
            <Link
              to={dashboardRoute}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {user ? 'Go to Dashboard' : 'Go to Login'}
            </Link>
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Go Home
            </Link>
          </div>
        </div>
        
        {user && (
          <div className="mt-6 text-xs text-gray-500">
            Logged in as: <span className="font-medium">{user.role}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotFound;
