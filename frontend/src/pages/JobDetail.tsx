import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { 
  ArrowLeftIcon, 
  MapPinIcon, 
  CurrencyDollarIcon, 
  ClockIcon, 
  UserIcon,
  CalendarIcon,
  CheckCircleIcon,
  StarIcon,
  ShareIcon,
  PaperAirplaneIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

interface JobDetail {
  _id: string;
  title: string;
  company: {
    name: string;
    logo?: string;
    website?: string;
    description?: string;
    size?: string;
    industry?: string;
  };
  description: string;
  details: {
    type: string;
    location: {
      type: string;
      city?: string;
      country?: string;
      timezone?: string;
    };
    salary: {
      min: number;
      max: number;
      currency: string;
      period: string;
    };
    benefits?: string[];
  };
  requirements: {
    skills: Array<{
      name: string;
      level: string;
      required: boolean;
    }>;
    experience: {
      min: number;
      max: number;
    };
    education: string;
  };
  tags: string[];
  postedBy: {
    profile: {
      firstName: string;
      lastName: string;
      headline?: string;
    };
  };
  createdAt: string;
  expiresAt: string;
  views: number;
  applicationsCount: number;
  payment: {
    transactionHash: string;
    amount: number;
    currency: string;
    network: string;
    status: string;
    timestamp: string;
  };
  aiMetadata?: {
    skillMatch: Array<{
      skill: string;
      relevance: number;
    }>;
    difficulty: string;
    category: string;
    keywords: string[];
  };
}

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (id) {
      fetchJobDetail();
    }
  }, [id]);

  const fetchJobDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`/api/jobs/${id}`);
      setJob(response.data);
    } catch (error: any) {
      console.error('Error fetching job details:', error);
      setError(error.response?.data?.message || 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const formatSalary = (min: number, max: number, currency: string, period: string) => {
    const formatNumber = (num: number) => {
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
      return num.toString();
    };

    const periodText = period === 'yearly' ? 'year' : period === 'monthly' ? 'month' : 'hour';
    return `${currency} ${formatNumber(min)} - ${formatNumber(max)}/${periodText}`;
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  };

  const getLocationText = () => {
    if (job?.details.location.type === 'Remote') return 'Remote';
    if (job?.details.location.city) return job.details.location.city;
    if (job?.details.location.country) return job.details.location.country;
    return 'Location not specified';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Handle file upload
      console.log('File selected:', file.name);
    }
  };



  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplying(true);
    
    try {
      // Simulate application submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Application submitted successfully!');
      setShowApplyModal(false);
    } catch (error) {
      toast.error('Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-white mt-4 text-lg">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Error Loading Job</h2>
          <p className="text-gray-300 mb-4">{error || 'Job not found'}</p>
          <button
            onClick={() => navigate('/jobs')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/jobs')}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-all duration-200 mb-6"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back to Jobs</span>
          </button>

          <div className="bg-gradient-to-br from-gray-800/50 to-purple-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <div className="flex items-start space-x-4 mb-4">
                  {/* Company Logo */}
                  <div className="flex-shrink-0">
                    {job.company.logo ? (
                      <img 
                        src={job.company.logo} 
                        alt={`${job.company.name} logo`}
                        className="w-16 h-16 rounded-xl object-cover border border-purple-500/20"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center border border-purple-500/20">
                        <span className="text-white font-bold text-xl">
                          {job.company.name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Job Info */}
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-white mb-2">
                      {job.title}
                    </h1>
                    <p className="text-xl text-gray-300 mb-3">
                      {job.company.name}
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="px-3 py-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 rounded-lg text-sm border border-blue-500/30">
                        {job.details.type}
                      </span>
                      <span className="px-3 py-1 bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-300 rounded-lg text-sm border border-gray-500/30 flex items-center">
                        <MapPinIcon className="w-3 h-3 mr-1" />
                        {getLocationText()}
                      </span>
                      {job.company.industry && (
                        <span className="px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 rounded-lg text-sm border border-green-500/30">
                          {job.company.industry}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-lg p-4 border border-gray-600/50">
                    <div className="flex items-center space-x-2">
                      <CurrencyDollarIcon className="w-5 h-5 text-green-400" />
                      <span className="text-white font-semibold">Salary</span>
                    </div>
                    <p className="text-green-400 text-sm mt-1">
                      {formatSalary(
                        job.details.salary.min,
                        job.details.salary.max,
                        job.details.salary.currency,
                        job.details.salary.period
                      )}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-lg p-4 border border-gray-600/50">
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="w-5 h-5 text-blue-400" />
                      <span className="text-white font-semibold">Posted</span>
                    </div>
                    <p className="text-gray-300 text-sm mt-1">
                      {getTimeAgo(job.createdAt)}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-lg p-4 border border-gray-600/50">
                    <div className="flex items-center space-x-2">
                      <UserIcon className="w-5 h-5 text-purple-400" />
                      <span className="text-white font-semibold">Applications</span>
                    </div>
                    <p className="text-gray-300 text-sm mt-1">
                      {job.applicationsCount} applied
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-lg p-4 border border-gray-600/50">
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="w-5 h-5 text-orange-400" />
                      <span className="text-white font-semibold">Expires</span>
                    </div>
                    <p className="text-gray-300 text-sm mt-1">
                      {new Date(job.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-3 lg:ml-6 lg:w-48">
                <button
                  onClick={() => setShowApplyModal(true)}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                  <span>Apply Now</span>
                </button>
                
                <div className="flex space-x-2">
                  <button className="flex-1 bg-gradient-to-r from-gray-700 to-gray-800 text-white py-2 px-4 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2">
                    <StarIcon className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                  <button className="flex-1 bg-gradient-to-r from-gray-700 to-gray-800 text-white py-2 px-4 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2">
                    <ShareIcon className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Job Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-gray-800/50 to-purple-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 shadow-xl"
            >
              <h2 className="text-2xl font-bold text-white mb-4">Job Description</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed">
                  {job.description}
                </p>
              </div>
            </motion.div>

            {/* Requirements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-gray-800/50 to-purple-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 shadow-xl"
            >
              <h2 className="text-2xl font-bold text-white mb-4">Requirements</h2>
              
              {/* Skills */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Required Skills</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {job.requirements.skills.map((skill, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-lg border border-gray-600/50">
                      <span className="text-gray-200">{skill.name}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        skill.required 
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                          : 'bg-green-500/20 text-green-300 border border-green-500/30'
                      }`}>
                        {skill.required ? 'Required' : 'Preferred'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Experience</h3>
                <p className="text-gray-300">
                  {job.requirements.experience.min} - {job.requirements.experience.max} years
                </p>
              </div>

              {/* Education */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Education</h3>
                <p className="text-gray-300">{job.requirements.education}</p>
              </div>
            </motion.div>

            {/* Benefits */}
            {job.details.benefits && job.details.benefits.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-gray-800/50 to-purple-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 shadow-xl"
              >
                <h2 className="text-2xl font-bold text-white mb-4">Benefits</h2>
                <ul className="space-y-2">
                  {job.details.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <CheckCircleIcon className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </div>

          {/* Right Column - Company Info & AI Analysis */}
          <div className="space-y-6">
            {/* Company Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-gray-800/50 to-purple-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 shadow-xl"
            >
              <h2 className="text-xl font-bold text-white mb-4">Company Information</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-white font-semibold mb-1">{job.company.name}</h3>
                  {job.company.description && (
                    <p className="text-gray-300 text-sm">{job.company.description}</p>
                  )}
                </div>

                {job.company.website && (
                  <div>
                    <span className="text-gray-400 text-sm">Website:</span>
                    <a 
                      href={job.company.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 text-sm ml-2"
                    >
                      {job.company.website}
                    </a>
                  </div>
                )}

                {job.company.size && (
                  <div>
                    <span className="text-gray-400 text-sm">Company Size:</span>
                    <span className="text-gray-300 text-sm ml-2">{job.company.size}</span>
                  </div>
                )}

                {job.company.industry && (
                  <div>
                    <span className="text-gray-400 text-sm">Industry:</span>
                    <span className="text-gray-300 text-sm ml-2">{job.company.industry}</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* AI Analysis */}
            {job.aiMetadata && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-gray-800/50 to-purple-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 shadow-xl"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <SparklesIcon className="w-5 h-5 text-purple-400" />
                  <h2 className="text-xl font-bold text-white">AI Analysis</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <span className="text-gray-400 text-sm">Difficulty:</span>
                    <span className="text-gray-300 text-sm ml-2">{job.aiMetadata.difficulty}</span>
                  </div>
                  
                  <div>
                    <span className="text-gray-400 text-sm">Category:</span>
                    <span className="text-gray-300 text-sm ml-2">{job.aiMetadata.category}</span>
                  </div>

                  {job.aiMetadata.skillMatch && job.aiMetadata.skillMatch.length > 0 && (
                    <div>
                      <span className="text-gray-400 text-sm mb-2 block">Skill Match:</span>
                      <div className="space-y-2">
                        {job.aiMetadata.skillMatch.slice(0, 3).map((skill, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-gray-300 text-sm">{skill.skill}</span>
                            <div className="w-16 bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                                style={{ width: `${skill.relevance}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Posted By */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-gray-800/50 to-purple-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 shadow-xl"
            >
              <h2 className="text-xl font-bold text-white mb-4">Posted By</h2>
              
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {job.postedBy.profile.firstName.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-white font-medium">
                    {job.postedBy.profile.firstName} {job.postedBy.profile.lastName}
                  </p>
                  {job.postedBy.profile.headline && (
                    <p className="text-gray-400 text-sm">{job.postedBy.profile.headline}</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 rounded-2xl shadow-2xl border border-purple-500/20 max-w-md w-full"
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Apply for Position</h2>
              
              <form onSubmit={handleApply} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Cover Letter</label>
                  <textarea
                    name="coverLetter"
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Tell us why you're interested in this position..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Expected Salary</label>
                  <input
                    type="text"
                    name="expectedSalary"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., $80,000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Resume</label>
                  <input
                    type="file"
                    name="resume"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    aria-label="Upload resume file"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    className="flex-1 px-4 py-3 text-gray-300 hover:text-white transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={applying}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    {applying ? 'Applying...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      <Toaster />
    </div>
  );
};

export default JobDetail; 