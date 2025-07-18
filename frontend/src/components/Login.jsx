import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Function to detect role from email
  const detectRoleFromEmail = (email) => {
    const lowerEmail = email.toLowerCase();
    
    // Check for unique role identifiers - one pattern per role
    if (lowerEmail.endsWith('@admin.gmail.com')) {
      return 'ADMIN';
    }
    
    if (lowerEmail.endsWith('@farmer.gmail.com')) {
      return 'FARMER';
    }
    
    if (lowerEmail.endsWith('@buyer.gmail.com')) {
      return 'BUYER';
    }
    
    // Default to FARMER if no specific pattern matches
    return 'FARMER';
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Detect role from email
      const detectedRole = detectRoleFromEmail(formData.email);
      
      const endpoint = `/api/${detectedRole.toLowerCase()}/login`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      if (response.ok) {
        const userData = await response.json();
        login(userData, detectedRole);
        navigate('/dashboard');
      } else {
        const errorMsg = await response.text();
        setError(errorMsg || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to CeyHarvest
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Your role is automatically detected from your email address
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
              {formData.email && (
                <div className="mt-1 text-xs text-gray-600 px-3">
                  Detected role: <span className="font-medium text-green-600">
                    {detectRoleFromEmail(formData.email)}
                  </span>
                </div>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="mt-4 text-center">
            <div className="text-xs text-gray-500">
              <p className="font-medium mb-1">Email Role Detection:</p>
              <p>• Admin: @admin.gmail.com</p>
              <p>• Farmer: @farmer.gmail.com</p>
              <p>• Buyer: @buyer.gmail.com</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
