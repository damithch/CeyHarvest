import React from 'react';
import { Link } from 'react-router-dom';

const Welcome = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Welcome to CeyHarvest
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Your agricultural marketplace connecting farmers and buyers
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/login"
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-200"
          >
            Sign In
          </Link>
          
          <Link
            to="/register"
            className="w-full flex justify-center py-3 px-4 border border-green-600 text-sm font-medium rounded-md text-green-600 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-200"
          >
            Create New Account
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            <p className="font-medium mb-2">Account Types:</p>
            <div className="space-y-1">
              <p>🌾 <strong>Farmers:</strong> Sell your products directly</p>
              <p>🛒 <strong>Buyers:</strong> Source fresh agricultural products</p>
              <p>⚙️ <strong>Admin:</strong> System management (contact administrator)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
