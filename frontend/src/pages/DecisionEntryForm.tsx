import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDecision } from '../lib/api';

const DecisionEntryForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [assumptions, setAssumptions] = useState<string[]>(['']);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    context: '',
    reasoning: '',
    expectedOutcome: '',
  });

  const mutation = useMutation({
    mutationFn: createDecision,
    onSuccess: (response) => {
      console.log('Decision created successfully:', response);
      queryClient.invalidateQueries({ queryKey: ['decisions'] });
      navigate('/decisions');
    },
    onError: (error: any) => {
      console.error('Error creating decision:', error);
      let errorMessage = 'Failed to create decision. ';
      
      if (error.code === 'ERR_NETWORK') {
        errorMessage += 'Network error - please check if the backend server is running.';
      } else if (error.response) {
        errorMessage += `Server responded with status ${error.response.status}. `;
        if (error.response.data?.error) {
          errorMessage += error.response.data.error;
        }
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Unknown error occurred.';
      }
      
      alert(errorMessage);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAssumptionChange = (index: number, value: string) => {
    const newAssumptions = [...assumptions];
    newAssumptions[index] = value;
    setAssumptions(newAssumptions);
  };

  const addAssumption = () => {
    setAssumptions([...assumptions, '']);
  };

  const removeAssumption = (index: number) => {
    const newAssumptions = assumptions.filter((_, i) => i !== index);
    setAssumptions(newAssumptions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validAssumptions = assumptions.filter(a => a.trim() !== '');
    
    const submitData = {
      ...formData,
      assumptions: validAssumptions,
    };
    
    console.log('Submitting decision:', submitData);
    mutation.mutate(submitData);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">New Decision</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>

        <div>
          <label htmlFor="context" className="block text-sm font-medium text-gray-700">
            Context
          </label>
          <textarea
            id="context"
            name="context"
            rows={3}
            value={formData.context}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>

        <div>
          <label htmlFor="reasoning" className="block text-sm font-medium text-gray-700">
            Reasoning *
          </label>
          <textarea
            id="reasoning"
            name="reasoning"
            required
            rows={4}
            value={formData.reasoning}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assumptions
          </label>
          {assumptions.map((assumption, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="text"
                value={assumption}
                onChange={(e) => handleAssumptionChange(index, e.target.value)}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Enter an assumption"
              />
              <button
                type="button"
                onClick={() => removeAssumption(index)}
                className="ml-2 p-2 text-red-600 hover:text-red-800"
                title="Remove assumption"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addAssumption}
            className="mt-2 text-sm text-primary-600 hover:text-primary-800"
          >
            + Add Assumption
          </button>
        </div>

        <div>
          <label htmlFor="expectedOutcome" className="block text-sm font-medium text-gray-700">
            Expected Outcome *
          </label>
          <textarea
            id="expectedOutcome"
            name="expectedOutcome"
            required
            rows={4}
            value={formData.expectedOutcome}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>

        {mutation.isError && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error creating decision
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{(mutation.error as any)?.response?.data?.error || (mutation.error as any)?.message || 'Unknown error occurred'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {mutation.isPending ? 'Saving...' : 'Save Decision'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DecisionEntryForm;