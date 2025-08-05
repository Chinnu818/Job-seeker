import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  ChartBarIcon, 
  BriefcaseIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface DashboardData {
  stats: {
    totalJobs: number;
    totalApplications: number;
    totalViews: number;
    successRate: number;
  };
  recentApplications: Array<{
    id: string;
    jobTitle: string;
    company: string;
    status: string;
    appliedDate: string;
  }>;
  postedJobs: Array<{
    id: string;
    title: string;
    applications: number;
    views: number;
    postedDate: string;
  }>;
}

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    stats: {
      totalJobs: 0,
      totalApplications: 0,
      totalViews: 0,
      successRate: 0
    },
    recentApplications: [],
    postedJobs: []
  });
  const [activeTab, setActiveTab] = useState<'applications' | 'jobs'>('applications');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      // Fetch user's applications
      const applicationsResponse = await axios.get('/api/applications', {
        headers: { 'x-auth-token': token }
      });

      // Fetch user's posted jobs
      const jobsResponse = await axios.get('/api/jobs/my-jobs', {
        headers: { 'x-auth-token': token }
      });

      const applications = applicationsResponse.data || [];
      const postedJobs = jobsResponse.data || [];

      // Calculate stats
      const totalApplications = applications.length;
      const totalJobs = postedJobs.length;
      const totalViews = postedJobs.reduce((sum: number, job: any) => sum + (job.views || 0), 0);
      const acceptedApplications = applications.filter((app: any) => app.status === 'accepted').length;
      const successRate = totalApplications > 0 ? Math.round((acceptedApplications / totalApplications) * 100) : 0;

      // Format recent applications
      const recentApplications = applications.slice(0, 5).map((app: any) => ({
        id: app._id,
        jobTitle: app.job?.title || 'Unknown Job',
        company: app.job?.company?.name || 'Unknown Company',
        status: app.status || 'pending',
        appliedDate: new Date(app.submittedAt).toISOString().split('T')[0]
      }));

      // Format posted jobs
      const formattedPostedJobs = postedJobs.slice(0, 5).map((job: any) => ({
        id: job._id,
        title: job.title,
        applications: job.applications?.length || 0,
        views: job.views || 0,
        postedDate: new Date(job.createdAt).toISOString().split('T')[0]
      }));

      setDashboardData({
        stats: {
          totalJobs,
          totalApplications,
          totalViews,
          successRate
        },
        recentApplications,
        postedJobs: formattedPostedJobs
      });
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      setDashboardData({
        stats: { totalJobs: 0, totalApplications: 0, totalViews: 0, successRate: 0 },
        recentApplications: [],
        postedJobs: []
      });
    } finally {
      setLoading(false);
    }
  };

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



  const statVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.05,
      y: -3,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };

  const listItemVariants = {
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

  const tabVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'rejected':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      default:
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'rejected':
        return <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5" />;
      default:
        return <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading dashboard...</p>
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
              <ChartBarIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">Dashboard</h1>
              <p className="text-gray-300 text-sm sm:text-lg">Track your career progress and job applications</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div
            variants={statVariants}
            whileHover="hover"
            className="bg-gradient-to-br from-gray-800/50 to-purple-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-purple-500/20 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm sm:text-base">Total Jobs</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{dashboardData.stats.totalJobs}</p>
              </div>
              <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                <BriefcaseIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={statVariants}
            whileHover="hover"
            className="bg-gradient-to-br from-gray-800/50 to-purple-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-purple-500/20 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm sm:text-base">Applications</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{dashboardData.stats.totalApplications}</p>
              </div>
              <div className="p-2 sm:p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                <UserGroupIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={statVariants}
            whileHover="hover"
            className="bg-gradient-to-br from-gray-800/50 to-purple-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-purple-500/20 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm sm:text-base">Total Views</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{dashboardData.stats.totalViews}</p>
              </div>
              <div className="p-2 sm:p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                <EyeIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={statVariants}
            whileHover="hover"
            className="bg-gradient-to-br from-gray-800/50 to-purple-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-purple-500/20 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm sm:text-base">Success Rate</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{dashboardData.stats.successRate}%</p>
              </div>
              <div className="p-2 sm:p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
                <CurrencyDollarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div 
          className="mb-6 sm:mb-8"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className="flex space-x-1 bg-gray-800/50 rounded-xl p-1">
            <motion.button
              variants={tabVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('applications')}
              className={`flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 ${
                activeTab === 'applications'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              Applications
            </motion.button>
            <motion.button
              variants={tabVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('jobs')}
              className={`flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 ${
                activeTab === 'jobs'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              Posted Jobs
            </motion.button>
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <AnimatePresence mode="wait">
            {activeTab === 'applications' && (
              <motion.div
                key="applications"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-gray-800/50 to-purple-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-purple-500/20 shadow-xl"
              >
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Recent Applications</h3>
                <div className="space-y-3 sm:space-y-4">
                  {dashboardData.recentApplications.map((application, index) => (
                    <motion.div
                      key={application.id}
                      variants={listItemVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 sm:p-4 bg-gray-700/30 rounded-lg border border-gray-600/30"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-semibold text-sm sm:text-base truncate">{application.jobTitle}</h4>
                        <p className="text-gray-300 text-xs sm:text-sm">{application.company}</p>
                      </div>
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(application.status)}`}>
                          <span className="flex items-center space-x-1">
                            {getStatusIcon(application.status)}
                            <span className="capitalize">{application.status}</span>
                          </span>
                        </span>
                        <span className="text-gray-400 text-xs sm:text-sm">
                          {new Date(application.appliedDate).toLocaleDateString()}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'jobs' && (
              <motion.div
                key="jobs"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-gray-800/50 to-purple-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-purple-500/20 shadow-xl"
              >
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Posted Jobs</h3>
                <div className="space-y-3 sm:space-y-4">
                  {dashboardData.postedJobs.map((job, index) => (
                    <motion.div
                      key={job.id}
                      variants={listItemVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 sm:p-4 bg-gray-700/30 rounded-lg border border-gray-600/30"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-semibold text-sm sm:text-base truncate">{job.title}</h4>
                        <p className="text-gray-300 text-xs sm:text-sm">
                          Posted {new Date(job.postedDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="text-center">
                          <p className="text-white font-semibold text-sm sm:text-base">{job.applications}</p>
                          <p className="text-gray-400 text-xs">Applications</p>
                        </div>
                        <div className="text-center">
                          <p className="text-white font-semibold text-sm sm:text-base">{job.views}</p>
                          <p className="text-gray-400 text-xs">Views</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard; 