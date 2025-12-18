import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDecisions } from '../contexts/DecisionContext';

const OutcomeForm = () => {
  const { decisionId } = useParams();
  const { currentDecision, addOutcome, loading, error } = useDecisions();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    actualOutcome: '',
    reflection: ''
  });

  // Set initial form data if editing an existing outcome
  useEffect(() => {
    if (currentDecision?.outcome) {
      setFormData({
        actualOutcome: currentDecision.outcome.actualOutcome || '',
        reflection: currentDecision.outcome.reflection || ''
      });
    }
  }, [currentDecision]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addOutcome(decisionId, formData);
      // Navigate to the decision detail page after successful submission
      navigate(`/decisions/${decisionId}`);
    } catch (err) {
      // Error is already handled in the context
      console.error('Error adding outcome:', err);
    }
  };

  if (!currentDecision) {
    return <div>Loading decision details...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-2 text-gray-800">Record Decision Outcome</h2>
      <h3 className="text-lg text-gray-600 mb-6">{currentDecision.title}</h3>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div className="mb-6 p-4 bg-gray-50 rounded-md">
        <h4 className="font-medium text-gray-700 mb-2">Original Decision Details</h4>
        <p className="text-gray-600 mb-2">
          <span className="font-medium">Reasoning:</span> {currentDecision.reasoning}
        </p>
        <p className="text-gray-600 mb-2">
          <span className="font-medium">Expected Outcome:</span> {currentDecision.expectedOutcome}
        </p>
        {currentDecision.assumptions && currentDecision.assumptions.length > 0 && (
          <div className="mt-2">
            <p className="font-medium text-gray-700">Assumptions:</p>
            <ul className="list-disc pl-5 text-gray-600">
              {currentDecision.assumptions.map((assumption, index) => (
                <li key={index}>{assumption}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="actualOutcome" className="block text-sm font-medium text-gray-700">
            What actually happened? *
          </label>
          <textarea
            id="actualOutcome"
            name="actualOutcome"
            rows="4"
            value={formData.actualOutcome}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Describe the actual outcome of this decision..."
          />
        </div>

        <div>
          <label htmlFor="reflection" className="block text-sm font-medium text-gray-700">
            Reflection
          </label>
          <textarea
            id="reflection"
            name="reflection"
            rows="4"
            value={formData.reflection}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Any additional thoughts or reflections on the outcome?"
          />
          <p className="mt-1 text-sm text-gray-500">
            Consider what went well, what didn't, and any surprises.
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => navigate(`/decisions/${decisionId}`)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {loading ? 'Saving...' : 'Save Outcome'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OutcomeForm;
