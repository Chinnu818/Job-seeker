const express = require('express');
const jwt = require('jsonwebtoken');
const AIService = require('../services/aiService');
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

// @route   POST /api/ai/extract-skills
// @desc    Extract skills from text
// @access  Private
router.post('/extract-skills', auth, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }

    const aiService = new AIService();
    const skills = await aiService.extractSkills(text);
    
    res.json({ skills });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/ai/analyze-job
// @desc    Analyze job description
// @access  Private
router.post('/analyze-job', auth, async (req, res) => {
  try {
    const { description } = req.body;
    
    if (!description) {
      return res.status(400).json({ message: 'Job description is required' });
    }

    const aiService = new AIService();
    const analysis = await aiService.analyzeJobDescription(description);
    
    res.json(analysis);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/ai/match-job
// @desc    Calculate job match score for user
// @access  Private
router.post('/match-job', auth, async (req, res) => {
  try {
    const { jobId } = req.body;
    
    if (!jobId) {
      return res.status(400).json({ message: 'Job ID is required' });
    }

    const aiService = new AIService();
    const matchScore = await aiService.calculateJobMatch(req.user, jobId);
    
    res.json({ matchScore });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/ai/recommendations
// @desc    Get personalized job recommendations
// @access  Private
router.get('/recommendations', auth, async (req, res) => {
  try {
    const aiService = new AIService();
    const recommendations = await aiService.generateJobRecommendations(req.user);
    
    res.json(recommendations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/ai/similar-jobs
// @desc    Find similar jobs
// @access  Public
router.post('/similar-jobs', async (req, res) => {
  try {
    const { jobId } = req.body;
    
    if (!jobId) {
      return res.status(400).json({ message: 'Job ID is required' });
    }

    const aiService = new AIService();
    const similarJobs = await aiService.findSimilarJobs(jobId);
    
    res.json(similarJobs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/ai/extract-resume-skills
// @desc    Extract skills from resume text with enhanced parsing
// @access  Private
router.post('/extract-resume-skills', auth, async (req, res) => {
  try {
    const { resumeText } = req.body;
    
    console.log('Received resume skills extraction request');
    console.log('Resume text length:', resumeText?.length || 0);
    
    if (!resumeText) {
      console.log('No resume text provided');
      return res.status(400).json({ message: 'Resume text is required' });
    }

    const aiService = new AIService();
    console.log('Calling AI service for skill extraction');
    const result = await aiService.extractSkillsFromResume(resumeText);
    console.log('Skill extraction completed, result:', result);
    
    res.json(result);
  } catch (err) {
    console.error('Resume skills extraction error:', err);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/ai/analyze-resume
// @desc    Analyze resume and suggest profile improvements
// @access  Private
router.post('/analyze-resume', auth, async (req, res) => {
  try {
    const { resumeText } = req.body;
    
    console.log('Received resume analysis request');
    console.log('Resume text length:', resumeText?.length || 0);
    console.log('User profile:', req.user);
    
    if (!resumeText) {
      console.log('No resume text provided');
      return res.status(400).json({ message: 'Resume text is required' });
    }

    const aiService = new AIService();
    console.log('Calling AI service for resume analysis');
    const analysis = await aiService.analyzeResumeAndSuggest(resumeText, req.user);
    console.log('Resume analysis completed, result:', analysis);
    
    res.json(analysis);
  } catch (err) {
    console.error('Resume analysis error:', err);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/ai/match-job
// @desc    Calculate comprehensive job match score for user
// @access  Private
router.post('/match-job', auth, async (req, res) => {
  try {
    const { jobId, jobRequirements } = req.body;
    
    if (!jobId || !jobRequirements) {
      return res.status(400).json({ message: 'Job ID and requirements are required' });
    }

    const aiService = new AIService();
    const matchResult = await aiService.calculateJobMatch(jobRequirements, req.user.skills, req.user);
    
    res.json(matchResult);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/ai/smart-suggestions
// @desc    Get personalized job and connection suggestions
// @access  Private
router.get('/smart-suggestions', auth, async (req, res) => {
  try {
    const Job = require('../models/Job');
    const User = require('../models/User');

    // Get available jobs and users
    const availableJobs = await Job.find({ status: 'active' }).limit(20);
    const availableUsers = await User.find({ _id: { $ne: req.user._id } }).limit(20);

    const aiService = new AIService();
    const suggestions = await aiService.generateSmartSuggestions(req.user, availableJobs, availableUsers);
    
    res.json(suggestions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/ai/job-alerts
// @desc    Get personalized job alerts
// @access  Private
router.get('/job-alerts', auth, async (req, res) => {
  try {
    const Job = require('../models/Job');
    const availableJobs = await Job.find({ status: 'active' }).limit(50);

    const aiService = new AIService();
    const alerts = await aiService.generateJobAlerts(req.user, availableJobs);
    
    res.json(alerts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 