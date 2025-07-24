import React, { useState } from 'react';

const YieldTestComponent = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testPrediction = async () => {
    setLoading(true);
    const testData = {
      District: "Anuradhapura",
      Major_Schemes_Sown: 3500,
      Minor_Schemes_Sown: 2100,
      Rainfed_Sown: 8500,
      All_Schemes_Sown: 14100,
      Nett_Extent_Harvested: 13000
    };

    try {
      const response = await fetch('/api/yield/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult('Error: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">🧪 Yield Prediction API Test</h2>
      <button
        onClick={testPrediction}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test API Endpoint'}
      </button>
      {result && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">Result:</h3>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
};

export default YieldTestComponent;
