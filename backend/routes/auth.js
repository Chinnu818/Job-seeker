const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const AIService = require('../services/aiService');

const router = express.Router();
const aiService = new AIService();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
  body('firstName', 'First name is required').notEmpty(),
  body('lastName', 'Last name is required').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      phone, 
      bio, 
      linkedinUrl,
      headline,
      location,
      website,
      skills = []
    } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user with enhanced profile
    user = new User({
      email,
      password,
      profile: {
        firstName,
        lastName,
        headline,
        bio,
        phone,
        linkedinUrl,
        location,
        website
      },
      skills: skills.map(skill => ({
        name: skill.name,
        level: skill.level || 'intermediate',
        yearsOfExperience: skill.yearsOfExperience || 0
      }))
    });

    await user.save();

    // Create JWT token
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token,
          user: {
            _id: user._id,
            email: user.email,
            firstName: user.profile?.firstName || '',
            lastName: user.profile?.lastName || '',
            phone: user.profile?.phone || '',
            bio: user.profile?.bio || '',
            location: user.profile?.location || '',
            skills: user.skills || [],
            experience: user.experience || [],
            education: user.education || [],
            socialLinks: user.socialLinks || {},
            polygonWallet: user.blockchain?.polygonWallet || '',
            solanaWallet: user.blockchain?.solanaWallet || '',
            connections: user.connections || [],
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', [
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password is required').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token,
          user: {
            _id: user._id,
            email: user.email,
            firstName: user.profile?.firstName || '',
            lastName: user.profile?.lastName || '',
            phone: user.profile?.phone || '',
            bio: user.profile?.bio || '',
            location: user.profile?.location || '',
            skills: user.skills || [],
            experience: user.experience || [],
            education: user.education || [],
            socialLinks: user.socialLinks || {},
            polygonWallet: user.blockchain?.polygonWallet || '',
            solanaWallet: user.blockchain?.solanaWallet || '',
            connections: user.connections || [],
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          }
        });
      }
    );
  } catch (err) {
    console.error('Login error:', err.message);
    console.error('Error stack:', err.stack);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', async (req, res) => {
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

    // Return user data in the format expected by frontend
    res.json({
      _id: user._id,
      email: user.email,
      firstName: user.profile?.firstName || '',
      lastName: user.profile?.lastName || '',
      phone: user.profile?.phone || '',
      bio: user.profile?.bio || '',
      location: user.profile?.location || '',
      skills: user.skills || [],
      experience: user.experience || [],
      education: user.education || [],
      socialLinks: user.socialLinks || {},
      polygonWallet: user.blockchain?.polygonWallet || '',
      solanaWallet: user.blockchain?.solanaWallet || '',
      connections: user.connections || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (err) {
    console.error(err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  body('firstName', 'First name is required').notEmpty(),
  body('lastName', 'Last name is required').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const token = req.header('x-auth-token');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const {
      firstName,
      lastName,
      headline,
      bio,
      phone,
      linkedinUrl,
      location,
      website,
      skills = []
    } = req.body;

    // Update profile
    user.profile = {
      ...user.profile,
      firstName,
      lastName,
      headline,
      bio,
      phone,
      linkedinUrl,
      location,
      website
    };

    // Update skills
    user.skills = skills.map(skill => ({
      name: skill.name,
      level: skill.level || 'intermediate',
      yearsOfExperience: skill.yearsOfExperience || 0
    }));

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        profile: user.profile,
        skills: user.skills
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/auth/wallet
// @desc    Connect wallet to user profile
// @access  Private
router.post('/wallet', [
  body('walletAddress', 'Wallet address is required').notEmpty(),
  body('walletType', 'Wallet type is required').isIn(['solana', 'polygon'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const token = req.header('x-auth-token');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { walletAddress, walletType } = req.body;

    // Update wallet address
    if (walletType === 'solana') {
      user.blockchain.solanaWallet = walletAddress;
    } else if (walletType === 'polygon') {
      user.blockchain.polygonWallet = walletAddress;
    }

    user.blockchain.walletVerified = true;
    await user.save();

    res.json({
      message: 'Wallet connected successfully',
      wallet: {
        type: walletType,
        address: walletAddress,
        verified: true
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/auth/extract-skills
// @desc    Extract skills from profile data using AI
// @access  Private
router.post('/extract-skills', [
  body('profileData', 'Profile data is required').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const token = req.header('x-auth-token');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { profileData } = req.body;

    // Extract skills using AI
    const extractedSkills = await aiService.extractSkillsFromProfile(profileData);

    res.json({
      message: 'Skills extracted successfully',
      skills: extractedSkills,
      count: extractedSkills.length
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 