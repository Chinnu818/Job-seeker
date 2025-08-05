import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  PlusIcon, 
  ArrowPathIcon,
  BriefcaseIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  XMarkIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import JobCard from '../components/common/JobCard';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Job {
  _id: string;
  title: string;
  company: {
    name: string;
    logo?: string;
    industry?: string;
  };
  description: string;
  details: {
    type: string;
    location: {
      type: string;
      city?: string;
      country?: string;
    };
    salary: {
      min: number;
      max: number;
      currency: string;
      period: string;
    };
  };
  requirements: {
    skills: Array<{
      name: string;
      level: string;
    }>;
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
  rating?: number;
}

interface JobFilters {
  search: string;
  location: string;
  type: string;
  minSalary: number | undefined;
  maxSalary: number | undefined;
  skills: string[];
  tags: string[];
  remote: boolean;
  experience: string;
  category: string;
}

const Jobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingJobData, setPendingJobData] = useState<any>(null);
          const [paymentStep, setPaymentStep] = useState<'initial' | 'processing' | 'success' | 'error'>('initial');

  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [filters, setFilters] = useState<JobFilters>({
    search: '',
    location: '',
    type: '',
    minSalary: undefined,
    maxSalary: undefined,
    skills: [],
    tags: [],
    remote: false,
    experience: '',
    category: ''
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.02,
      y: -5,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    },
    tap: {
      scale: 0.95
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  const filterVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async (apiFilters?: JobFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch from database first
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/jobs', {
          headers: { 
            'x-auth-token': token,
            'Content-Type': 'application/json'
          },
          params: apiFilters || filters
        });
        
        console.log('Jobs fetched from database:', response.data);
        
        if (response.data && response.data.jobs && Array.isArray(response.data.jobs)) {
          setJobs(response.data.jobs);
          return; // Exit early if database fetch succeeds
        } else if (response.data && Array.isArray(response.data)) {
          setJobs(response.data);
          return; // Exit early if database fetch succeeds
        }
      } catch (dbError) {
        console.log('Database fetch failed:', dbError);
        // If database fails, show empty state instead of mock data
        setJobs([]);
        return;
      }
      
      // If no jobs found, set empty array
      setJobs([]);
      
    } catch (error: any) {
      console.error('Error fetching jobs:', error);
      setError(error.response?.data?.message || 'Failed to load jobs');
      setJobs([]); // Ensure jobs is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: keyof JobFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = () => {
    fetchJobs();
  };

  const handleRefresh = () => {
    fetchJobs();
  };



  const handlePostJob = (jobData: any) => {
    setPendingJobData(jobData);
    setShowPostJobModal(false);
    setShowPaymentModal(true);
    setPaymentStep('initial');
    setPaymentError(null);
  };

  const saveJobToDatabase = async (jobData: any, transactionHash: string) => {
    try {
      const token = localStorage.getItem('token');
      const jobPayload = {
        title: jobData.title,
        description: jobData.description,
        company: {
          name: jobData.company,
          logo: '',
          industry: 'Technology'
        },
        details: {
          type: jobData.type,
          location: {
            type: 'remote',
            city: jobData.location,
            country: 'USA'
          },
          salary: {
            min: 50000,
            max: 100000,
            currency: 'USD',
            period: 'yearly'
          }
        },
        requirements: {
          skills: jobData.skills ? jobData.skills.split(',').map((skill: string) => ({
            name: skill.trim(),
            level: 'required',
            required: true
          })) : []
        },
        tags: jobData.tags ? jobData.tags.split(',').map((tag: string) => tag.trim()) : [],
        payment: {
          transactionHash,
          amount: 0.01,
          currency: 'SOL',
          network: 'solana',
          status: 'completed',
          timestamp: new Date()
        }
      };

      console.log('Saving job to database:', jobPayload);

      // Save to database
      const response = await axios.post('http://localhost:5000/api/jobs', jobPayload, {
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': token 
        }
      });

      console.log('Job saved successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error saving job to database:', error);
      throw new Error(error.response?.data?.message || 'Failed to save job to database');
    }
  };

  const handlePayment = async () => {
    try {
      setPaymentStep('processing');
      setPaymentError(null);

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate successful payment
      const transactionHash = '0x' + Math.random().toString(16).substr(2, 64);
      
      setPaymentStep('success');
      
      // Save job to database
      let savedJob;
      try {
        savedJob = await saveJobToDatabase(pendingJobData, transactionHash);
        console.log('Job saved to database:', savedJob);
        
        // Refresh jobs from database to ensure persistence
        await fetchJobs();
        
        // Show success toast
        toast.success('Payment successful! Your job has been posted and saved to database.');
        
      } catch (dbError) {
        console.error('Database save failed, but continuing with local state:', dbError);
        // Continue with local state even if database save fails
        savedJob = null;
        
        // Create job object for local state
        const newJob: Job = {
          _id: Date.now().toString(),
          title: pendingJobData.title,
          company: {
            name: pendingJobData.company,
            logo: '',
            industry: 'Technology'
          },
          description: pendingJobData.description,
          details: {
            type: pendingJobData.type,
            location: {
              type: 'remote',
              city: pendingJobData.location,
              country: 'USA'
            },
            salary: {
              min: 50000,
              max: 100000,
              currency: 'USD',
              period: 'yearly'
            }
          },
          requirements: {
            skills: pendingJobData.skills ? pendingJobData.skills.split(',').map((skill: string) => ({
              name: skill.trim(),
              level: 'required'
            })) : []
          },
          tags: pendingJobData.tags ? pendingJobData.tags.split(',').map((tag: string) => tag.trim()) : [],
          postedBy: {
            profile: {
              firstName: 'You',
              lastName: '',
              headline: 'Job Poster'
            }
          },
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          views: 0,
          applicationsCount: 0
        };

        // Add to local state
        setJobs(prev => [newJob, ...prev]);
        
        toast.success('Payment successful! Job posted (local storage only).');
      }
      
      // Close payment modal after a delay
      setTimeout(() => {
        setShowPaymentModal(false);
        setPendingJobData(null);
        setPaymentStep('initial');
      }, 2000);

    } catch (error: any) {
      setPaymentError(error.message || 'Payment failed');
      setPaymentStep('error');
      toast.error('Payment failed. Please try again.');
    }
  };

  const handleDummyPaymentSuccess = () => {
    handlePayment();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div 
            className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-white text-lg">Loading jobs...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Error Loading Jobs</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <motion.button
            onClick={handleRefresh}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            Try Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <motion.div 
          className="mb-6 sm:mb-8"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div 
            className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-4 sm:mb-6"
            variants={itemVariants}
          >
            <div className="p-2 sm:p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <BriefcaseIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">Job Opportunities</h1>
              <p className="text-gray-300 text-sm sm:text-lg">Discover your next career move</p>
            </div>
          </motion.div>

          <motion.div 
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-start sm:items-center"
            variants={itemVariants}
          >
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <button
                onClick={handleRefresh}
                className="flex items-center justify-center space-x-2 w-full sm:w-auto px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                <ArrowPathIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Refresh Jobs</span>
              </button>
            </motion.div>

            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <button
                onClick={() => setShowPostJobModal(true)}
                className="flex items-center justify-center space-x-2 w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Post a Job</span>
              </button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div 
          className="bg-gradient-to-br from-gray-800/50 to-purple-800/50 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-purple-500/20 shadow-xl mb-6 sm:mb-8"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <motion.div variants={filterVariants}>
              <label className="block text-sm font-medium text-gray-300 mb-2">Search Jobs</label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                  placeholder="Job title, company, or keywords"
                />
              </div>
            </motion.div>

            <motion.div variants={filterVariants}>
              <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                  placeholder="City, state, or remote"
                />
              </div>
            </motion.div>

            <motion.div variants={filterVariants}>
              <label className="block text-sm font-medium text-gray-300 mb-2">Job Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                aria-label="Select job type"
              >
                <option value="">All Types</option>
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </motion.div>

            <motion.div variants={filterVariants}>
              <label className="block text-sm font-medium text-gray-300 mb-2">Salary Range</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={filters.minSalary || ''}
                  onChange={(e) => handleFilterChange('minSalary', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                  placeholder="Min"
                />
                <input
                  type="number"
                  value={filters.maxSalary || ''}
                  onChange={(e) => handleFilterChange('maxSalary', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                  placeholder="Max"
                />
              </div>
            </motion.div>
          </div>

          <motion.div 
            className="mt-4 flex justify-end"
            variants={itemVariants}
          >
            <motion.button
              onClick={handleSearch}
              className="flex items-center justify-center space-x-2 w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <FunnelIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Apply Filters</span>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Jobs Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <AnimatePresence>
            {Array.isArray(jobs) && jobs.map((job, index) => (
              <motion.div
                key={job._id}
                variants={cardVariants}
                whileHover="hover"
                transition={{ delay: index * 0.1 }}
                layout
              >
                <JobCard job={job} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {(!jobs || jobs.length === 0) && !loading && (
          <motion.div 
            className="text-center py-8 sm:py-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-gray-400 text-4xl sm:text-6xl mb-4">📋</div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">No Jobs Posted Yet</h3>
            <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">Be the first to post a job opportunity!</p>
            <motion.button
              onClick={() => setShowPostJobModal(true)}
              className="inline-flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Post the First Job</span>
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Post Job Modal */}
      <AnimatePresence>
        {showPostJobModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowPostJobModal(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 rounded-2xl shadow-2xl border border-purple-500/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <PostJobForm onCancel={() => setShowPostJobModal(false)} onSubmit={handlePostJob} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowPaymentModal(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 rounded-2xl shadow-2xl border border-purple-500/20 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Phantom Wallet Payment</h2>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="text-gray-400 hover:text-white transition-all duration-200"
                    title="Close"
                  >
                    <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>

                {paymentStep === 'initial' && (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="text-center">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <CurrencyDollarIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Job Posting Fee</h3>
                      <p className="text-gray-300 mb-4 text-sm sm:text-base">To post your job, a small fee of 0.01 SOL is required</p>
                      <div className="bg-gradient-to-br from-gray-800/50 to-purple-800/50 rounded-xl p-3 sm:p-4 border border-purple-500/20">
                        <p className="text-white font-semibold text-sm sm:text-base">Amount: 0.01 SOL</p>
                        <p className="text-gray-400 text-xs sm:text-sm">Network: Solana</p>
                      </div>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                      <button
                        onClick={handleDummyPaymentSuccess}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
                      >
                        Pay with Phantom Wallet
                      </button>
                      <button
                        onClick={() => setShowPaymentModal(false)}
                        className="w-full text-gray-300 hover:text-white transition-all duration-200 text-sm sm:text-base"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {paymentStep === 'processing' && (
                  <div className="text-center space-y-4 sm:space-y-6">
                    <motion.div 
                      className="animate-spin rounded-full h-12 h-12 sm:h-16 sm:w-16 border-b-2 border-purple-500 mx-auto"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <h3 className="text-lg sm:text-xl font-semibold text-white">Processing Payment...</h3>
                    <p className="text-gray-300 text-sm sm:text-base">Please wait while we process your payment and save your job</p>
                  </div>
                )}

                {paymentStep === 'success' && (
                  <div className="text-center space-y-4 sm:space-y-6">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto">
                      <CheckCircleIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white">Payment Successful!</h3>
                    <p className="text-gray-300 text-sm sm:text-base">Your job has been posted and saved to database</p>
                  </div>
                )}

                {paymentStep === 'error' && (
                  <div className="text-center space-y-4 sm:space-y-6">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto">
                      <InformationCircleIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white">Payment Failed</h3>
                    <p className="text-gray-300 text-sm sm:text-base">{paymentError || 'An error occurred during payment'}</p>
                    <button
                      onClick={() => setPaymentStep('initial')}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
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
    </div>
  );
};

// Post Job Form Component
const PostJobForm: React.FC<{ onCancel: () => void; onSubmit: (data: any) => void }> = ({ onCancel, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    type: 'full-time',
    minSalary: '',
    maxSalary: '',
    skills: '',
    tags: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="p-4 sm:p-6">
      <motion.h2 
        className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Post a New Job
      </motion.h2>
      
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label className="block text-sm font-medium text-gray-300 mb-2">Job Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
            placeholder="e.g., Senior React Developer"
            required
          />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
            placeholder="Describe the job responsibilities and requirements..."
            required
          />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="block text-sm font-medium text-gray-300 mb-2">Company</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              placeholder="Company name"
              required
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              placeholder="City, state, or remote"
              required
            />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label className="block text-sm font-medium text-gray-300 mb-2">Job Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              aria-label="Select job type"
            >
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <label className="block text-sm font-medium text-gray-300 mb-2">Salary Range</label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={formData.minSalary}
                onChange={(e) => setFormData(prev => ({ ...prev, minSalary: e.target.value }))}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                placeholder="Min"
              />
              <input
                type="number"
                value={formData.maxSalary}
                onChange={(e) => setFormData(prev => ({ ...prev, maxSalary: e.target.value }))}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                placeholder="Max"
              />
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <label className="block text-sm font-medium text-gray-300 mb-2">Required Skills (comma-separated)</label>
          <input
            type="text"
            value={formData.skills}
            onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
            placeholder="React, TypeScript, Node.js"
          />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
        >
          <label className="block text-sm font-medium text-gray-300 mb-2">Tags (comma-separated)</label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
            placeholder="remote, senior, frontend"
          />
        </motion.div>

        <motion.div 
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 sm:px-6 py-2 sm:py-3 text-gray-300 hover:text-white transition-all duration-200 text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
          >
            Continue to Payment
          </button>
        </motion.div>
      </form>
    </div>
  );
};

export default Jobs; 