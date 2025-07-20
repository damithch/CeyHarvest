import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const AddProductForm = () => {
  const { user, getAuthHeaders } = useAuth();
  const [formData, setFormData] = useState({
    productName: "",
    grade: "A",
    location: "",
    quantity: "",
    price: "",
    harvestDate: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const products = [
    "Tomatoes 🍅",
    "Carrots 🥕",
    "Onions 🧅",
    "Potatoes 🥔",
    "Cabbage 🥬",
    "Lettuce 🥗",
    "Cucumber 🥒",
    "Chili Peppers 🌶️",
    "Eggplant 🍆",
    "Beans 🌱",
    "Pumpkin 🎃",
    "Cauliflower 🥦",
    "Spinach 🌿",
    "Garlic 🧄",
    "Ginger 🫚",
    "Bananas 🍌",
    "Papaya 🍈",
    "Watermelon 🍉",
    "Pineapple 🍍",
    "Mango 🥭",
    "Oranges 🍊",
    "Guava 🍐",
    "Jackfruit 🍈",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear messages when user starts typing
    if (message) setMessage("");
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      // Validate required fields
      if (!formData.productName || !formData.location || !formData.quantity || !formData.price || !formData.harvestDate) {
        throw new Error("Please fill in all required fields");
      }

      // Prepare the request data
      const requestData = {
        productName: formData.productName,
        grade: formData.grade,
        location: formData.location,
        quantity: parseFloat(formData.quantity),
        price: parseFloat(formData.price),
        harvestDate: formData.harvestDate,
        description: formData.description || ""
      };

      // Send to backend API
      const response = await fetch(`/api/farmer/${user.id}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        const result = await response.json();
        setMessage("Product added successfully! 🎉");
        setFormData({
          productName: "",
          grade: "A",
          location: "",
          quantity: "",
          price: "",
          harvestDate: "",
          description: "",
        });
        console.log("Product added:", result);
      } else {
        const errorData = await response.text();
        throw new Error(errorData || "Failed to add product");
      }
    } catch (err) {
      setError(err.message || "Failed to add product. Please try again.");
      console.error("Error submitting form:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      productName: "",
      grade: "A",
      location: "",
      quantity: "",
      price: "",
      harvestDate: "",
      description: "",
    });
    setMessage("");
    setError("");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Add New Product</h2>
          <p className="mt-1 text-sm text-gray-600">
            List your agricultural products for sale
          </p>
        </div>

        {/* Messages */}
        {message && (
          <div className="mx-6 mt-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
            {message}
          </div>
        )}

        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product Name */}
          <div>
            <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-1">
              Product Name *
            </label>
            <select
              id="productName"
              name="productName"
              required
              value={formData.productName}
              onChange={handleChange}
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white"
            >
              <option value="">-- Select Product --</option>
              {products.map((prod) => (
                <option key={prod} value={prod}>
                  {prod}
                </option>
              ))}
            </select>
          </div>

          {/* Grade Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Product Grade *
            </label>
            <div className="flex gap-4">
              {["A", "B", "C"].map((grade) => (
                <label key={grade} className="flex items-center">
                  <input
                    type="radio"
                    name="grade"
                    value={grade}
                    checked={formData.grade === grade}
                    onChange={handleChange}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Grade {grade}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Location and Quantity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <input
                id="location"
                name="location"
                type="text"
                required
                value={formData.location}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="e.g., Polonnaruwa, Anuradhapura"
              />
            </div>

            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                Quantity (kg) *
              </label>
              <input
                id="quantity"
                name="quantity"
                type="number"
                required
                min="0"
                step="0.1"
                value={formData.quantity}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Enter quantity"
              />
            </div>
          </div>

          {/* Price and Harvest Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Price per kg (Rs.) *
              </label>
              <input
                id="price"
                name="price"
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Enter price per kg"
              />
            </div>

            <div>
              <label htmlFor="harvestDate" className="block text-sm font-medium text-gray-700 mb-1">
                Harvest Date *
              </label>
              <input
                id="harvestDate"
                name="harvestDate"
                type="date"
                required
                value={formData.harvestDate}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              placeholder="Add any additional details about your product..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={handleReset}
              className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-200"
            >
              Reset Form
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding Product...
                </div>
              ) : (
                'Add Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductForm;