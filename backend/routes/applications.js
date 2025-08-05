const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Job = require('../models/Job');
const User = require('../models/User');
const Application = require('../models/Application'); // Added missing import

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/resumes';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
    }
  }
});

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

// @route   POST /api/applications
// @desc    Submit a job application
// @access  Private
router.post('/', auth, upload.single('resume'), async (req, res) => {
  try {
    console.log('=== APPLICATION SUBMISSION STARTED ===');
    console.log('User ID:', req.user.id);
    console.log('User email:', req.user.email);
    console.log('Request body:', req.body);
    console.log('Resume file:', req.file);

    const {
      jobId,
      coverLetter,
      portfolio,
      linkedin,
      github,
      expectedSalary,
      availability,
      relocation,
      visaSponsorship
    } = req.body;

    // Validate required fields
    if (!jobId) {
      console.log('❌ Validation failed: Job ID is required');
      return res.status(400).json({ message: 'Job ID is required' });
    }

    if (!req.file) {
      console.log('❌ Validation failed: Resume file is required');
      return res.status(400).json({ message: 'Resume file is required' });
    }

    console.log('✅ Validation passed');

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      console.log('❌ Job not found:', jobId);
      return res.status(404).json({ message: 'Job not found' });
    }

    console.log('✅ Job found:', job.title);

    // Check if user has already applied to this job
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: req.user.id
    });

    if (existingApplication) {
      console.log('❌ User has already applied to this job');
      return res.status(400).json({ message: 'You have already applied to this job' });
    }

    console.log('✅ No duplicate application found');

    // Create application data
    const applicationData = {
      job: jobId,
      applicant: req.user.id,
      resume: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        size: req.file.size
      },
      coverLetter: coverLetter || '',
      portfolio: portfolio || '',
      linkedin: linkedin || '',
      github: github || '',
      expectedSalary: expectedSalary || '',
      availability: availability || 'immediate',
      relocation: relocation || 'no',
      visaSponsorship: visaSponsorship || 'no',
      status: 'pending',
      submittedAt: new Date()
    };

    console.log('📝 Creating application with data:', JSON.stringify(applicationData, null, 2));

    // Create the application
    const application = new Application(applicationData);
    await application.save();

    console.log('✅ Application saved to database with ID:', application._id);

    // Update job application count
    await Job.findByIdAndUpdate(jobId, {
      $inc: { applicationsCount: 1 }
    });

    console.log('✅ Job application count updated');

    console.log('=== APPLICATION SUBMISSION COMPLETED SUCCESSFULLY ===');

    res.json({
      message: 'Application submitted successfully',
      application: {
        id: application._id,
        status: application.status,
        submittedAt: application.submittedAt,
        jobTitle: job.title,
        companyName: job.company.name
      }
    });

  } catch (err) {
    console.error('❌ Application submission error:', err.message);
    console.error('Error stack:', err.stack);
    
    // Clean up uploaded file if there was an error
    if (req.file) {
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) {
          console.error('Error deleting uploaded file:', unlinkErr);
        } else {
          console.log('✅ Uploaded file cleaned up after error');
        }
      });
    }
    
    res.status(500).json({ message: 'Server error during application submission' });
  }
});

// @route   GET /api/applications
// @desc    Get user's applications
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user.id })
      .populate('job', 'title company.name')
      .sort({ submittedAt: -1 });

    res.json(applications);
  } catch (err) {
    console.error('Error fetching applications:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/applications/:id
// @desc    Get specific application
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('job', 'title company.name description')
      .populate('applicant', 'profile.firstName profile.lastName email');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if user owns this application or is the job poster
    if (application.applicant._id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(application);
  } catch (err) {
    console.error('Error fetching application:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/applications/:id/status
// @desc    Update application status (for job posters)
// @access  Private
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const application = await Application.findById(req.params.id)
      .populate('job', 'postedBy');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if user is the job poster
    if (application.job.postedBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    application.status = status;
    application.updatedAt = new Date();
    await application.save();

    res.json({
      message: 'Application status updated',
      application: {
        id: application._id,
        status: application.status
      }
    });

  } catch (err) {
    console.error('Error updating application status:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 