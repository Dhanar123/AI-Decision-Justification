import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDecisions } from '../contexts/DecisionContext';

const DecisionForm = () => {
  const { createDecision, loading, error } = useDecisions();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reasoning: '',
    assumptions: [''],
    expectedOutcome: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAssumptionChange = (index, value) => {
    const newAssumptions = [...formData.assumptions];
    newAssumptions[index] = value;
    setFormData(prev => ({
      ...prev,
      assumptions: newAssumptions
    }));
  };

  const addAssumptionField = () => {
    setFormData(prev => ({
      ...prev,
      assumptions: [...prev.assumptions, '']
    }));
  };

  const removeAssumptionField = (index) => {
    if (formData.assumptions.length <= 1) return;
    
    const newAssumptions = formData.assumptions.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      assumptions: newAssumptions
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const decision = await createDecision({
        ...formData,
        // Filter out empty assumptions
        assumptions: formData.assumptions.filter(a => a.trim() !== '')
      });
      
      // Redirect to the decision detail page
      navigate(`/decisions/${decision.id}`);
    } catch (err) {
      // Error is already handled in the context
      console.error('Error creating decision:', err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">New Decision</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="reasoning" className="block text-sm font-medium text-gray-700">
            Reasoning *
          </label>
          <textarea
            id="reasoning"
            name="reasoning"
            rows="4"
            value={formData.reasoning}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            Explain the thought process behind this decision.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assumptions
          </label>
          <div className="space-y-2">
            {formData.assumptions.map((assumption, index) => (
              <div key={index} className="flex space-x-2">
                <input
                  type="text"
                  value={assumption}
                  onChange={(e) => handleAssumptionChange(index, e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder={`Assumption ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeAssumptionField(index)}
                  className="px-3 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  disabled={formData.assumptions.length <= 1}
                >
                  -
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addAssumptionField}
              className="mt-2 px-3 py-1 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              + Add Another Assumption
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="expectedOutcome" className="block text-sm font-medium text-gray-700">
            Expected Outcome *
          </label>
          <textarea
            id="expectedOutcome"
            name="expectedOutcome"
            rows="3"
            value={formData.expectedOutcome}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            What do you expect to happen as a result of this decision?
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {loading ? 'Saving...' : 'Save Decision'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DecisionForm;
