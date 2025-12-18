import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';

interface Decision {
  id: number;
  title: string;
  description: string | null;
  reasoning: string;
  assumptions: string[];
  expectedOutcome: string;
  createdAt: string;
  outcome?: {
    id: number;
    actualOutcome: string;
    reflection: string | null;
  };
  analysis?: {
    id: number;
    result: string | {
      comparison: string;
      invalidAssumptions: string[];
      lessonsLearned: string;
      improvements: string;
    };
  };
}

export default function DecisionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showOutcomeForm, setShowOutcomeForm] = useState(false);
  const [outcomeData, setOutcomeData] = useState({
    actualOutcome: '',
    reflection: '',
  });

  const { data: decision, isLoading, error } = useQuery<Decision>({
    queryKey: ['decision', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/decisions/${id}`);
      // Parse assumptions if it's a string
      if (typeof data.assumptions === 'string') {
        data.assumptions = JSON.parse(data.assumptions);
      }
      return data;
    },
  });

  const outcomeMutation = useMutation({
    mutationFn: async (data: { actualOutcome: string; reflection: string }) => {
      const response = await apiClient.post(`/decisions/${id}/outcome`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decision', id] });
      setShowOutcomeForm(false);
    },
  });

  const analysisMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.get(`/decisions/${id}/analysis`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decision', id] });
    },
  });

  if (isLoading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (error || !decision) {
    return (
      <div className="p-6 text-center text-red-600">
        Failed to load decision. <button onClick={() => navigate('/decisions')} className="underline">Go back</button>
      </div>
    );
  }

  const handleOutcomeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    outcomeMutation.mutate(outcomeData);
  };

  const parseAnalysisResult = (result: any) => {
    if (typeof result === 'string') {
      try {
        return JSON.parse(result);
      } catch {
        return { raw: result };
      }
    }
    return result;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={() => navigate('/decisions')}
        className="mb-4 text-primary-600 hover:text-primary-800"
      >
        ← Back to Decisions
      </button>

      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">{decision.title}</h1>
        <p className="text-gray-500 text-sm mb-6">
          Created: {new Date(decision.createdAt).toLocaleDateString()}
        </p>

        {decision.description && (
          <div className="mb-4">
            <h3 className="font-semibold text-gray-700">Description</h3>
            <p className="text-gray-600">{decision.description}</p>
          </div>
        )}

        <div className="mb-4">
          <h3 className="font-semibold text-gray-700">Reasoning</h3>
          <p className="text-gray-600 whitespace-pre-wrap">{decision.reasoning}</p>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold text-gray-700">Assumptions</h3>
          <ul className="list-disc list-inside text-gray-600">
            {decision.assumptions.map((assumption, index) => (
              <li key={index}>{assumption}</li>
            ))}
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-gray-700">Expected Outcome</h3>
          <p className="text-gray-600 whitespace-pre-wrap">{decision.expectedOutcome}</p>
        </div>

        {/* Outcome Section */}
        <div className="border-t pt-6">
          <h2 className="text-xl font-bold mb-4">Outcome</h2>
          
          {decision.outcome ? (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="mb-3">
                <h3 className="font-semibold text-gray-700">Actual Outcome</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{decision.outcome.actualOutcome}</p>
              </div>
              {decision.outcome.reflection && (
                <div>
                  <h3 className="font-semibold text-gray-700">Reflection</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{decision.outcome.reflection}</p>
                </div>
              )}
            </div>
          ) : showOutcomeForm ? (
            <form onSubmit={handleOutcomeSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Actual Outcome *</label>
                <textarea
                  required
                  rows={4}
                  value={outcomeData.actualOutcome}
                  onChange={(e) => setOutcomeData(prev => ({ ...prev, actualOutcome: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Reflection</label>
                <textarea
                  rows={3}
                  value={outcomeData.reflection}
                  onChange={(e) => setOutcomeData(prev => ({ ...prev, reflection: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={outcomeMutation.isPending}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {outcomeMutation.isPending ? 'Saving...' : 'Save Outcome'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowOutcomeForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowOutcomeForm(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Add Outcome
            </button>
          )}
        </div>

        {/* Analysis Section */}
        {decision.outcome && (
          <div className="border-t pt-6 mt-6">
            <h2 className="text-xl font-bold mb-4">AI Analysis</h2>
            
            {decision.analysis ? (
              <div className="bg-blue-50 p-4 rounded-lg space-y-4">
                {(() => {
                  const result = parseAnalysisResult(decision.analysis.result);
                  if (result.raw) {
                    return <p className="text-gray-700 whitespace-pre-wrap">{result.raw}</p>;
                  }
                  return (
                    <>
                      <div>
                        <h3 className="font-semibold text-gray-700">Comparison</h3>
                        <p className="text-gray-600">{result.comparison}</p>
                      </div>
                      {result.invalidAssumptions?.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-gray-700">Invalid Assumptions</h3>
                          <ul className="list-disc list-inside text-gray-600">
                            {result.invalidAssumptions.map((item: string, i: number) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-700">Lessons Learned</h3>
                        <p className="text-gray-600">{result.lessonsLearned}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-700">Improvements</h3>
                        <p className="text-gray-600">{result.improvements}</p>
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              <button
                onClick={() => analysisMutation.mutate()}
                disabled={analysisMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {analysisMutation.isPending ? 'Generating Analysis...' : 'Generate AI Analysis'}
              </button>
            )}
            {analysisMutation.isError && (
              <p className="mt-2 text-red-600">
                Failed to generate analysis: {(analysisMutation.error as any)?.response?.data?.error || 'Unknown error'}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

