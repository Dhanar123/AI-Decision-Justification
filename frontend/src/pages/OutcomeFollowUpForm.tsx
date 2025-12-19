import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import type { Decision } from '../lib/api';

const OutcomeFollowUpForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    actualOutcome: '',
    reflectionNotes: '',
  });

  // Fetch the decision data
  const { data: decision, isLoading, error } = useQuery<Decision>({
    queryKey: ['decision', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/decisions/${id}`);
      // Parse assumptions if it's a string
      if (typeof data.assumptions === 'string') {
        data.assumptions = JSON.parse(data.assumptions);
      }
      return data;
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: { actualOutcome: string; reflection: string }) => {
      const { data: response } = await apiClient.post(`/decisions/${id}/outcome`, {
        actualOutcome: data.actualOutcome,
        reflection: data.reflection
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decision', id] });
      queryClient.invalidateQueries({ queryKey: ['decisions'] });
      navigate(`/decisions/${id}`);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      actualOutcome: formData.actualOutcome,
      reflection: formData.reflectionNotes
    });
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading decision</div>;
  if (!decision) return <div>Decision not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        Record Outcome: {decision.title}
      </h1>
      
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-medium mb-2">Original Decision</h2>
        <p className="text-gray-700 mb-2">
          <span className="font-medium">Expected Outcome:</span> {decision.expectedOutcome}
        </p>
        {decision.reasoning && (
          <p className="text-gray-700 mb-2">
            <span className="font-medium">Reasoning:</span> {decision.reasoning}
          </p>
        )}
        {decision.assumptions && decision.assumptions.length > 0 && (
          <div className="mt-2">
            <p className="font-medium mb-1">Assumptions:</p>
            <ul className="list-disc pl-5 space-y-1">
              {decision.assumptions.map((assumption: string, index: number) => (
                <li key={index} className="text-gray-700">{assumption}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="actualOutcome" className="block text-sm font-medium text-gray-700">
            What was the actual outcome? *
          </label>
          <textarea
            id="actualOutcome"
            name="actualOutcome"
            required
            rows={4}
            value={formData.actualOutcome}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            placeholder="Describe what actually happened..."
          />
        </div>

        <div>
          <label htmlFor="reflectionNotes" className="block text-sm font-medium text-gray-700">
            Reflection Notes
          </label>
          <textarea
            id="reflectionNotes"
            name="reflectionNotes"
            rows={4}
            value={formData.reflectionNotes}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            placeholder="Any additional thoughts or reflections on the outcome..."
          />
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {mutation.isPending ? 'Saving...' : 'Save Outcome'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OutcomeFollowUpForm;
