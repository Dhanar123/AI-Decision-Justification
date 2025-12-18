import axios from 'axios';
import type { AxiosResponse } from 'axios';

export interface Decision {
  id: number;
  title: string;
  description?: string;
  context?: string;
  reasoning?: string;
  assumptions: string[];
  expectedOutcome: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  outcome?: Outcome;
  analysis?: Analysis;
}

export interface CreateDecisionData {
  title: string;
  description?: string;
  context?: string;
  reasoning?: string;
  assumptions: string[];
  expectedOutcome: string;
}

export interface Outcome {
  id: number;
  decisionId: number;
  actualOutcome: string;
  reflection?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Analysis {
  id: number;
  decisionId: number;
  result: any;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

// Use environment variable or fallback to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Decisions API
export const createDecision = (
  decisionData: CreateDecisionData
): Promise<AxiosResponse<ApiResponse<Decision>>> => {
  console.log('Creating decision with data:', decisionData);
  return api.post('/decisions', decisionData)
    .catch(error => {
      console.error('Error in createDecision:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      throw error;
    });
};

export const getDecisions = (): Promise<AxiosResponse<ApiResponse<Decision[]>>> => {
  return api.get('/decisions')
    .catch(error => {
      console.error('Error in getDecisions:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      throw error;
    });
};

export const getDecisionById = (id: string): Promise<AxiosResponse<ApiResponse<Decision>>> => {
  return api.get(`/decisions/${id}`)
    .catch(error => {
      console.error(`Error in getDecisionById (${id}):`, error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      throw error;
    });
};

export const addOutcome = (
  id: string, 
  outcomeData: { actualOutcome: string; reflection?: string }
): Promise<AxiosResponse<ApiResponse<Decision>>> => {
  return api.post(`/decisions/${id}/outcome`, outcomeData)
    .catch(error => {
      console.error(`Error in addOutcome (${id}):`, error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      throw error;
    });
};

export const generateAnalysis = (id: string): Promise<AxiosResponse<ApiResponse<Analysis>>> => {
  return api.get(`/decisions/${id}/analysis`)
    .catch(error => {
      console.error(`Error in generateAnalysis (${id}):`, error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      throw error;
    });
};

// Add request interceptor for auth if needed
api.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url, config.method?.toUpperCase(), config.data);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    return Promise.reject(error);
  }
);

export default api;