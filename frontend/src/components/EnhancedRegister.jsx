import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const EnhancedRegister = () => {
  const [step, setStep] = useState(1); // 1: Registration Form, 2: Verification
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    city: '',
    postalCode: '',
    password: '',
    confirmPassword: '',
    role: ''
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [registrationEmail, setRegistrationEmail] = useState('');
  const [registrationUserType, setRegistrationUserType] = useState('');
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Debounce function for email checking
  const debounce = useCallback((func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  }, []);

  const debouncedEmailCheck = useCallback(
    debounce((email) => checkEmailAvailability(email), 500),
    []
  );

  // Available roles for registration
  const availableRoles = [
    { value: 'FARMER', label: 'Farmer', description: 'I want to sell agricultural products' },
    { value: 'BUYER', label: 'Buyer/Customer', description: 'I want to purchase agricultural products' },
    { value: 'DRIVER', label: 'Driver', description: 'I want to provide delivery services' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Check email availability when email field changes
    if (e.target.name === 'email') {
      if (e.target.value) {
        // Reset state when user starts typing a new email
        setEmailAvailable(null);
        setCheckingEmail(false);
        if (error && error.includes('Email already registered')) {
          setError('');
        }
        debouncedEmailCheck(e.target.value);
      } else {
        // Clear email status when field is empty
        setEmailAvailable(null);
        setCheckingEmail(false);
        if (error && error.includes('Email already registered')) {
          setError('');
        }
      }
    }
  };

  const checkEmailAvailability = async (email) => {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailAvailable(null);
      setCheckingEmail(false);
      return;
    }

    setCheckingEmail(true);
    setEmailAvailable(null);
    
    try {
      const response = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
      if (response.ok) {
        const data = await response.json();
        setEmailAvailable(!data.exists);
        if (data.exists) {
          setError(`Email already registered as ${data.role.toLowerCase()}. Please try logging in instead or use a different email address.`);
        } else {
          // Clear error if email is available
          if (error && error.includes('Email already registered')) {
            setError('');
          }
        }
      }
    } catch (err) {
      console.error('Error checking email:', err);
      setEmailAvailable(null);
    } finally {
      setCheckingEmail(false);
    }
  };

  const sendVerificationCode = async () => {
    try {
      // Call the appropriate registration endpoint which will send verification email
      const endpoint = `/api/${formData.role.toLowerCase()}/register`;
      const registrationData = {
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        password: formData.password
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData),
      });

      if (response.ok) {
        const responseData = await response.json();
        if (responseData.requiresVerification) {
          setSuccess(`Registration initiated! Please check your email for verification code`);
          // Store the registration data for verification step
          setRegistrationEmail(formData.email);
          setRegistrationUserType(formData.role);
        } else {
          setSuccess(`Registration successful!`);
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      } else {
        const errorMsg = await response.text();
        throw new Error(errorMsg || 'Failed to initiate registration');
      }
      
    } catch (error) {
      console.error('Registration initiation error:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validation
    if (!formData.role) {
      setError('Please select your role');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    // Required fields validation
    if (!formData.firstName || !formData.lastName) {
      setError('First name and last name are required');
      setLoading(false);
      return;
    }

    // Email availability validation
    if (emailAvailable === false) {
      setError('Email is already registered. Please use a different email address or try logging in.');
      setLoading(false);
      return;
    }

    if (emailAvailable === null) {
      setError('Please wait while we check email availability.');
      setLoading(false);
      return;
    }

    try {
      // Send verification code and move to step 2
      await sendVerificationCode();
      setStep(2);
    } catch (err) {
      // Display the actual error message from the backend with helpful suggestions
      let errorMessage = err.message || 'Failed to send verification code. Please try again.';
      
      // Make email duplicate errors more user-friendly
      if (errorMessage.includes('Email already registered')) {
        errorMessage += '. Please try logging in instead or use a different email address.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Call the backend verification endpoint
      const response = await fetch('/api/verification/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: registrationEmail,
          code: verificationCode,
          name: `${formData.firstName} ${formData.lastName}`.trim() || formData.username
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        setSuccess(`Registration completed successfully! You can now login.`);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        const errorMsg = await response.text();
        setError(errorMsg || 'Verification failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/verification/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: registrationEmail,
          userType: registrationUserType
        }),
      });

      if (response.ok) {
        setSuccess('Verification code resent to your email!');
      } else {
        const errorMsg = await response.text();
        setError(errorMsg || 'Failed to resend code');
      }
    } catch (err) {
      setError('Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Verify Your Email
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter the 6-digit code sent to your email
            </p>
            <p className="mt-1 text-center text-sm text-green-600 font-medium">
              {registrationEmail}
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleVerification}>
            <div>
              <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-1">
                Verification Code
              </label>
              <input
                id="verificationCode"
                name="verificationCode"
                type="text"
                maxLength="6"
                required
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm text-center text-lg tracking-widest"
                placeholder="000000"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
                {success}
              </div>
            )}

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading || verificationCode.length !== 6}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              >
                {loading ? 'Verifying...' : 'Verify & Create Account'}
              </button>

              <button
                type="button"
                onClick={resendCode}
                disabled={loading}
                className="w-full text-sm text-green-600 hover:text-green-500 font-medium"
              >
                Resend Code
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-sm text-gray-600 hover:text-gray-500"
              >
                ← Back to Registration Form
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Join CeyHarvest
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create your account with email verification
          </p>
        </div>

        <form className="mt-8 space-y-6 bg-white p-6 rounded-lg shadow" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Enter first name"
              />
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Enter last name"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username *
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={formData.username}
              onChange={handleChange}
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              placeholder="Enter your username"
            />
          </div>

          {/* Email and Phone fields */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`appearance-none relative block w-full px-3 py-2 pr-10 border ${
                  emailAvailable === false ? 'border-red-300 bg-red-50' : 
                  emailAvailable === true ? 'border-green-300 bg-green-50' : 
                  'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
                placeholder="Enter your email address"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {checkingEmail && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
                )}
                {!checkingEmail && emailAvailable === true && (
                  <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                {!checkingEmail && emailAvailable === false && (
                  <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
            {emailAvailable === true && (
              <p className="mt-1 text-sm text-green-600">✓ Email is available</p>
            )}
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number (Optional)
            </label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              placeholder="Enter your phone number"
            />
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Address Information</h3>
            
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                id="address"
                name="address"
                rows={2}
                value={formData.address}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Enter your full address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="Enter your city"
                />
              </div>

              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Code
                </label>
                <input
                  id="postalCode"
                  name="postalCode"
                  type="text"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="Enter postal code"
                />
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              I am a... *
            </label>
            <select
              id="role"
              name="role"
              required
              value={formData.role}
              onChange={handleChange}
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white"
            >
              <option value="">Select your role</option>
              {availableRoles.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
            
            {/* Role Description */}
            {formData.role && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-700">
                  <strong>{availableRoles.find(r => r.value === formData.role)?.label}:</strong>{' '}
                  {availableRoles.find(r => r.value === formData.role)?.description}
                </p>
              </div>
            )}
          </div>

          {/* Password Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Enter your password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Confirm your password"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
              {error.includes('Email already registered') && (
                <div className="mt-2">
                  <Link 
                    to="/login" 
                    className="text-green-600 hover:text-green-800 underline font-medium"
                  >
                    Go to Login Page
                  </Link>
                </div>
              )}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
              {success}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              {loading ? 'Processing...' : 'Continue with Email Verification'}
            </button>
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-green-600 hover:text-green-500">
                Sign in here
              </Link>
            </span>
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="text-xs text-blue-700">
              <p className="font-medium mb-2">🌱 Welcome to CeyHarvest!</p>
              <p className="mb-1">• <strong>Farmers:</strong> List and sell your agricultural products</p>
              <p className="mb-1">• <strong>Buyers:</strong> Browse and purchase fresh produce</p>
              <p className="mb-1">• <strong>Drivers:</strong> Provide delivery services</p>
              <p className="mt-2 text-blue-600 font-medium">
                Choose your role above to get started!
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnhancedRegister;
