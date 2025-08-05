import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DocumentTextIcon, ArrowUpTrayIcon, SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useAI } from '../../contexts/AIContext';
import toast from 'react-hot-toast';

interface ResumeAnalyzerProps {
  onSkillsExtracted?: (skills: any[]) => void;
  onAnalysisComplete?: (analysis: any) => void;
}

const ResumeAnalyzer: React.FC<ResumeAnalyzerProps> = ({ onSkillsExtracted, onAnalysisComplete }) => {
  const { extractSkillsFromResume, analyzeResumeAndSuggest, loading } = useAI();
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'text'>('text');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/plain' && file.type !== 'application/pdf') {
      toast.error('Please upload a text or PDF file');
      return;
    }

    try {
      const text = await readFileAsText(file);
      setResumeText(text);
      toast.success('File uploaded successfully');
    } catch (error) {
      toast.error('Failed to read file');
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleExtractSkills = async () => {
    if (!resumeText.trim()) {
      toast.error('Please enter resume text or upload a file');
      return;
    }

    try {
      console.log('Extracting skills from resume text:', resumeText.substring(0, 100) + '...');
      const result = await extractSkillsFromResume(resumeText);
      console.log('Skills extraction result:', result);
      setAnalysis(result);
      
      if (onSkillsExtracted) {
        onSkillsExtracted(result.skills);
      }
      
      toast.success('Skills extracted successfully!');
    } catch (error: any) {
      console.error('Skills extraction error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to extract skills';
      toast.error(errorMessage);
    }
  };

  const handleAnalyzeResume = async () => {
    if (!resumeText.trim()) {
      toast.error('Please enter resume text or upload a file');
      return;
    }

    try {
      console.log('Analyzing resume text:', resumeText.substring(0, 100) + '...');
      const result = await analyzeResumeAndSuggest(resumeText);
      console.log('Resume analysis result:', result);
      setAnalysis(result);
      
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }
      
      toast.success('Resume analysis completed!');
    } catch (error: any) {
      console.error('Resume analysis error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to analyze resume';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-purple-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 shadow-xl">
      <div className="flex items-center mb-6">
        <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mr-4">
          <SparklesIcon className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">
          AI Resume Analyzer
        </h2>
      </div>

      {/* Tab Navigation */}
      <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-xl p-2 mb-6 border border-gray-600/50">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('text')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'text'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <DocumentTextIcon className="w-4 h-4 inline mr-2" />
            Text Input
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'upload'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <ArrowUpTrayIcon className="w-4 h-4 inline mr-2" />
            File Upload
          </button>
        </div>
      </div>

      {/* Input Section */}
      <div className="mb-6">
        {activeTab === 'text' ? (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Resume Text
            </label>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text here..."
              rows={8}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200"
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Upload Resume File
            </label>
            <div className="border-2 border-dashed border-gray-600/50 rounded-lg p-8 text-center bg-gray-800/30">
              <ArrowUpTrayIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-300 mb-4">
                Drag and drop your resume file here, or click to browse
              </p>
              <input
                type="file"
                accept=".txt,.pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="resume-upload"
              />
              <label
                htmlFor="resume-upload"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Choose File
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
        <button
          onClick={handleExtractSkills}
          disabled={loading || !resumeText.trim()}
          className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          {loading ? 'Extracting...' : 'Extract Skills'}
        </button>
        <button
          onClick={handleAnalyzeResume}
          disabled={loading || !resumeText.trim()}
          className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-medium rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          {loading ? 'Analyzing...' : 'Full Analysis'}
        </button>
      </div>

      {/* Results */}
      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Skills Section */}
          {analysis.skills && analysis.skills.length > 0 && (
            <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-600/50">
              <h3 className="text-xl font-semibold text-white mb-4">
                Extracted Skills
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {analysis.skills.map((skill: any, index: number) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-gray-800/50 to-purple-800/50 rounded-lg p-4 border border-purple-500/20"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white text-sm">
                        {skill.name}
                      </h4>
                      <span className="text-xs text-purple-300">
                        {skill.yearsOfExperience} years
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-300">
                        Level: {skill.level}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Experience Level */}
          {analysis.experienceLevel && (
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30">
              <h3 className="text-xl font-semibold text-white mb-2">
                Experience Level
              </h3>
              <p className="text-blue-300 font-medium">
                {analysis.experienceLevel}
              </p>
            </div>
          )}

          {/* Key Highlights */}
          {analysis.keyHighlights && analysis.keyHighlights.length > 0 && (
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
              <h3 className="text-xl font-semibold text-white mb-4">
                Key Highlights
              </h3>
              <ul className="space-y-3">
                {analysis.keyHighlights.map((highlight: string, index: number) => (
                  <li key={index} className="flex items-start space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-200">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Profile Improvements */}
          {analysis.profileImprovements && analysis.profileImprovements.length > 0 && (
            <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-xl p-6 border border-yellow-500/30">
              <h3 className="text-xl font-semibold text-white mb-4">
                Profile Improvement Suggestions
              </h3>
              <ul className="space-y-3">
                {analysis.profileImprovements.map((suggestion: string, index: number) => (
                  <li key={index} className="flex items-start space-x-3">
                    <SparklesIcon className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-200">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default ResumeAnalyzer; 