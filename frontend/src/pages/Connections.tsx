import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  UserGroupIcon,
  UserPlusIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

interface Connection {
  id: number;
  name: string;
  title: string;
  company: string;
  avatar: string;
  mutualConnections: number;
  status?: 'online' | 'offline' | 'away';
  lastActive?: string;
}

interface ConnectionStats {
  totalConnections: number;
  newThisMonth: number;
  pendingRequests: number;
  activeConnections: number;
}

const Connections: React.FC = () => {
  const [connections] = useState<Connection[]>([
    {
      id: 1,
      name: 'John Doe',
      title: 'Senior Software Engineer',
      company: 'Tech Corp',
      avatar: 'JD',
      mutualConnections: 5,
      status: 'online',
      lastActive: '2 hours ago'
    },
    {
      id: 2,
      name: 'Jane Smith',
      title: 'Product Manager',
      company: 'Innovation Labs',
      avatar: 'JS',
      mutualConnections: 3,
      status: 'away',
      lastActive: '1 day ago'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      title: 'UX Designer',
      company: 'Design Studio',
      avatar: 'MJ',
      mutualConnections: 7,
      status: 'offline',
      lastActive: '3 days ago'
    },
    {
      id: 4,
      name: 'Sarah Wilson',
      title: 'Data Scientist',
      company: 'Analytics Inc',
      avatar: 'SW',
      mutualConnections: 4,
      status: 'online',
      lastActive: '30 minutes ago'
    },
    {
      id: 5,
      name: 'David Brown',
      title: 'DevOps Engineer',
      company: 'Cloud Solutions',
      avatar: 'DB',
      mutualConnections: 6,
      status: 'offline',
      lastActive: '1 week ago'
    }
  ]);

  const [suggestions] = useState([
    { id: 1, name: 'Alex Chen', title: 'Frontend Developer', company: 'WebTech', avatar: 'AC' },
    { id: 2, name: 'Emma Davis', title: 'Marketing Manager', company: 'Growth Co', avatar: 'ED' },
    { id: 3, name: 'Tom Wilson', title: 'Backend Engineer', company: 'API Solutions', avatar: 'TW' }
  ]);

  const [activeTab, setActiveTab] = useState<'all' | 'online' | 'recent'>('all');

  // Calculate connection stats
  const connectionStats: ConnectionStats = {
    totalConnections: connections.length,
    newThisMonth: 12,
    pendingRequests: 3,
    activeConnections: connections.filter(c => c.status === 'online').length
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
      y: -2,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'away': return 'Away';
      case 'offline': return 'Offline';
      default: return 'Offline';
    }
  };

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
              <UserGroupIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">Connections</h1>
              <p className="text-gray-300 text-sm sm:text-lg">Manage your professional network and discover new connections</p>
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
                <p className="text-gray-400 text-sm sm:text-base">Total Connections</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{connectionStats.totalConnections}</p>
              </div>
              <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
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
                <p className="text-gray-400 text-sm sm:text-base">Active Now</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{connectionStats.activeConnections}</p>
              </div>
              <div className="p-2 sm:p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                <CheckCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
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
                <p className="text-gray-400 text-sm sm:text-base">New This Month</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">+{connectionStats.newThisMonth}</p>
              </div>
              <div className="p-2 sm:p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                <UserPlusIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
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
                <p className="text-gray-400 text-sm sm:text-base">Pending Requests</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{connectionStats.pendingRequests}</p>
              </div>
              <div className="p-2 sm:p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
                <ClockIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
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
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('all')}
              className={`flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              All Connections
            </motion.button>
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('online')}
              className={`flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 ${
                activeTab === 'online'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              Online
            </motion.button>
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('recent')}
              className={`flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 ${
                activeTab === 'recent'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              Recent
            </motion.button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Connections List */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="lg:col-span-2"
          >
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="bg-gradient-to-br from-gray-800/50 to-purple-800/50 backdrop-blur-sm rounded-xl border border-purple-500/20 shadow-xl"
            >
              <div className="px-6 py-4 border-b border-gray-600/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-medium text-white">Your Connections</h2>
                    <p className="text-sm text-gray-300 mt-1">
                      {connections.length} connections
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                      title="Search connections"
                    >
                      <MagnifyingGlassIcon className="w-5 h-5" />
                    </button>
                    <button 
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                      title="Filter connections"
                    >
                      <FunnelIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {connections.map((connection) => (
                    <motion.div
                      key={connection.id}
                      variants={itemVariants}
                      className="flex items-center space-x-4 p-4 border border-gray-600/50 rounded-lg hover:bg-gray-700/30 transition-all duration-200"
                    >
                      <div className="flex-shrink-0 relative">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {connection.avatar}
                          </span>
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(connection.status || 'offline')} rounded-full border-2 border-gray-800`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-white">
                          {connection.name}
                        </h3>
                        <p className="text-sm text-gray-300">
                          {connection.title} at {connection.company}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-xs text-gray-400">
                            {connection.mutualConnections} mutual connections
                          </p>
                          <span className="text-xs text-gray-500">•</span>
                          <p className="text-xs text-gray-400">
                            {getStatusText(connection.status || 'offline')}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center space-x-1">
                          <ChatBubbleLeftRightIcon className="w-4 h-4" />
                          <span>Message</span>
                        </button>
                        <button className="text-sm text-gray-400 hover:text-white transition-colors flex items-center space-x-1">
                          <EyeIcon className="w-4 h-4" />
                          <span>View</span>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Suggestions */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-6"
          >
            {/* People You May Know */}
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="bg-gradient-to-br from-gray-800/50 to-purple-800/50 backdrop-blur-sm rounded-xl border border-purple-500/20 shadow-xl"
            >
              <div className="px-6 py-4 border-b border-gray-600/50">
                <h3 className="text-lg font-medium text-white">People You May Know</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {suggestions.map((suggestion) => (
                    <motion.div
                      key={suggestion.id}
                      variants={itemVariants}
                      className="flex items-center space-x-3"
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {suggestion.avatar}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">
                          {suggestion.name}
                        </p>
                        <p className="text-xs text-gray-300">
                          {suggestion.title} at {suggestion.company}
                        </p>
                      </div>
                      <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center space-x-1">
                        <UserPlusIcon className="w-4 h-4" />
                        <span>Connect</span>
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Network Insights */}
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="bg-gradient-to-br from-gray-800/50 to-purple-800/50 backdrop-blur-sm rounded-xl border border-purple-500/20 shadow-xl"
            >
              <div className="px-6 py-4 border-b border-gray-600/50">
                <h3 className="text-lg font-medium text-white">Network Insights</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Most Active</span>
                    <span className="text-sm font-medium text-white">John Doe</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">New Connections</span>
                    <span className="text-sm font-medium text-green-400">+5 this week</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Response Rate</span>
                    <span className="text-sm font-medium text-white">87%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Network Growth</span>
                    <span className="text-sm font-medium text-purple-400">+12% this month</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Connections; 