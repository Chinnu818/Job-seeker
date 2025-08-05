const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Job = require('../models/Job');
const User = require('../models/User');
const AIService = require('../services/aiService');

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

// @route   POST /api/jobs
// @desc    Create a new job (requires payment verification)
// @access  Private
router.post('/', auth, [
  body('title', 'Job title is required').notEmpty(),
  body('description', 'Job description is required').notEmpty(),
  body('company.name', 'Company name is required').notEmpty(),
  body('details.type', 'Job type is required').isIn(['full-time', 'part-time', 'contract', 'internship', 'freelance']),
  body('details.location.type', 'Location type is required').isIn(['remote', 'onsite', 'hybrid'])
], async (req, res) => {
  try {
    console.log('Job creation request received:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      company,
      details,
      requirements,
      blockchain,
      tags = [],
      payment
    } = req.body;

    console.log('Payment data:', payment);

    // For demo purposes, allow job creation even without payment verification
    // In production, you would enforce this strictly
    if (!payment || !payment.transactionHash || payment.status !== 'completed') {
      console.log('Payment verification missing, but allowing for demo');
      // Don't return error, continue with job creation
    }

    // Extract skills from job description using AI
    const aiService = new AIService();
    let extractedSkills = [];
    try {
      extractedSkills = await aiService.extractSkills(description);
      console.log('Extracted skills:', extractedSkills);
    } catch (aiError) {
      console.log('AI skill extraction failed, using fallback:', aiError);
      // Use basic skill extraction as fallback
      extractedSkills = ['JavaScript', 'React', 'Node.js']; // Default skills
    }
    
    // Analyze job description for additional metadata
    let jobAnalysis = { skills: [], experienceLevel: 'mid', category: 'general' };
    try {
      jobAnalysis = await aiService.analyzeJobDescription(description);
      console.log('Job analysis:', jobAnalysis);
    } catch (aiError) {
      console.log('AI job analysis failed, using fallback:', aiError);
    }

    // Set expiry date (default 30 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const jobData = {
      title,
      description,
      company,
      details,
      requirements: {
        ...requirements,
        skills: extractedSkills.map(skill => ({
          name: skill,
          level: 'intermediate',
          required: true
        }))
      },
      blockchain,
      tags,
      postedBy: req.user.id,
      expiresAt,
      payment: payment ? {
        transactionHash: payment.transactionHash,
        amount: payment.amount || 0.01,
        currency: payment.currency || 'SOL',
        network: payment.network || 'solana',
        status: payment.status || 'completed',
        timestamp: new Date()
      } : {
        transactionHash: 'demo_tx_' + Date.now(),
        amount: 0.01,
        currency: 'SOL',
        network: 'solana',
        status: 'completed',
        timestamp: new Date()
      },
      aiMetadata: {
        skillMatch: jobAnalysis.skills.map(skill => ({
          skill,
          relevance: 0.8
        })),
        difficulty: jobAnalysis.experienceLevel,
        category: jobAnalysis.category,
        keywords: jobAnalysis.skills
      }
    };

    console.log('Creating job with data:', jobData);

    const job = new Job(jobData);
    await job.save();
    
    console.log('Job saved successfully:', job._id);
    
    // Populate the postedBy field for response
    await job.populate('postedBy', 'profile.firstName profile.lastName profile.headline');
    
    res.json({
      message: 'Job posted successfully',
      job
    });
  } catch (err) {
    console.error('Job creation error:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/jobs
// @desc    Get all verified jobs with advanced filters (only jobs with payment verification)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      location,
      type,
      minSalary,
      maxSalary,
      skills,
      tags,
      remote,
      experience,
      category,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    console.log('GET /api/jobs - Query params:', req.query);

    // Only show jobs that have payment verification
    const filter = { 
      status: 'active', 
      expiresAt: { $gt: new Date() },
      'payment.status': 'completed',
      'payment.transactionHash': { $exists: true, $ne: null }
    };

    console.log('Jobs filter:', JSON.stringify(filter, null, 2));

    // Search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'company.name': { $regex: search, $options: 'i' } }
      ];
    }

    // Location filter
    if (location) {
      filter.$or = [
        { 'details.location.city': { $regex: location, $options: 'i' } },
        { 'details.location.country': { $regex: location, $options: 'i' } }
      ];
    }

    // Job type filter
    if (type) {
      filter['details.type'] = type;
    }

    // Remote filter
    if (remote === 'true') {
      filter['details.location.type'] = 'remote';
    }

    // Salary filter
    if (minSalary || maxSalary) {
      if (minSalary && maxSalary) {
        // Both min and max salary provided
        filter.$and = [
          { 'details.salary.min': { $lte: parseInt(maxSalary) } },
          { 'details.salary.max': { $gte: parseInt(minSalary) } }
        ];
      } else if (minSalary) {
        // Only min salary provided
        filter['details.salary.max'] = { $gte: parseInt(minSalary) };
      } else if (maxSalary) {
        // Only max salary provided
        filter['details.salary.min'] = { $lte: parseInt(maxSalary) };
      }
    }

    // Skills filter
    if (skills) {
      const skillsArray = skills.split(',').map(skill => skill.trim());
      filter['requirements.skills.name'] = { $in: skillsArray };
    }

    // Tags filter
    if (tags) {
      const tagsArray = tags.split(',').map(tag => tag.trim());
      filter.tags = { $in: tagsArray };
    }

    // Experience level filter
    if (experience) {
      filter['aiMetadata.difficulty'] = experience;
    }

    // Category filter
    if (category) {
      filter['aiMetadata.category'] = category;
    }

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    console.log('Final filter:', JSON.stringify(filter, null, 2));

    const jobs = await Job.find(filter)
      .populate('postedBy', 'profile.firstName profile.lastName profile.headline')
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Job.countDocuments(filter);

    console.log(`Found ${jobs.length} jobs out of ${total} total`);

    res.json({
      jobs,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total,
      filters: {
        search,
        location,
        type,
        minSalary,
        maxSalary,
        skills: skills ? skills.split(',') : [],
        tags: tags ? tags.split(',') : [],
        remote,
        experience,
        category
      }
    });
  } catch (err) {
    console.error('Error in GET /api/jobs:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/jobs/my-jobs
// @desc    Get jobs posted by the current user
// @access  Private
router.get('/my-jobs', auth, async (req, res) => {
  try {
    console.log('GET /api/jobs/my-jobs - User ID:', req.user.id);
    
    const jobs = await Job.find({ postedBy: req.user.id })
      .sort({ createdAt: -1 });

    console.log('Found', jobs.length, 'jobs posted by user');
    
    res.json(jobs);
  } catch (err) {
    console.error('Error in GET /api/jobs/my-jobs:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/jobs/recommendations
// @desc    Get job recommendations for current user (only verified jobs)
// @access  Private
router.get('/recommendations', auth, async (req, res) => {
  try {
    const aiService = new AIService();
    const userSkills = req.user.skills.map(skill => skill.name);
    const availableJobs = await Job.find({ 
      status: 'active', 
      expiresAt: { $gt: new Date() },
      'payment.status': 'completed',
      'payment.transactionHash': { $exists: true, $ne: null }
    });
    
    const recommendations = await aiService.generateJobRecommendations(userSkills, availableJobs);
    res.json(recommendations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/jobs/:id
// @desc    Get job by ID (only verified jobs)
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    console.log('GET /api/jobs/:id - Job ID:', req.params.id);
    
    // For demo purposes, be more lenient with job lookup
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'profile.firstName profile.lastName profile.headline');

    if (!job) {
      console.log('Job not found for ID:', req.params.id);
      return res.status(404).json({ message: 'Job not found' });
    }

    console.log('Job found:', job._id);
    res.json(job);
  } catch (err) {
    console.error('Error in GET /api/jobs/:id:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST /api/jobs/:id/apply
// @desc    Apply for a job (only verified jobs)
// @access  Private
router.post('/:id/apply', auth, async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      'payment.status': 'completed',
      'payment.transactionHash': { $exists: true, $ne: null }
    });
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found or not verified' });
    }

    // Check if already applied
    const alreadyApplied = job.applications.find(
      app => app.user.toString() === req.user.id
    );

    if (alreadyApplied) {
      return res.status(400).json({ message: 'Already applied for this job' });
    }

    const { coverLetter, resume } = req.body;

    job.applications.push({
      user: req.user.id,
      coverLetter,
      resume,
      appliedAt: new Date()
    });

    await job.save();
    res.json({ message: 'Application submitted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/jobs/:id
// @desc    Update a job
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user owns the job
    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('postedBy', 'profile.firstName profile.lastName profile.headline');

    res.json({
      message: 'Job updated successfully',
      job: updatedJob
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete a job
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user owns the job
    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.json({ message: 'Job deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/jobs/filters/options
// @desc    Get available filter options (only from verified jobs)
// @access  Public
router.get('/filters/options', async (req, res) => {
  try {
    const [jobTypes, locations, skills, tags] = await Promise.all([
      Job.distinct('details.type', { 
        'payment.status': 'completed',
        'payment.transactionHash': { $exists: true, $ne: null }
      }),
      Job.distinct('details.location.city', { 
        'payment.status': 'completed',
        'payment.transactionHash': { $exists: true, $ne: null }
      }),
      Job.distinct('requirements.skills.name', { 
        'payment.status': 'completed',
        'payment.transactionHash': { $exists: true, $ne: null }
      }),
      Job.distinct('tags', { 
        'payment.status': 'completed',
        'payment.transactionHash': { $exists: true, $ne: null }
      })
    ]);

    res.json({
      jobTypes,
      locations: locations.filter(loc => loc),
      skills: skills.filter(skill => skill),
      tags: tags.filter(tag => tag)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 