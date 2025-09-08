import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Users, Shield, TrendingUp } from 'lucide-react';

const Home: React.FC = () => {
  const { state, isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            E-commerce DevOps Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A complete e-commerce application designed for practicing DevOps principles, 
            atomic commits, and CI/CD pipelines with modern technologies.
          </p>

          {state.isAuthenticated ? (
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Welcome back, {state.user?.firstName}! 👋
              </h2>
              <div className="flex items-center justify-center space-x-2 mb-4">
                <span className="text-gray-600">Logged in as:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isAdmin 
                    ? 'bg-amber-100 text-amber-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {isAdmin && <Shield className="w-4 h-4 inline mr-1" />}
                  {state.user?.role}
                </span>
              </div>
              <div className="space-y-3">
                <Link
                  to="/profile"
                  className="block w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  View Profile
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="block w-full bg-amber-600 text-white py-2 px-4 rounded-md hover:bg-amber-700 transition-colors"
                  >
                    Admin Dashboard
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <Link
                to="/register"
                className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-indigo-700 transition-colors inline-block"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto bg-white text-indigo-600 px-8 py-3 rounded-md text-lg font-medium border-2 border-indigo-600 hover:bg-indigo-50 transition-colors inline-block"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">E-commerce Features</h3>
            <p className="text-gray-600">Complete shopping experience with cart, orders, and payments</p>
          </div>

          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">User Management</h3>
            <p className="text-gray-600">Authentication, authorization, and role-based access control</p>
          </div>

          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Admin Panel</h3>
            <p className="text-gray-600">Administrative features for managing products and orders</p>
          </div>

          <div className="text-center">
            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">DevOps Ready</h3>
            <p className="text-gray-600">Docker, CI/CD, testing, and deployment configurations</p>
          </div>
        </div>

        {/* Demo Accounts */}
        <div className="mt-20 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Demo Accounts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <Shield className="w-5 h-5 text-amber-500 mr-2" />
                Admin Account
              </h3>
              <p className="text-gray-600 mb-3">Full access to admin features</p>
              <div className="bg-gray-50 rounded p-3">
                <p className="text-sm font-mono">Email: admin@example.com</p>
                <p className="text-sm font-mono">Password: admin123</p>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <Users className="w-5 h-5 text-blue-500 mr-2" />
                Customer Account
              </h3>
              <p className="text-gray-600 mb-3">Standard customer features</p>
              <div className="bg-gray-50 rounded p-3">
                <p className="text-sm font-mono">Email: customer@example.com</p>
                <p className="text-sm font-mono">Password: customer123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;