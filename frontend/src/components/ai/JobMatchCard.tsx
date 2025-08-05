import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, BriefcaseIcon } from '@heroicons/react/24/outline';

interface JobMatchCardProps {
  job: any;
  onMatch: () => void;
  loading?: boolean;
}

const JobMatchCard: React.FC<JobMatchCardProps> = ({ job, onMatch, loading = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-800/50 to-purple-800/50 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20 shadow-xl hover:shadow-2xl transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            <BriefcaseIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">
              {job.title}
            </h3>
            <p className="text-gray-300 text-sm">{job.company?.name || job.company}</p>
          </div>
        </div>
      </div>

      {/* Job Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-gray-400 text-sm">Location:</span>
          <span className="text-white text-sm">{job.location}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-400 text-sm">Type:</span>
          <span className="text-white text-sm capitalize">{job.type}</span>
        </div>
        {job.salary && (
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-sm">Salary:</span>
            <span className="text-green-400 text-sm">${job.salary.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Match Button */}
      <button
        onClick={onMatch}
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Analyzing...</span>
          </>
        ) : (
          <>
            <CheckCircleIcon className="w-4 h-4" />
            <span>Analyze Match</span>
          </>
        )}
      </button>
    </motion.div>
  );
};

export default JobMatchCard; 