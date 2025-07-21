import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCartIcon, GlobeAltIcon, UserGroupIcon, SparklesIcon } from '@heroicons/react/24/outline';

export default function Welcome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex flex-col items-center justify-center px-4 py-8">
      {/* Hero Section */}
      <div className="max-w-3xl w-full text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-green-800 mb-4 flex items-center justify-center gap-2">
          <span>🌾</span> Welcome to CeyHarvest
        </h1>
        <p className="text-lg md:text-xl text-gray-700 mb-6">
          The modern, smart, and fair marketplace for Sri Lankan agriculture. Buy the freshest produce, get the best prices, and support local farmers — all powered by advanced technology.
        </p>
        <Link
          to="/marketplace"
          className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg shadow-lg font-bold text-lg hover:bg-green-700 transition focus:ring-2 focus:ring-green-400"
        >
          Go to Marketplace
        </Link>
      </div>

      {/* Features Section */}
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center text-center hover:shadow-lg transition">
          <SparklesIcon className="w-10 h-10 text-yellow-500 mb-2" />
          <h2 className="text-xl font-bold text-green-800 mb-1">Smart Order Matching</h2>
          <p className="text-gray-600">Our system uses Linear Programming to match buyers with the best mix of farmers, ensuring you get the freshest products at the best price.</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center text-center hover:shadow-lg transition">
          <UserGroupIcon className="w-10 h-10 text-blue-500 mb-2" />
          <h2 className="text-xl font-bold text-green-800 mb-1">Verified Farmers</h2>
          <p className="text-gray-600">All our farmers are verified and rated, so you can buy with confidence and support local communities.</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center text-center hover:shadow-lg transition">
          <GlobeAltIcon className="w-10 h-10 text-green-500 mb-2" />
          <h2 className="text-xl font-bold text-green-800 mb-1">Geo-Aware Pricing</h2>
          <p className="text-gray-600">Delivery costs and freshness are factored in using real road distances and harvest dates, so you always get a fair deal.</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center text-center hover:shadow-lg transition">
          <ShoppingCartIcon className="w-10 h-10 text-pink-500 mb-2" />
          <h2 className="text-xl font-bold text-green-800 mb-1">Freshness Guarantee</h2>
          <p className="text-gray-600">We prioritize the freshest produce, so your order is always as close to harvest as possible.</p>
        </div>
      </div>
    </div>
  );
}
