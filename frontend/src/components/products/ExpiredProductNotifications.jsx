import React, { useState, useEffect } from 'react';
import '../../styles/ExpiredProducts.css';

// Mock expired products data
const mockExpiredProducts = [
  {
    id: 1,
    name: "Organic Tomatoes",
    quantity: "25 kg",
    expiryDate: "2025-07-20",
    daysExpired: 3,
    image: "https://images.unsplash.com/photo-1592841200221-21661d707119?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    condition: "Slightly soft",
    aiRecommendation: "Juice Center",
    aiConfidence: 92,
    price: "LKR 2,500",
    actions: ["Send to Juice Center", "Use for Fertilizer", "Mark as Discarded"]
  },
  {
    id: 2,
    name: "Carrots",
    quantity: "15 kg",
    expiryDate: "2025-07-21",
    daysExpired: 2,
    image: "https://images.unsplash.com/photo-1445282768818-728615cc910a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    condition: "Good for processing",
    aiRecommendation: "Juice Center",
    aiConfidence: 88,
    price: "LKR 1,800",
    actions: ["Send to Juice Center", "Use for Fertilizer", "Mark as Discarded"]
  },
  {
    id: 3,
    name: "Leafy Greens",
    quantity: "8 kg",
    expiryDate: "2025-07-19",
    daysExpired: 4,
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    condition: "Wilted but usable",
    aiRecommendation: "Use for Fertilizer",
    aiConfidence: 95,
    price: "LKR 800",
    actions: ["Use for Fertilizer", "Send to Juice Center", "Mark as Discarded"]
  },
  {
    id: 4,
    name: "Overripe Bananas",
    quantity: "12 kg",
    expiryDate: "2025-07-18",
    daysExpired: 5,
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    condition: "Very ripe",
    aiRecommendation: "Juice Center",
    aiConfidence: 90,
    price: "LKR 1,200",
    actions: ["Send to Juice Center", "Use for Fertilizer", "Mark as Discarded"]
  }
];

const ExpiredProductNotifications = () => {
  const [expiredProducts, setExpiredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setExpiredProducts(mockExpiredProducts);
      setLoading(false);
    }, 1000);
  }, []);

  const getActionColor = (action) => {
    switch (action) {
      case "Send to Juice Center":
        return "bg-blue-500 hover:bg-blue-600";
      case "Use for Fertilizer":
        return "bg-green-500 hover:bg-green-600";
      case "Mark as Discarded":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case "Send to Juice Center":
        return "🥤";
      case "Use for Fertilizer":
        return "🌱";
      case "Mark as Discarded":
        return "🗑️";
      default:
        return "📦";
    }
  };

  const getActionTooltip = (action) => {
    switch (action) {
      case "Send to Juice Center":
        return "Send these products to a juice manufacturing facility for processing";
      case "Use for Fertilizer":
        return "Convert these organic materials into compost/fertilizer for your farm";
      case "Mark as Discarded":
        return "Mark as waste - will be disposed of properly";
      default:
        return "";
    }
  };

  const handleAction = (productId, action) => {
    setExpiredProducts(prevProducts => 
      prevProducts.filter(product => product.id !== productId)
    );
    
    // Here you would typically make an API call to record the action
    console.log(`Action taken: ${action} for product ${productId}`);
    
    // Show success message (you could use a toast notification here)
    alert(`Product successfully processed: ${action}`);
  };

  const getUrgencyLevel = (daysExpired) => {
    if (daysExpired <= 1) return { level: "low", color: "urgency-low border-yellow-400 bg-yellow-50" };
    if (daysExpired <= 3) return { level: "medium", color: "urgency-medium border-orange-400 bg-orange-50" };
    return { level: "high", color: "urgency-high border-red-400 bg-red-50" };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking for expired products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center">
            <span className="text-4xl mr-3">⚠️</span>
            Expired Products
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            These items have passed their freshness date. Please select what to do next to minimize waste and maximize value.
          </p>
        </div>

        {/* Statistics Bar */}
        {expiredProducts.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{expiredProducts.length}</div>
                <div className="text-sm text-gray-600">Expired Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {expiredProducts.reduce((sum, product) => sum + parseInt(product.quantity), 0)} kg
                </div>
                <div className="text-sm text-gray-600">Total Quantity</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  LKR {expiredProducts.reduce((sum, product) => 
                    sum + parseInt(product.price.replace(/[^\d]/g, '')), 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Potential Recovery Value</div>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {expiredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {expiredProducts.map((product) => {
              const urgency = getUrgencyLevel(product.daysExpired);
              
              return (
                <div
                  key={product.id}
                  className={`bg-white rounded-lg shadow-md border-2 ${urgency.color} overflow-hidden expired-product-card`}
                >
                  {/* Product Image */}
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover product-image"
                    />
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      {product.daysExpired} days expired
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Quantity:</span>
                        <span className="font-medium">{product.quantity}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Expired:</span>
                        <span className="font-medium text-red-600">{product.expiryDate}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Condition:</span>
                        <span className="font-medium">{product.condition}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Value:</span>
                        <span className="font-medium">{product.price}</span>
                      </div>
                    </div>

                    {/* AI Recommendation */}
                    <div className="ai-recommendation-badge bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <div className="flex items-center mb-2">
                        <span className="text-lg mr-2">🤖</span>
                        <span className="text-sm font-semibold text-blue-800">AI Recommendation</span>
                        <span className="ml-auto text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {product.aiConfidence}% confident
                        </span>
                      </div>
                      <p className="text-sm text-blue-700">
                        <strong>{product.aiRecommendation}</strong> - Best option for maximum value recovery
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      {product.actions.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => handleAction(product.id, action)}
                          className={`action-button w-full flex items-center justify-center px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 transform hover:scale-105 ${getActionColor(action)} ${
                            action === product.aiRecommendation ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''
                          }`}
                          title={getActionTooltip(action)}
                        >
                          <span className="mr-2">{getActionIcon(action)}</span>
                          {action}
                          {action === product.aiRecommendation && (
                            <span className="ml-2 text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">
                              Recommended
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Help Icon */}
                    <div className="mt-3 text-center">
                      <button className="text-gray-400 hover:text-gray-600 text-sm">
                        <span className="mr-1">ℹ️</span>
                        Need help deciding?
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* No Expired Products */
          <div className="text-center py-16">
            <div className="text-8xl mb-6">🎉</div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">
              All your produce is fresh and on track!
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              No expired products found. Keep up the great work managing your inventory!
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="font-semibold text-green-800 mb-2">💡 Pro Tips</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Check this page regularly to stay ahead</li>
                <li>• Set up expiry date reminders</li>
                <li>• Plan harvest schedules carefully</li>
              </ul>
            </div>
          </div>
        )}

        {/* Action Guide */}
        {expiredProducts.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">📋</span>
              Action Guide
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">🥤</span>
                  <h4 className="font-medium">Juice Center</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Best for fruits and vegetables that are still nutritious but past prime freshness.
                  Generates revenue and reduces waste.
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">🌱</span>
                  <h4 className="font-medium">Fertilizer</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Convert organic waste into valuable compost for your farm.
                  Sustainable and cost-effective solution.
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">🗑️</span>
                  <h4 className="font-medium">Discard</h4>
                </div>
                <p className="text-sm text-gray-600">
                  For products that are no longer safe or useful.
                  Proper disposal prevents contamination.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpiredProductNotifications;
