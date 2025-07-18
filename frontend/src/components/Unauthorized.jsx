import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Unauthorized = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-6xl font-extrabold text-red-600">
            403
          </h2>
          <h3 className="mt-4 text-3xl font-bold text-gray-900">
            Access Denied
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            You don't have permission to access this resource.
          </p>
          {user && (
            <p className="mt-2 text-sm text-gray-500">
              Current role: <span className="font-medium">{user.role}</span>
            </p>
          )}
        </div>
        <div className="mt-8 space-y-4">
          <Link
            to="/dashboard"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go to Dashboard
          </Link>
          <Link
            to="/login"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Login with Different Role
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
