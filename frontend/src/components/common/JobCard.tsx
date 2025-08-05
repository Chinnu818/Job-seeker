import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPinIcon, 
  CurrencyDollarIcon, 
  ClockIcon, 
  BuildingOfficeIcon,
  EyeIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

interface JobCardProps {
  job: any;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const formatSalary = (min: number, max: number, currency: string = 'USD') => {
    return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      className="bg-gradient-to-br from-gray-800/50 to-purple-800/50 backdrop-blur-sm rounded-xl border border-purple-500/20 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-2 truncate">
              {job.title}
            </h3>
            <div className="flex items-center space-x-2 mb-2">
              <BuildingOfficeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
              <span className="text-gray-300 text-sm sm:text-base truncate">
                {job.company?.name || job.company}
              </span>
            </div>
          </div>
          {job.company?.logo && (
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
              <span className="text-white font-semibold text-xs sm:text-sm">
                {job.company?.name?.charAt(0) || 'C'}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-300 text-sm sm:text-base mb-3 sm:mb-4 line-clamp-2">
          {job.description}
        </p>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="flex items-center space-x-2">
            <MapPinIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
            <span className="text-gray-300 text-xs sm:text-sm truncate">
              {job.details?.location?.city || job.location || 'Remote'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <CurrencyDollarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
            <span className="text-gray-300 text-xs sm:text-sm">
              {job.details?.salary ? 
                formatSalary(job.details.salary.min, job.details.salary.max, job.details.salary.currency) :
                'Salary not specified'
              }
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
            <span className="text-gray-300 text-xs sm:text-sm capitalize">
              {job.details?.type || job.type || 'Full-time'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
            <span className="text-gray-300 text-xs sm:text-sm">
              {job.views || 0} views
            </span>
          </div>
        </div>

        {/* Skills */}
        {job.requirements?.skills && job.requirements.skills.length > 0 && (
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {job.requirements.skills.slice(0, 3).map((skill: any, index: number) => (
                <span
                  key={index}
                  className="px-2 sm:px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30"
                >
                  {skill.name}
                </span>
              ))}
              {job.requirements.skills.length > 3 && (
                <span className="px-2 sm:px-3 py-1 bg-gray-700/50 text-gray-300 text-xs rounded-full">
                  +{job.requirements.skills.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-700/50">
          <div className="flex items-center space-x-2">
            <UserGroupIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <span className="text-gray-300 text-xs sm:text-sm">
              {job.applicationsCount || 0} applications
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-xs sm:text-sm">
              {formatDate(job.createdAt)}
            </span>
            <Link
              to={`/jobs/${job._id}`}
              className="px-3 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs sm:text-sm font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default JobCard; 