import React, { createContext, useContext, useState, ReactNode } from 'react';
import api from '../config/axios';

interface Job {
  _id: string;
  title: string;
  description: string;
  company: {
    name: string;
    logo?: string;
    website?: string;
    description?: string;
    size?: string;
    industry?: string;
  };
  details: {
    type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';
    location: {
      type: 'remote' | 'onsite' | 'hybrid';
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
    benefits: string[];
  };
  requirements: {
    skills: Array<{ name: string; level: string; required: boolean }>;
    experience: {
      min: number;
      max: number;
    };
    education: string;
  };
  blockchain: {
    paymentMethod: string;
    cryptoPayment: {
      accepted: boolean;
      tokens: Array<{ name: string; symbol: string; network: string }>;
    };
  };
  postedBy: {
    profile: {
      firstName: string;
      lastName: string;
      headline?: string;
    };
  };
  tags: string[];
  status: 'draft' | 'active' | 'paused' | 'closed' | 'expired';
  applications: Array<{
    applicant: {
      profile: {
        firstName: string;
        lastName: string;
        headline?: string;
      };
    };
    status: 'applied' | 'reviewing' | 'interviewing' | 'accepted' | 'rejected';
    appliedAt: string;
    coverLetter?: string;
    resume?: string;
  }>;
  views: number;
  applicationsCount: number;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

interface JobContextType {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  fetchJobs: (filters?: JobFilters) => Promise<void>;
  createJob: (jobData: CreateJobData) => Promise<void>;
  applyForJob: (jobId: string, applicationData: ApplicationData) => Promise<void>;
  getJobById: (jobId: string) => Promise<Job>;
  getRecommendations: () => Promise<Job[]>;
}

interface JobFilters {
  search?: string;
  location?: string;
  type?: string;
  minSalary?: number;
  maxSalary?: number;
  skills?: string[];
  page?: number;
  limit?: number;
}

interface CreateJobData {
  title: string;
  description: string;
  company: {
    name: string;
    logo?: string;
    website?: string;
    description?: string;
    size?: string;
    industry?: string;
  };
  details: {
    type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';
    location: {
      type: 'remote' | 'onsite' | 'hybrid';
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
    benefits: string[];
  };
  requirements: {
    skills: Array<{ name: string; level: string; required: boolean }>;
    experience: {
      min: number;
      max: number;
    };
    education: string;
  };
  blockchain: {
    paymentMethod: string;
    cryptoPayment: {
      accepted: boolean;
      tokens: Array<{ name: string; symbol: string; network: string }>;
    };
  };
  tags: string[];
}

interface ApplicationData {
  coverLetter: string;
  resume: string;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export const useJob = () => {
  const context = useContext(JobContext);
  if (context === undefined) {
    throw new Error('useJob must be used within a JobProvider');
  }
  return context;
};

interface JobProviderProps {
  children: ReactNode;
}

export const JobProvider: React.FC<JobProviderProps> = ({ children }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = async (filters?: JobFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }

      const response = await api.get(`/jobs?${params.toString()}`);
      setJobs(response.data.jobs || response.data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const createJob = async (jobData: CreateJobData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/jobs', jobData);
      setJobs(prev => [response.data.job, ...prev]);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create job');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const applyForJob = async (jobId: string, applicationData: ApplicationData) => {
    try {
      setLoading(true);
      setError(null);
      
      await api.post(`/jobs/${jobId}/apply`, applicationData);
      
      // Update the job in the list to reflect the new application
      setJobs(prev => prev.map(job => {
        if (job._id === jobId) {
          return {
            ...job,
            applications: [...job.applications, {
              applicant: {
                profile: {
                  firstName: 'Current',
                  lastName: 'User',
                  headline: 'Applicant'
                }
              },
              ...applicationData,
              appliedAt: new Date().toISOString(),
              status: 'applied' as const
            }]
          };
        }
        return job;
      }));
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to apply for job');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getJobById = async (jobId: string): Promise<Job> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/jobs/${jobId}`);
      return response.data;
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch job');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getRecommendations = async (): Promise<Job[]> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/jobs/recommendations');
      return response.data;
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch recommendations');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const value: JobContextType = {
    jobs,
    loading,
    error,
    fetchJobs,
    createJob,
    applyForJob,
    getJobById,
    getRecommendations
  };

  return (
    <JobContext.Provider value={value}>
      {children}
    </JobContext.Provider>
  );
};