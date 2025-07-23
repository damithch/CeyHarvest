import { useState } from 'react'
import { FaTractor, FaShoppingCart, FaTruck, FaChartLine, FaUserShield, FaLeaf } from 'react-icons/fa'
import { MdOutlineSupportAgent } from 'react-icons/md'

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('farmers')

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <FaLeaf className="h-8 w-8 text-green-600" />
              <span className="ml-2 text-xl font-bold text-green-800">CeyHarvest</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-green-800 hover:text-green-600 font-medium">Home</a>
              <a href="#" className="text-gray-500 hover:text-green-600 font-medium">Services</a>
              <a href="#" className="text-gray-500 hover:text-green-600 font-medium">About</a>
              <a href="#" className="text-gray-500 hover:text-green-600 font-medium">Contact</a>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition duration-300">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Connecting <span className="text-green-600">Farmers</span> with <span className="text-green-600">Buyers</span> & <span className="text-green-600">Transport</span>
              </h1>
              <p className="mt-4 text-lg text-gray-600">
                CeyHarvest bridges the gap between agricultural producers, buyers, and logistics providers in Sri Lanka. Our platform ensures fair prices, efficient distribution, and transparent transactions.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium transition duration-300">
                  Join as Farmer
                </button>
                <button className="border border-green-600 text-green-600 hover:bg-green-50 px-6 py-3 rounded-md font-medium transition duration-300">
                  Explore Marketplace
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-green-100 rounded-xl p-8">
                <img
                  src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
                  alt="Farmers Market"
                  className="rounded-lg shadow-lg w-full h-auto"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-md hidden md:block">
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-full">
                    <FaTruck className="text-green-600 text-xl" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-500">Transport Partners</p>
                    <p className="font-bold text-green-700">250+ Vehicles</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 bg-white p-4 rounded-lg shadow-md hidden md:block">
                <div className="flex items-center">
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <FaShoppingCart className="text-yellow-600 text-xl" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-500">Active Buyers</p>
                    <p className="font-bold text-yellow-700">1,200+</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Our Platform Features</h2>
            <p className="mt-4 max-w-2xl mx-auto text-gray-600">
              CeyHarvest provides comprehensive solutions for all stakeholders in the agricultural supply chain
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <FaTractor className="text-3xl text-green-600" />,
                title: "For Farmers",
                description: "Direct access to buyers, fair pricing, and reduced middlemen. Get your products to market faster with our logistics network."
              },
              {
                icon: <FaShoppingCart className="text-3xl text-blue-600" />,
                title: "For Buyers",
                description: "Source fresh produce directly from farmers. Quality assurance, transparent pricing, and reliable delivery options."
              },
              {
                icon: <FaTruck className="text-3xl text-orange-600" />,
                title: "For Transporters",
                description: "Optimize your vehicle utilization with our logistics platform. Regular assignments and fair compensation."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl hover:shadow-md transition duration-300">
                <div className="bg-white p-3 rounded-full w-12 h-12 flex items-center justify-center shadow-sm">
                  {feature.icon}
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "5,000+", label: "Farmers" },
              { number: "1,200+", label: "Buyers" },
              { number: "250+", label: "Transporters" },
              { number: "10,000+", label: "Monthly Transactions" }
            ].map((stat, index) => (
              <div key={index}>
                <p className="text-4xl font-bold">{stat.number}</p>
                <p className="mt-2 text-green-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">How CeyHarvest Works</h2>
            <p className="mt-4 max-w-2xl mx-auto text-gray-600">
              Simple steps to connect the agricultural ecosystem
            </p>
          </div>

          <div className="mt-12">
            <div className="flex justify-center mb-8">
              <button
                onClick={() => setActiveTab('farmers')}
                className={`px-6 py-2 font-medium ${activeTab === 'farmers' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500'}`}
              >
                Farmers
              </button>
              <button
                onClick={() => setActiveTab('buyers')}
                className={`px-6 py-2 font-medium ${activeTab === 'buyers' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500'}`}
              >
                Buyers
              </button>
              <button
                onClick={() => setActiveTab('transport')}
                className={`px-6 py-2 font-medium ${activeTab === 'transport' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500'}`}
              >
                Transport
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {activeTab === 'farmers' && [
                { step: "1", title: "Register", description: "Create your farmer profile with product details" },
                { step: "2", title: "List Produce", description: "Add your available crops with quality specifications" },
                { step: "3", title: "Receive Offers", description: "Get competitive offers from verified buyers" },
                { step: "4", title: "Arrange Transport", description: "Schedule pickup with our transport partners" }
              ].map((item, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-lg text-center">
                  <div className="bg-green-100 text-green-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                    {item.step}
                  </div>
                  <h3 className="mt-4 font-semibold text-gray-900">{item.title}</h3>
                  <p className="mt-2 text-gray-600">{item.description}</p>
                </div>
              ))}

              {activeTab === 'buyers' && [
                { step: "1", title: "Sign Up", description: "Create your buyer account with business details" },
                { step: "2", title: "Browse Marketplace", description: "Explore fresh produce from verified farmers" },
                { step: "3", title: "Place Orders", description: "Negotiate prices and place your orders" },
                { step: "4", title: "Track Delivery", description: "Monitor your shipment in real-time" }
              ].map((item, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-lg text-center">
                  <div className="bg-blue-100 text-blue-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                    {item.step}
                  </div>
                  <h3 className="mt-4 font-semibold text-gray-900">{item.title}</h3>
                  <p className="mt-2 text-gray-600">{item.description}</p>
                </div>
              ))}

              {activeTab === 'transport' && [
                { step: "1", title: "Register Vehicle", description: "Add your transport details and capacity" },
                { step: "2", title: "Get Assignments", description: "Receive optimized delivery routes" },
                { step: "3", title: "Confirm Pickup", description: "Verify goods and document condition" },
                { step: "4", title: "Complete Delivery", description: "Deliver to buyer and get rated" }
              ].map((item, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-lg text-center">
                  <div className="bg-orange-100 text-orange-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                    {item.step}
                  </div>
                  <h3 className="mt-4 font-semibold text-gray-900">{item.title}</h3>
                  <p className="mt-2 text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">What Our Users Say</h2>
            <p className="mt-4 max-w-2xl mx-auto text-gray-600">
              Trusted by farmers, buyers, and transporters across Sri Lanka
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "CeyHarvest helped me get 30% better prices for my vegetables compared to traditional middlemen.",
                name: "Kamal Perera",
                role: "Farmer, Kandy",
                icon: <FaLeaf className="text-green-600" />
              },
              {
                quote: "As a supermarket chain, we now get fresher produce directly from farms at competitive prices.",
                name: "Nimali Fernando",
                role: "Procurement Manager",
                icon: <FaShoppingCart className="text-blue-600" />
              },
              {
                quote: "My trucks are now utilized 80% of the time thanks to CeyHarvest's logistics platform.",
                name: "Sarath Silva",
                role: "Transport Owner",
                icon: <FaTruck className="text-orange-600" />
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                <div className="text-2xl">
                  {testimonial.icon}
                </div>
                <p className="mt-4 text-gray-600 italic">"{testimonial.quote}"</p>
                <div className="mt-6">
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold">Ready to Transform Agriculture?</h2>
          <p className="mt-4 max-w-2xl mx-auto">
            Join CeyHarvest today and be part of Sri Lanka's agricultural revolution
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button className="bg-white text-green-800 hover:bg-gray-100 px-6 py-3 rounded-md font-medium transition duration-300">
              Sign Up Now
            </button>
            <button className="border border-white text-white hover:bg-green-700 px-6 py-3 rounded-md font-medium transition duration-300">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">CeyHarvest</h3>
              <p className="text-gray-400">
                Connecting Sri Lanka's agricultural ecosystem through technology.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Home</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Services</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Services</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">For Farmers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">For Buyers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">For Transport</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Market Insights</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <ul className="space-y-2 text-gray-400">
                <li>123 Agricultural Lane, Colombo</li>
                <li>info@ceyharvest.lk</li>
                <li>+94 11 234 5678</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} CeyHarvest. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage