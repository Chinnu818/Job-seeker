import React, { createContext, useContext, useState, ReactNode } from 'react';
import api from '../config/axios';

interface AIMatchResult {
  score: number;
  feedback: string;
  matchedSkills: string[];
  missingSkills: string[];
  recommendations: string[];
}

interface ResumeAnalysis {
  skills: Array<{
    name: string;
    level: string;
    yearsOfExperience: number;
  }>;
  experienceLevel: string;
  keyHighlights: string[];
}

interface SmartSuggestions {
  jobSuggestions: Array<{
    job: any;
    matchScore: number;
    reason: string;
  }>;
  connectionSuggestions: Array<{
    user: any;
    matchScore: number;
    reason: string;
  }>;
  careerAdvice: string[];
}

interface AIContextType {
  // Job matching
  calculateJobMatch: (jobId: string, jobRequirements: any) => Promise<AIMatchResult>;
  
  // Resume analysis
  extractSkillsFromResume: (resumeText: string) => Promise<ResumeAnalysis>;
  analyzeResumeAndSuggest: (resumeText: string) => Promise<any>;
  
  // Smart suggestions
  getSmartSuggestions: () => Promise<SmartSuggestions>;
  getJobAlerts: () => Promise<any[]>;
  
  // Loading states
  loading: boolean;
  error: string | null;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const useAI = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

interface AIProviderProps {
  children: ReactNode;
}

export const AIProvider: React.FC<AIProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateJobMatch = async (jobId: string, jobRequirements: any): Promise<AIMatchResult> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/ai/match-job', {
        jobId,
        jobRequirements
      });
      
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to calculate job match');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const extractSkillsFromResume = async (resumeText: string): Promise<ResumeAnalysis> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Making API call to extract skills from resume');
      const response = await api.post('/ai/extract-resume-skills', {
        resumeText
      }, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      
      console.log('API response for skills extraction:', response.data);
      return response.data;
    } catch (err: any) {
      console.error('API error for skills extraction:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to extract skills from resume';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const analyzeResumeAndSuggest = async (resumeText: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Making API call to analyze resume');
      const response = await api.post('/ai/analyze-resume', {
        resumeText
      }, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      
      console.log('API response for resume analysis:', response.data);
      return response.data;
    } catch (err: any) {
      console.error('API error for resume analysis:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to analyze resume';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getSmartSuggestions = async (): Promise<SmartSuggestions> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/ai/smart-suggestions', {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to get smart suggestions');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getJobAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/ai/job-alerts', {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to get job alerts');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value: AIContextType = {
    calculateJobMatch,
    extractSkillsFromResume,
    analyzeResumeAndSuggest,
    getSmartSuggestions,
    getJobAlerts,
    loading,
    error
  };

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
}; 