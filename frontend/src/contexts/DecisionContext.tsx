import React, { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../services/api';

interface DecisionContextType {
  decisions: any[];
  loading: boolean;
  error: string | null;
  createDecision: (data: any) => Promise<void>;
  getDecision: (id: string) => Promise<any>;
  addOutcome: (id: string, data: any) => Promise<void>;
  triggerAnalysis: (id: string) => Promise<void>;
}

const DecisionContext = createContext<DecisionContextType | undefined>(undefined);

export const DecisionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [decisions, setDecisions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDecisions = async () => {
    try {
      setLoading(true);
      const data = await api.getDecisions();
      setDecisions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch decisions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDecisions();
  }, []);

  const createDecision = async (data: any) => {
    try {
      await api.createDecision(data);
      await fetchDecisions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create decision');
      throw err;
    }
  };

  const getDecision = async (id: string) => {
    try {
      return await api.getDecision(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch decision');
      throw err;
    }
  };

  const addOutcome = async (id: string, data: any) => {
    try {
      await api.addOutcome(id, data);
      await fetchDecisions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add outcome');
      throw err;
    }
  };

  const triggerAnalysis = async (id: string) => {
    try {
      await api.generateAnalysis(id);
      await fetchDecisions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate analysis');
      throw err;
    }
  };

  return (
    <DecisionContext.Provider
      value={{
        decisions,
        loading,
        error,
        createDecision,
        getDecision,
        addOutcome,
        triggerAnalysis,
      }}
    >
      {children}
    </DecisionContext.Provider>
  );
};

export const useDecisions = (): DecisionContextType => {
  const context = useContext(DecisionContext);
  if (context === undefined) {
    throw new Error('useDecisions must be used within a DecisionProvider');
  }
  return context;
};
