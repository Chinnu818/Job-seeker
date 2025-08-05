import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '../../contexts/WalletContext';

import WalletInstallGuide from './WalletInstallGuide';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  WalletIcon, 
  CheckCircleIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (transactionHash: string) => void;
  jobData: any;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymentSuccess,
  jobData
}) => {
  const { wallet, connected, connecting, connect, balance, sendTransaction } = useWallet();
  
  const [paymentStep, setPaymentStep] = useState<'connect' | 'payment' | 'success' | 'error'>('connect');
  const [transactionHash, setTransactionHash] = useState('');
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  // Admin wallet address (in production, this should be stored securely)
  const ADMIN_WALLET_ADDRESS = import.meta.env.VITE_ADMIN_WALLET_ADDRESS || '11111111111111111111111111111112';
  const paymentAmount = 0.01; // 0.01 SOL fee

  useEffect(() => {
    if (connected && paymentStep === 'connect') {
      setPaymentStep('payment');
    }
  }, [connected, paymentStep]);

  const handleConnectWallet = async () => {
    try {
      setError('');
      await connect();
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      if (err.message.includes('Phantom wallet not found')) {
        setShowInstallGuide(true);
      }
    }
  };

  const handlePayment = async () => {
    try {
      setProcessing(true);
      setError('');

      // Check if user has sufficient balance
      if (balance < paymentAmount) {
        throw new Error(`Insufficient balance. You need at least ${paymentAmount} SOL`);
      }

      // Send payment to admin wallet
      const hash = await sendTransaction(ADMIN_WALLET_ADDRESS, paymentAmount);
      setTransactionHash(hash);

      // Log payment on backend
      await axios.post('/api/blockchain/log-payment', {
        jobId: jobData._id || 'pending',
        amount: paymentAmount,
        currency: 'SOL',
        transactionHash: hash,
        fromAddress: wallet?.publicKey?.toString(),
        toAddress: ADMIN_WALLET_ADDRESS,
        network: 'solana'
      }, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });

      setPaymentStep('success');
      onPaymentSuccess(hash);
      
      // Show success toast notification
      toast.success('Payment successful! Your job has been posted successfully.');
    } catch (err: any) {
      setError(err.message || 'Payment failed');
      setPaymentStep('error');
    } finally {
      setProcessing(false);
    }
  };

  // Dummy payment success for testing
  const handleDummyPaymentSuccess = async () => {
    try {
      setProcessing(true);
      setError('');

      // Simulate payment success
      const dummyHash = 'dummy_transaction_hash_' + Date.now();
      setTransactionHash(dummyHash);

      // Log payment on backend
      await axios.post('/api/blockchain/log-payment', {
        jobId: jobData._id || 'pending',
        amount: paymentAmount,
        currency: 'SOL',
        transactionHash: dummyHash,
        fromAddress: 'dummy_wallet_address',
        toAddress: ADMIN_WALLET_ADDRESS,
        network: 'solana'
      }, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });

      setPaymentStep('success');
      onPaymentSuccess(dummyHash);
      
      // Show success toast notification
      toast.success('Payment successful! Your job has been posted successfully.');
    } catch (err: any) {
      setError(err.message || 'Payment failed');
      setPaymentStep('error');
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    if (paymentStep === 'success') {
      onClose();
    } else {
      setPaymentStep('connect');
      setError('');
      setTransactionHash('');
      onClose();
    }
  };

  const formatBalance = (bal: number) => {
    return bal.toFixed(4);
  };

  return (
    <div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 rounded-2xl shadow-2xl border border-purple-500/20 max-w-md w-full p-6 backdrop-blur-sm"
              onClick={(e) => e.stopPropagation()}
            >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                {paymentStep === 'connect' && 'Connect Wallet'}
                {paymentStep === 'payment' && 'Payment Required'}
                {paymentStep === 'success' && 'Payment Successful'}
                {paymentStep === 'error' && 'Payment Failed'}
              </h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-white transition-all duration-200"
                title="Close"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-6">
              {paymentStep === 'connect' && (
                <div className="text-center">
                  <WalletIcon className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">
                    Connect Your Wallet
                  </h3>
                  <p className="text-gray-300 mb-6">
                    To post a job, you need to connect your Phantom wallet and pay a small platform fee.
                  </p>
                  <button
                    onClick={handleConnectWallet}
                    disabled={connecting}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl"
                  >
                    {connecting ? 'Connecting...' : 'Connect Phantom Wallet'}
                  </button>
                </div>
              )}

              {paymentStep === 'payment' && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 rounded-xl border border-purple-500/30">
                    <h3 className="font-medium text-purple-300 mb-2">Platform Fee</h3>
                    <p className="text-gray-300 text-sm">
                      A small fee of {paymentAmount} SOL is required to post your job listing.
                    </p>
                  </div>

                  <div className="space-y-3 bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Your Balance:</span>
                      <span className="font-medium text-green-400">{formatBalance(balance)} SOL</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Required Fee:</span>
                      <span className="font-medium text-red-400">{paymentAmount} SOL</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-gray-700 pt-2">
                      <span className="text-gray-300">Remaining Balance:</span>
                      <span className="font-medium text-blue-400">
                        {formatBalance(balance - paymentAmount)} SOL
                      </span>
                    </div>
                  </div>

                  {balance < paymentAmount && (
                    <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 p-3 rounded-xl border border-red-500/30">
                      <div className="flex items-center">
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-2" />
                        <span className="text-red-300 text-sm">
                          Insufficient balance. You need at least {paymentAmount} SOL.
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handlePayment}
                    disabled={processing || balance < paymentAmount}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-4 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl"
                  >
                    {processing ? 'Processing Payment...' : 'Pay & Post Job'}
                  </button>

                  {/* Demo Notice */}
                  <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-3 rounded-xl border border-yellow-500/30">
                    <div className="flex items-center">
                      <InformationCircleIcon className="w-5 h-5 text-yellow-400 mr-2" />
                      <span className="text-yellow-300 text-sm">
                        Demo Mode: This transaction will be simulated for testing.
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleDummyPaymentSuccess}
                    disabled={processing}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl"
                  >
                    {processing ? 'Processing Payment...' : 'Demo Payment Success'}
                  </button>
                </div>
              )}

              {paymentStep === 'success' && (
                <div className="text-center">
                  <CheckCircleIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">
                    Payment Successful!
                  </h3>
                  <p className="text-gray-300 mb-4">
                    Your job has been posted successfully.
                  </p>
                  <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-700/50 text-sm">
                    <p className="text-gray-300">Transaction Hash:</p>
                    <p className="font-mono text-xs break-all text-purple-300">{transactionHash}</p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 mt-4 shadow-lg hover:shadow-xl"
                  >
                    Continue
                  </button>
                </div>
              )}

              {paymentStep === 'error' && (
                <div className="text-center">
                  <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">
                    Payment Failed
                  </h3>
                  <p className="text-gray-300 mb-4">
                    {error}
                  </p>
                  <button
                    onClick={() => setPaymentStep('payment')}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    
    {/* Wallet Install Guide */}
    <WalletInstallGuide 
      isOpen={showInstallGuide} 
      onClose={() => setShowInstallGuide(false)} 
    />
  </div>
  );
};

export default PaymentModal;