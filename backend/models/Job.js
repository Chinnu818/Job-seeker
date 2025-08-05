const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    logo: String,
    website: String,
    description: String,
    size: {
      type: String,
      enum: ['startup', 'small', 'medium', 'large', 'enterprise']
    },
    industry: String
  },
  description: {
    type: String,
    required: true
  },
  requirements: {
    skills: [{
      name: {
        type: String,
        required: true
      },
      level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        default: 'intermediate'
      },
      required: {
        type: Boolean,
        default: true
      }
    }],
    experience: {
      min: {
        type: Number,
        default: 0
      },
      max: Number
    },
    education: {
      type: String,
      enum: ['high-school', 'bachelor', 'master', 'phd', 'any']
    }
  },
  details: {
    type: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'],
      required: true
    },
    location: {
      type: {
        type: String,
        enum: ['remote', 'onsite', 'hybrid'],
        required: true
      },
      city: String,
      country: String,
      timezone: String
    },
    salary: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: 'INR'
      },
      period: {
        type: String,
        enum: ['hourly', 'monthly', 'yearly'],
        default: 'yearly'
      }
    },
    benefits: [String],
    equity: {
      type: Boolean,
      default: false
    },
    equityDetails: String
  },
  blockchain: {
    paymentMethod: {
      type: String,
      enum: ['traditional', 'crypto', 'both'],
      default: 'traditional'
    },
    cryptoPayment: {
      accepted: {
        type: Boolean,
        default: false
      },
      tokens: [{
        name: String,
        symbol: String,
        network: {
          type: String,
          enum: ['ethereum', 'polygon', 'solana', 'binance']
        }
      }]
    },
    smartContract: {
      deployed: {
        type: Boolean,
        default: false
      },
      address: String,
      network: String
    }
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'closed', 'expired'],
    default: 'active'
  },
  applications: [{
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['applied', 'reviewing', 'interviewing', 'accepted', 'rejected'],
      default: 'applied'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    coverLetter: String,
    resume: String,
    aiScore: {
      type: Number,
      min: 0,
      max: 100
    },
    aiFeedback: String
  }],
  views: {
    type: Number,
    default: 0
  },
  applicationsCount: {
    type: Number,
    default: 0
  },
  tags: [String],
  aiMetadata: {
    skillMatch: [{
      skill: String,
      relevance: Number
    }],
    difficulty: {
      type: String,
      enum: ['entry', 'mid', 'senior', 'lead'],
      default: 'mid'
    },
    category: String,
    keywords: [String]
  },
  expiresAt: {
    type: Date,
    required: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isRemote: {
    type: Boolean,
    default: false
  },
  isUrgent: {
    type: Boolean,
    default: false
  },
  payment: {
    transactionHash: String,
    amount: Number,
    currency: {
      type: String,
      enum: ['SOL', 'ETH', 'MATIC', 'USD'],
      default: 'SOL'
    },
    network: {
      type: String,
      enum: ['solana', 'ethereum', 'polygon'],
      default: 'solana'
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    },
    fromAddress: String,
    toAddress: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
jobSchema.index({ title: 'text', description: 'text', 'company.name': 'text' });
jobSchema.index({ status: 1, 'details.type': 1 });
jobSchema.index({ 'details.location.type': 1 });
jobSchema.index({ 'requirements.skills.name': 1 });
jobSchema.index({ postedBy: 1 });
jobSchema.index({ expiresAt: 1 });
jobSchema.index({ isFeatured: 1, createdAt: -1 });

// Virtual for application rate
jobSchema.virtual('applicationRate').get(function() {
  if (this.views === 0) return 0;
  return ((this.applicationsCount / this.views) * 100).toFixed(2);
});

// Virtual for days until expiry
jobSchema.virtual('daysUntilExpiry').get(function() {
  const now = new Date();
  const expiry = new Date(this.expiresAt);
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for is expired
jobSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiresAt;
});

// Method to increment views
jobSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to add application
jobSchema.methods.addApplication = function(applicationData) {
  this.applications.push(applicationData);
  this.applicationsCount += 1;
  return this.save();
};

// Method to update application status
jobSchema.methods.updateApplicationStatus = function(applicationId, status) {
  const application = this.applications.id(applicationId);
  if (application) {
    application.status = status;
    return this.save();
  }
  throw new Error('Application not found');
};

// Method to get skill requirements as array
jobSchema.methods.getRequiredSkills = function() {
  return this.requirements.skills
    .filter(skill => skill.required)
    .map(skill => skill.name);
};

// Method to check if job is still active
jobSchema.methods.isActive = function() {
  return this.status === 'active' && !this.isExpired;
};

// Static method to find jobs by skills
jobSchema.statics.findBySkills = function(skills) {
  return this.find({
    'requirements.skills.name': { $in: skills },
    status: 'active',
    expiresAt: { $gt: new Date() }
  });
};

// Static method to find remote jobs
jobSchema.statics.findRemoteJobs = function() {
  return this.find({
    'details.location.type': 'remote',
    status: 'active',
    expiresAt: { $gt: new Date() }
  });
};

module.exports = mongoose.model('Job', jobSchema); 