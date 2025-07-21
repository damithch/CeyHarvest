import React, { useState } from 'react';
import { MapPinIcon, MagnifyingGlassIcon, ChevronDownIcon, ShoppingCartIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';


const mockProducts = [
  {
    id: 1,
    name: 'Tomatoes',
    grade: 'A',
    location: 'Polonnaruwa',
    certifications: ['Organic', 'GAP'],
    priceRange: [48, 55],
    totalAvailable: 300,
    verifiedFarmers: 6,
    emoji: '🍅',
  },
  {
    id: 2,
    name: 'Brinjal',
    grade: 'B',
    location: 'Anuradhapura',
    certifications: ['GAP'],
    priceRange: [45, 52],
    totalAvailable: 180,
    verifiedFarmers: 3,
    emoji: '🍆',
  },
  {
    id: 3,
    name: 'Carrots',
    grade: 'A',
    location: 'Nuwara Eliya',
    certifications: ['Organic'],
    priceRange: [70, 75],
    totalAvailable: 200,
    verifiedFarmers: 4,
    emoji: '🥕',
  },
];

const districts = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya', 'Galle', 'Matara', 'Hambantota',
  'Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla', 'Monaragala', 'Ratnapura', 'Kegalle'
];

export default function Marketplace() {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('Colombo');

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-2 md:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-green-700 flex items-center gap-2">
            🌾 Marketplace
          </h1>
          <div className="flex flex-col md:flex-row gap-2 md:gap-4 w-full md:w-auto items-center justify-end">
            <div className="flex gap-2 mb-2 md:mb-0">
              <Link to="/login" className="bg-white border border-green-600 text-green-700 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition">Login</Link>
              <Link to="/register" className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition">Register</Link>
            </div>
            <div className="flex-1 flex gap-2 md:gap-4 w-full md:w-auto">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white"
                  placeholder="Search Products..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="relative">
                <MapPinIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                <select
                  className="pl-10 pr-8 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                >
                  {districts.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <ChevronDownIcon className="w-4 h-4 text-gray-400 absolute right-2 top-3 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Product Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockProducts.map(product => (
            <div key={product.id} className="bg-white rounded-2xl shadow p-6 flex flex-col gap-2 hover:shadow-lg transition cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{product.emoji}</span>
                <span className="text-lg font-bold text-gray-800">{product.name} – Grade {product.grade} – {product.location}</span>
                {product.certifications.map(cert => (
                  <span key={cert} className="ml-2 px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-semibold">{cert}</span>
                ))}
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                <span>Price Range: <span className="font-semibold text-green-700">Rs. {product.priceRange[0]} – Rs. {product.priceRange[1]}/kg</span></span>
                <span>Total Available: <span className="font-semibold">{product.totalAvailable} kg</span></span>
                <span>Verified Farmers: <span className="font-semibold">{product.verifiedFarmers}</span></span>
                <span>Certifications: {product.certifications.join(', ')}</span>
              </div>
              <div className="flex gap-2 mt-2">
                <button className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg flex items-center gap-1 hover:bg-blue-200 transition text-sm font-semibold">
                  <ShoppingCartIcon className="w-4 h-4" /> See All Farmers
                </button>
                <button className="bg-green-600 text-white px-3 py-1 rounded-lg flex items-center gap-1 hover:bg-green-700 transition text-sm font-semibold">
                  <ShoppingCartIcon className="w-4 h-4" /> Buy Now
                </button>
                <button className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg flex items-center gap-1 hover:bg-gray-200 transition text-sm font-semibold">
                  <ChartBarIcon className="w-4 h-4" /> Price Trend
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 