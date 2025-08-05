const express = require('express');
const jwt = require('jsonwebtoken');
const BlockchainService = require('../services/blockchainService');
const User = require('../models/User');

const router = express.Router();

// Middleware to get user from token
const auth = async (req, res, next) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error(err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// @route   POST /api/blockchain/create-wallet
// @desc    Create blockchain wallet for user
// @access  Private
router.post('/create-wallet', auth, async (req, res) => {
  try {
    const { network } = req.body; // 'polygon' or 'solana'
    
    if (!network || !['polygon', 'solana'].includes(network)) {
      return res.status(400).json({ message: 'Valid network is required (polygon or solana)' });
    }

    const blockchainService = new BlockchainService();
    let wallet;

    if (network === 'polygon') {
      wallet = await blockchainService.createPolygonWallet();
    } else {
      wallet = await blockchainService.createSolanaWallet();
    }

    // Update user with wallet info
    const user = await User.findById(req.user.id);
    if (network === 'polygon') {
      user.polygonWallet = wallet.address;
    } else {
      user.solanaWallet = wallet.address;
    }
    await user.save();

    res.json({ 
      message: `${network} wallet created successfully`,
      address: wallet.address,
      privateKey: wallet.privateKey // In production, this should be encrypted
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/blockchain/balance
// @desc    Get user's blockchain balance
// @access  Private
router.get('/balance', auth, async (req, res) => {
  try {
    const { network } = req.query; // 'polygon' or 'solana'
    
    if (!network || !['polygon', 'solana'].includes(network)) {
      return res.status(400).json({ message: 'Valid network is required (polygon or solana)' });
    }

    const blockchainService = new BlockchainService();
    let balance;

    if (network === 'polygon') {
      if (!req.user.polygonWallet) {
        return res.status(400).json({ message: 'Polygon wallet not found. Create one first.' });
      }
      balance = await blockchainService.getPolygonBalance(req.user.polygonWallet);
    } else {
      if (!req.user.solanaWallet) {
        return res.status(400).json({ message: 'Solana wallet not found. Create one first.' });
      }
      balance = await blockchainService.getSolanaBalance(req.user.solanaWallet);
    }

    res.json({ 
      network,
      address: network === 'polygon' ? req.user.polygonWallet : req.user.solanaWallet,
      balance 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/blockchain/send-payment
// @desc    Send blockchain payment
// @access  Private
router.post('/send-payment', auth, async (req, res) => {
  try {
    const { network, toAddress, amount } = req.body;
    
    if (!network || !['polygon', 'solana'].includes(network)) {
      return res.status(400).json({ message: 'Valid network is required (polygon or solana)' });
    }

    if (!toAddress || !amount) {
      return res.status(400).json({ message: 'Recipient address and amount are required' });
    }

    const blockchainService = new BlockchainService();
    let transaction;

    if (network === 'polygon') {
      if (!req.user.polygonWallet) {
        return res.status(400).json({ message: 'Polygon wallet not found. Create one first.' });
      }
      transaction = await blockchainService.sendPolygonPayment(req.user.polygonWallet, toAddress, amount);
    } else {
      if (!req.user.solanaWallet) {
        return res.status(400).json({ message: 'Solana wallet not found. Create one first.' });
      }
      transaction = await blockchainService.sendSolanaPayment(req.user.solanaWallet, toAddress, amount);
    }

    res.json({ 
      message: 'Payment sent successfully',
      network,
      transactionHash: transaction.hash || transaction.signature,
      amount,
      toAddress
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/blockchain/deploy-contract
// @desc    Deploy smart contract for job
// @access  Private
router.post('/deploy-contract', auth, async (req, res) => {
  try {
    const { jobId, network } = req.body;
    
    if (!jobId || !network || !['polygon', 'solana'].includes(network)) {
      return res.status(400).json({ message: 'Job ID and valid network are required' });
    }

    const blockchainService = new BlockchainService();
    const contract = await blockchainService.deployJobContract(jobId, network);

    res.json({ 
      message: 'Smart contract deployed successfully',
      network,
      contractAddress: contract.address,
      jobId
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/blockchain/process-payment
// @desc    Process job payment through blockchain
// @access  Private
router.post('/process-payment', auth, async (req, res) => {
  try {
    const { jobId, network, amount } = req.body;
    
    if (!jobId || !network || !amount) {
      return res.status(400).json({ message: 'Job ID, network, and amount are required' });
    }

    const blockchainService = new BlockchainService();
    const payment = await blockchainService.processJobPayment(jobId, network, amount);

    res.json({ 
      message: 'Job payment processed successfully',
      network,
      transactionHash: payment.hash || payment.signature,
      amount,
      jobId
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/blockchain/verify-wallet
// @desc    Verify wallet ownership
// @access  Private
router.post('/verify-wallet', auth, async (req, res) => {
  try {
    const { address, network, signature, message } = req.body;
    
    if (!address || !network || !signature || !message) {
      return res.status(400).json({ message: 'Address, network, signature, and message are required' });
    }

    const blockchainService = new BlockchainService();
    const isValid = await blockchainService.verifyWalletOwnership(address, network, signature, message);

    res.json({ 
      isValid,
      address,
      network
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/blockchain/log-payment
// @desc    Log payment transaction (dummy payment for demo)
// @access  Private
router.post('/log-payment', auth, async (req, res) => {
  try {
    const { 
      jobId, 
      amount, 
      currency, 
      transactionHash, 
      fromAddress, 
      toAddress, 
      network 
    } = req.body;
    
    if (!jobId || !amount || !currency || !transactionHash || !fromAddress || !toAddress || !network) {
      return res.status(400).json({ message: 'All payment details are required' });
    }

    const blockchainService = new BlockchainService();
    
    // Process dummy payment
    const paymentResult = await blockchainService.processDummyPayment({
      jobId,
      amount,
      currency,
      fromAddress,
      toAddress,
      network
    });

    res.json({ 
      message: 'Payment logged successfully',
      paymentId: paymentResult.paymentId,
      transactionHash: paymentResult.transactionHash,
      status: 'completed',
      isDemo: true
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/blockchain/payment-history
// @desc    Get user's payment history
// @access  Private
router.get('/payment-history', auth, async (req, res) => {
  try {
    const { network = 'solana' } = req.query;
    
    if (!['polygon', 'solana'].includes(network)) {
      return res.status(400).json({ message: 'Valid network is required (polygon or solana)' });
    }

    const blockchainService = new BlockchainService();
    const address = network === 'polygon' ? req.user.polygonWallet : req.user.solanaWallet;
    
    if (!address) {
      return res.status(400).json({ message: `${network} wallet not found. Create one first.` });
    }

    const paymentHistory = await blockchainService.getPaymentHistory(address, network);

    res.json({ 
      network,
      address,
      payments: paymentHistory
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/blockchain/transaction-history
// @desc    Get user's transaction history
// @access  Private
router.get('/transaction-history', auth, async (req, res) => {
  try {
    const { network } = req.query; // 'polygon' or 'solana'
    
    if (!network || !['polygon', 'solana'].includes(network)) {
      return res.status(400).json({ message: 'Valid network is required (polygon or solana)' });
    }

    const blockchainService = new BlockchainService();
    const address = network === 'polygon' ? req.user.polygonWallet : req.user.solanaWallet;
    
    if (!address) {
      return res.status(400).json({ message: `${network} wallet not found. Create one first.` });
    }

    const transactions = await blockchainService.getTransactionHistory(address, network);

    res.json({ 
      network,
      address,
      transactions
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 