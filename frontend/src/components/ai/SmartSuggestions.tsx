import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAI } from '../../contexts/AIContext';
import { useNavigate } from 'react-router-dom';
import { 
  LightBulbIcon, 
  UserGroupIcon, 
  BriefcaseIcon, 
  SparklesIcon,
  ArrowRightIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const SmartSuggestions: React.FC = () => {
  const { getSmartSuggestions, loading } = useAI();
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState<any>(null);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      const result = await getSmartSuggestions();
      setSuggestions(result);
    } catch (error) {
      toast.error('Failed to load suggestions');
    }
  };

  const handleJobClick = (job: any) => {
    navigate(`/jobs/${job._id}`);
  };

  const handleUserClick = (user: any) => {
    navigate(`/profile/${user._id}`);
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-800/50 to-purple-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 shadow-xl">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <span className="ml-3 text-gray-300">Loading smart suggestions...</span>
        </div>
      </div>
    );
  }

  if (!suggestions) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mr-3">
            <RocketLaunchIcon className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            AI-Powered Suggestions
          </h2>
        </div>
        <button
          onClick={loadSuggestions}
          className="text-sm text-purple-300 hover:text-white transition-all duration-200"
        >
          Refresh
        </button>
      </div>

      {/* Job Suggestions */}
      {suggestions.jobSuggestions && suggestions.jobSuggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-gray-800/50 to-purple-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 shadow-xl"
        >
          <div className="flex items-center mb-4">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg mr-3">
              <BriefcaseIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white">
              Recommended Jobs
            </h3>
          </div>
          <div className="space-y-4">
            {suggestions.jobSuggestions.map((suggestion: any, index: number) => (
              <div
                key={index}
                onClick={() => handleJobClick(suggestion.job)}
                className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-lg p-4 border border-gray-600/50 hover:border-purple-500/50 cursor-pointer transition-all duration-200 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-white">
                      {suggestion.job.title}
                    </h4>
                    <p className="text-sm text-gray-300">
                      {suggestion.job.company}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {suggestion.reason}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 px-3 py-1 rounded-full text-sm font-medium border border-blue-500/30">
                      {suggestion.matchScore}% match
                    </div>
                    <ArrowRightIcon className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Connection Suggestions */}
      {suggestions.connectionSuggestions && suggestions.connectionSuggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-gray-800/50 to-purple-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 shadow-xl"
        >
          <div className="flex items-center mb-4">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg mr-3">
              <UserGroupIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white">
              Suggested Connections
            </h3>
          </div>
          <div className="space-y-4">
            {suggestions.connectionSuggestions.map((suggestion: any, index: number) => (
              <div
                key={index}
                onClick={() => handleUserClick(suggestion.user)}
                className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-lg p-4 border border-gray-600/50 hover:border-green-500/50 cursor-pointer transition-all duration-200 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {suggestion.user.firstName?.[0] || suggestion.user.email?.[0] || 'U'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white">
                        {suggestion.user.firstName} {suggestion.user.lastName}
                      </h4>
                      <p className="text-sm text-gray-300">
                        {suggestion.user.title || 'Professional'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {suggestion.reason}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 px-3 py-1 rounded-full text-sm font-medium border border-green-500/30">
                      {suggestion.matchScore}% match
                    </div>
                    <ArrowRightIcon className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Career Advice */}
      {suggestions.careerAdvice && suggestions.careerAdvice.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-gray-800/50 to-purple-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 shadow-xl"
        >
          <div className="flex items-center mb-4">
            <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg mr-3">
              <LightBulbIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white">
              Career Advice
            </h3>
          </div>
          <div className="space-y-3">
            {suggestions.careerAdvice.map((advice: string, index: number) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-200 text-sm">
                  {advice}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {(!suggestions.jobSuggestions || suggestions.jobSuggestions.length === 0) &&
       (!suggestions.connectionSuggestions || suggestions.connectionSuggestions.length === 0) &&
       (!suggestions.careerAdvice || suggestions.careerAdvice.length === 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-gray-800/50 to-purple-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 shadow-xl text-center"
        >
          <SparklesIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            No Suggestions Available
          </h3>
          <p className="text-gray-300 text-sm">
            Complete your profile to get personalized suggestions for jobs and connections.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default SmartSuggestions; 