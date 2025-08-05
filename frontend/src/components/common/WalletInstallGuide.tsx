import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

interface WalletInstallGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const WalletInstallGuide: React.FC<WalletInstallGuideProps> = ({ isOpen, onClose }) => {
  const handleInstallPhantom = () => {
    window.open('https://phantom.app/', '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Install Phantom Wallet
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Phantom Wallet Required
                </h3>
                <p className="text-gray-600 mb-6">
                  To use blockchain payments, you need to install the Phantom wallet browser extension.
                </p>

                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <h4 className="font-medium text-blue-900 mb-2">Steps to Install:</h4>
                  <ol className="text-blue-700 text-sm space-y-2 text-left">
                    <li>1. Click the "Install Phantom" button below</li>
                    <li>2. Follow the installation instructions</li>
                    <li>3. Create or import your wallet</li>
                    <li>4. Return here and connect your wallet</li>
                  </ol>
                </div>

                <button
                  onClick={handleInstallPhantom}
                  className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
                >
                  <ArrowTopRightOnSquareIcon className="w-5 h-5 mr-2" />
                  Install Phantom Wallet
                </button>

                <button
                  onClick={onClose}
                  className="w-full mt-3 text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  I'll install it later
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WalletInstallGuide; 