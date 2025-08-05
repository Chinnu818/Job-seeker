import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAI } from '../contexts/AIContext';
import { useJob } from '../contexts/JobContext';

import JobMatchCard from '../components/ai/JobMatchCard';
import ResumeAnalyzer from '../components/ai/ResumeAnalyzer';
import SmartSuggestions from '../components/ai/SmartSuggestions';
import { 
  SparklesIcon, 
  MagnifyingGlassIcon, 
  DocumentTextIcon, 
  LightBulbIcon,
  UserIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';

const AI: React.FC = () => {
  const { jobs } = useJob();
  const { calculateJobMatch, loading } = useAI();
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [matchResult, setMatchResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'matching' | 'resume' | 'suggestions'>('matching');

  const handleJobMatch = async (job: any) => {
    try {
      const result = await calculateJobMatch(job._id, job.requirements);
      setMatchResult(result);
      setSelectedJob(job);
    } catch (error) {
      console.error('Job matching failed:', error);
    }
  };

  const tabs = [
    {
      id: 'matching',
      name: 'Job Matching',
      icon: MagnifyingGlassIcon,
      description: 'Get AI-powered job match scores and analysis'
    },
    {
      id: 'resume',
      name: 'Resume Analysis',
      icon: DocumentTextIcon,
      description: 'Extract skills and get profile suggestions'
    },
    {
      id: 'suggestions',
      name: 'Smart Suggestions',
      icon: LightBulbIcon,
      description: 'Discover personalized job and connection recommendations'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl mr-4">
              <SparklesIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              AI-Powered Features
            </h1>
          </div>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Leverage artificial intelligence to enhance your job search and career development with cutting-edge technology
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-gray-800/50 to-purple-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 shadow-xl"
          >
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-gray-300 text-sm">AI Match Score</p>
                <p className="text-2xl font-bold text-white">95%</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gradient-to-br from-gray-800/50 to-purple-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 shadow-xl"
          >
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                <RocketLaunchIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-gray-300 text-sm">Jobs Analyzed</p>
                <p className="text-2xl font-bold text-white">{jobs.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gradient-to-br from-gray-800/50 to-purple-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 shadow-xl"
          >
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <UserIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-gray-300 text-sm">Skills Extracted</p>
                <p className="text-2xl font-bold text-white">24</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-gradient-to-br from-gray-800/50 to-purple-800/50 backdrop-blur-sm rounded-xl border border-purple-500/20 shadow-xl mb-8">
          <div className="flex space-x-1 p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4 inline mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Job Matching Tab */}
          {activeTab === 'matching' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-br from-gray-800/50 to-purple-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 shadow-xl">
                <h2 className="text-2xl font-bold text-white mb-4">AI Job Matching</h2>
                <p className="text-gray-300 mb-6">
                  Our advanced AI analyzes your skills and preferences to find the perfect job matches. 
                  Get detailed insights into how well you fit each position.
                </p>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Available Jobs</h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {jobs.slice(0, 5).map((job) => (
                        <JobMatchCard
                          key={job._id}
                          job={job}
                          onMatch={() => handleJobMatch(job)}
                          loading={loading}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Match Analysis</h3>
                    {matchResult ? (
                      <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-xl p-6 border border-gray-600/50">
                        <h4 className="text-white font-semibold mb-2">{selectedJob?.title}</h4>
                        <p className="text-gray-300 text-sm mb-4">{selectedJob?.company?.name}</p>
                        
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-gray-300">Overall Match</span>
                              <span className="text-white font-semibold">{matchResult.score}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${matchResult.score}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          {matchResult.skills && (
                            <div>
                              <h5 className="text-white font-medium mb-2">Skills Analysis</h5>
                              <div className="space-y-2">
                                {matchResult.skills.map((skill: any, index: number) => (
                                  <div key={index} className="flex justify-between items-center">
                                    <span className="text-gray-300 text-sm">{skill.name}</span>
                                    <span className={`text-sm font-medium ${
                                      skill.matched ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                      {skill.matched ? '✓' : '✗'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {matchResult.recommendations && (
                            <div>
                              <h5 className="text-white font-medium mb-2">Recommendations</h5>
                              <ul className="space-y-1">
                                {matchResult.recommendations.map((rec: string, index: number) => (
                                  <li key={index} className="text-gray-300 text-sm flex items-start">
                                    <span className="text-purple-400 mr-2">•</span>
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-xl p-6 border border-gray-600/50 text-center">
                        <MagnifyingGlassIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-300">Select a job to see AI match analysis</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Resume Analysis Tab */}
          {activeTab === 'resume' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ResumeAnalyzer />
            </motion.div>
          )}

          {/* Smart Suggestions Tab */}
          {activeTab === 'suggestions' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <SmartSuggestions />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AI; 