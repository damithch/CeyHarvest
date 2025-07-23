import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const YieldPrediction = () => {
  const { getAuthHeaders } = useAuth();
  const [formData, setFormData] = useState({
    District: '',
    Major_Schemes_Sown: '',
    Minor_Schemes_Sown: '',
    Rainfed_Sown: '',
    All_Schemes_Sown: '',
    Nett_Extent_Harvested: ''
  });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const districts = [
    'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle', 
    'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara', 'Kandy', 'Kegalle', 
    'Kilinochchi', 'Kurunegala', 'Mannar', 'Matale', 'Matara', 'Monaragala', 
    'Mullaitivu', 'Nuwara Eliya', 'Polonnaruwa', 'Puttalam', 'Ratnapura', 
    'Trincomalee', 'Vavuniya'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPrediction(null);

    // Convert string values to integers for numeric fields
    const requestData = {
      District: formData.District,
      Major_Schemes_Sown: parseInt(formData.Major_Schemes_Sown) || 0,
      Minor_Schemes_Sown: parseInt(formData.Minor_Schemes_Sown) || 0,
      Rainfed_Sown: parseInt(formData.Rainfed_Sown) || 0,
      All_Schemes_Sown: parseInt(formData.All_Schemes_Sown) || 0,
      Nett_Extent_Harvested: parseInt(formData.Nett_Extent_Harvested) || 0
    };

    try {
      const response = await fetch('/api/yield/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setPrediction(data);
      } else {
        setError(data.error || 'Failed to get prediction');
      }
    } catch (err) {
      console.error('Prediction error:', err);
      if (err.message.includes('403')) {
        setError('Authentication required. Please make sure you are logged in.');
      } else if (err.message.includes('Failed to fetch')) {
        setError('Network error. Please check if the backend server is running on port 8080.');
      } else if (err.message.includes('5000') || err.message.includes('Flask')) {
        setError('ML API error. Please check if the Flask ML API is running on port 5000.');
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      District: '',
      Major_Schemes_Sown: '',
      Minor_Schemes_Sown: '',
      Rainfed_Sown: '',
      All_Schemes_Sown: '',
      Nett_Extent_Harvested: ''
    });
    setPrediction(null);
    setError('');
  };

  return (
    <div className="yield-prediction-container">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="mr-2">🌾</span>
          Paddy Yield Prediction
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  District
                </label>
                <select
                  name="District"
                  value={formData.District}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select District</option>
                  {districts.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Major Schemes Sown (hectares)
                </label>
                <input
                  type="number"
                  name="Major_Schemes_Sown"
                  value={formData.Major_Schemes_Sown}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 3500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minor Schemes Sown (hectares)
                </label>
                <input
                  type="number"
                  name="Minor_Schemes_Sown"
                  value={formData.Minor_Schemes_Sown}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 2100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rainfed Sown (hectares)
                </label>
                <input
                  type="number"
                  name="Rainfed_Sown"
                  value={formData.Rainfed_Sown}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 8500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  All Schemes Sown (hectares)
                </label>
                <input
                  type="number"
                  name="All_Schemes_Sown"
                  value={formData.All_Schemes_Sown}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 14100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Net Extent Harvested (hectares)
                </label>
                <input
                  type="number"
                  name="Nett_Extent_Harvested"
                  value={formData.Nett_Extent_Harvested}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 13000"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Predicting...
                    </span>
                  ) : (
                    'Get Prediction'
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>

          {/* Results Panel */}
          <div>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">{error}</div>
                  </div>
                </div>
              </div>
            )}

            {prediction && (
              <div className="bg-green-50 border border-green-200 rounded-md p-6">
                <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                  <span className="mr-2">📊</span>
                  Prediction Results
                </h3>
                
                <div className="space-y-3">
                  <div className="bg-white rounded-md p-4 border border-green-100">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-1">
                        {typeof prediction.predicted_yield === 'number' 
                          ? prediction.predicted_yield.toLocaleString() 
                          : prediction.predicted_yield} kg
                      </div>
                      <div className="text-sm text-gray-600">Predicted Paddy Yield</div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-md p-4 border border-green-100">
                    <h4 className="font-medium text-gray-700 mb-2">Input Summary:</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div><strong>District:</strong> {prediction.input_data.District}</div>
                      <div><strong>Total Sown Area:</strong> {prediction.input_data.All_Schemes_Sown.toLocaleString()} hectares</div>
                      <div><strong>Harvested Area:</strong> {prediction.input_data.Nett_Extent_Harvested.toLocaleString()} hectares</div>
                    </div>
                  </div>
                  
                  {typeof prediction.predicted_yield === 'number' && prediction.input_data.Nett_Extent_Harvested > 0 && (
                    <div className="bg-white rounded-md p-4 border border-green-100">
                      <h4 className="font-medium text-gray-700 mb-2">Yield Efficiency:</h4>
                      <div className="text-sm text-gray-600">
                        <strong>{(prediction.predicted_yield / prediction.input_data.Nett_Extent_Harvested).toFixed(2)} kg/hectare</strong>
                        <div className="text-xs text-gray-500 mt-1">
                          Average yield per harvested hectare
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!prediction && !error && !loading && (
              <div className="text-center text-gray-500 py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p>Fill in the form to get yield predictions</p>
                <p className="text-xs mt-2">Enter your farming data to predict paddy yield using ML</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default YieldPrediction;
