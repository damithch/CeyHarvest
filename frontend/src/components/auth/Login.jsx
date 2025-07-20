import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    identifier: '', // Can be email or phone number
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResendOption, setShowResendOption] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleResendVerification = async () => {
    setResendMessage('Sending...');
    try {
      const response = await fetch('/api/verification/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resendEmail,
          userType: 'UNKNOWN' // Will be determined by the service
        }),
      });

      if (response.ok) {
        setResendMessage('Verification code sent! Please check your email.');
      } else {
        const errorMsg = await response.text();
        setResendMessage(`Failed to send: ${errorMsg}`);
      }
    } catch (err) {
      setResendMessage('Network error. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting login with:', { identifier: formData.identifier });
      
      // Use unified login endpoint that accepts email or phone
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: formData.identifier, // Can be email or phone
          password: formData.password
        }),
      });

      console.log('Login response status:', response.status);
      console.log('Login response URL:', response.url);

      if (response.ok) {
        const responseData = await response.json();
        console.log('Login successful:', responseData);
        const userRole = responseData.role;
        login(responseData, userRole);
        navigate('/dashboard');
      } else {
        const errorData = await response.text();
        console.error('Login error:', errorData);
        
        // Try to parse as JSON to check for unverified email
        try {
          const errorJson = JSON.parse(errorData);
          if (errorJson.error === 'UNVERIFIED_EMAIL') {
            setShowResendOption(true);
            setResendEmail(errorJson.email);
            setError(errorJson.message);
          } else {
            setError(errorJson.message || 'Invalid email/phone or password');
          }
        } catch {
          // Not JSON, treat as plain text error
          setError(errorData || 'Invalid email/phone or password');
        }
      }
    } catch (err) {
      console.error('Login network error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-green-600 mb-2">🌱 CeyHarvest</h1>
            <h2 className="text-2xl font-extrabold text-gray-900">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to your account
            </p>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">
                Email or Phone Number
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                required
                value={formData.identifier}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email or phone number"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Enter your password"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {showResendOption && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
              <div className="flex flex-col space-y-2">
                <p className="text-sm">
                  Your email <strong>{resendEmail}</strong> is not verified yet.
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    className="text-sm bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition duration-200"
                  >
                    Resend Verification Code
                  </button>
                  <Link
                    to="/register"
                    className="text-sm text-blue-600 hover:text-blue-500 underline"
                  >
                    Go to Registration
                  </Link>
                </div>
                {resendMessage && (
                  <p className="text-sm mt-2 text-gray-700">{resendMessage}</p>
                )}
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition duration-200"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-center w-full space-y-2">
              <div>
                <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                  Forgot your password?
                </Link>
              </div>
              <div>
                <span className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/register" className="font-medium text-green-600 hover:text-green-500">
                    Sign up here
                  </Link>
                </span>
              </div>
            </div>
          </div>

          {/* Features Info */}
          <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-md p-4">
            <div className="text-xs text-gray-700">
              <p className="font-medium mb-2 text-green-700">🌾 Connect & Trade Fresh Produce</p>
              <div className="grid grid-cols-1 gap-2">
                <p>• <strong>Farmers:</strong> Sell your harvest directly</p>
                <p>• <strong>Buyers:</strong> Source fresh, quality produce</p>
                <p>• <strong>Drivers:</strong> Efficient delivery services</p>
              </div>
              <p className="mt-2 text-green-600 font-medium">
                Join Sri Lanka's premier agricultural marketplace!
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
