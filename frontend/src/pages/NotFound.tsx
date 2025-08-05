import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        <div className="mx-auto h-24 w-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-8">
          <span className="text-white font-bold text-3xl">404</span>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or you entered the wrong URL.
        </p>
        
        <div className="space-y-4">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go Home
          </Link>
          
          <div className="text-sm text-gray-500">
            Or try one of these pages:
          </div>
          
          <div className="flex flex-wrap justify-center gap-2">
            <Link
              to="/jobs"
              className="text-blue-600 hover:text-blue-500 text-sm"
            >
              Jobs
            </Link>
            <span className="text-gray-400">•</span>
            <Link
              to="/feed"
              className="text-blue-600 hover:text-blue-500 text-sm"
            >
              Feed
            </Link>
            <span className="text-gray-400">•</span>
            <Link
              to="/profile"
              className="text-blue-600 hover:text-blue-500 text-sm"
            >
              Profile
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound; 