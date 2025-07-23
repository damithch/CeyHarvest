import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { FaLeaf, FaTractor, FaShoppingCart, FaTruck } from 'react-icons/fa';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              Welcome to <span className="text-green-600">CeyHarvest</span>
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Sri Lanka's premier agricultural marketplace connecting farmers, buyers, and transporters.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to={ROUTES.LOGIN}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium"
              >
                Sign In
              </Link>
              <Link
                to={ROUTES.REGISTER}
                className="border border-green-600 text-green-600 hover:bg-green-50 px-6 py-3 rounded-md font-medium"
              >
                Register
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="bg-green-100 rounded-xl p-8">
              <img 
                src="/images/farmers-market.jpg" 
                alt="Agricultural Marketplace" 
                className="rounded-lg shadow-lg w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Our Platform Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                icon: <FaTractor className="text-4xl text-green-600" />,
                title: "For Farmers",
                description: "Sell your produce directly to buyers at fair prices"
              },
              {
                icon: <FaShoppingCart className="text-4xl text-blue-600" />,
                title: "For Buyers",
                description: "Source fresh agricultural products directly from farms"
              },
              {
                icon: <FaTruck className="text-4xl text-orange-600" />,
                title: "For Transporters",
                description: "Efficient logistics for agricultural goods"
              },
              {
                icon: <FaLeaf className="text-4xl text-green-500" />,
                title: "Sustainable",
                description: "Supporting Sri Lanka's agricultural ecosystem"
              }
            ].map((feature, index) => (
              <div key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <div className="mx-auto w-16 h-16 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;