import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDecisions } from '../contexts/DecisionContext';

const DecisionDetail = () => {
  const { decisionId } = useParams();
  const { currentDecision, setDecision, loading } = useDecisions();
  const navigate = useNavigate();

  // Set the current decision when the component mounts or decisionId changes
  useEffect(() => {
    if (decisionId) {
      setDecision(parseInt(decisionId));
    }
  }, [decisionId, setDecision]);

  if (loading && !currentDecision) {
    return <div className="text-center py-12">Loading decision details...</div>;
  }

  if (!currentDecision) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Decision not found</h2>
        <Link 
          to="/" 
          className="text-blue-600 hover:text-blue-800 hover:underline"
        >
          Back to all decisions
        </Link>
      </div>
    );
  }

  // Format the creation date
  const createdAt = new Date(currentDecision.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <Link 
          to="/" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to all decisions
        </Link>
        
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-bold text-gray-900">{currentDecision.title}</h1>
          <span className="text-sm text-gray-500">Created: {createdAt}</span>
        </div>
        
        {currentDecision.description && (
          <p className="text-gray-600 mb-6">{currentDecision.description}</p>
        )}
      </div>

      {/* Decision Details */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Decision Details</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Information about this decision</p>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Reasoning</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-line">
                {currentDecision.reasoning || 'No reasoning provided.'}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Assumptions</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {currentDecision.assumptions && currentDecision.assumptions.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {currentDecision.assumptions.map((assumption, index) => (
                      <li key={index}>{assumption}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No assumptions recorded.</p>
                )}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Expected Outcome</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-line">
                {currentDecision.expectedOutcome || 'No expected outcome provided.'}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Outcome Section */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 bg-gray-50 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Outcome</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {currentDecision.outcome ? 'Recorded outcome details' : 'No outcome recorded yet'}
            </p>
          </div>
          {!currentDecision.outcome && (
            <button
              onClick={() => navigate(`/decisions/${decisionId}/outcome`)}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Record Outcome
            </button>
          )}
        </div>
        
        {currentDecision.outcome && (
          <div className="border-t border-gray-200">
            <div className="px-4 py-5 sm:px-6">
              <h4 className="text-md font-medium text-gray-900 mb-2">Actual Outcome</h4>
              <p className="text-gray-700 whitespace-pre-line">
                {currentDecision.outcome.actualOutcome}
              </p>
              
              {currentDecision.outcome.reflection && (
                <div className="mt-4">
                  <h4 className="text-md font-medium text-gray-900 mb-2">Reflection</h4>
                  <p className="text-gray-700 whitespace-pre-line">
                    {currentDecision.outcome.reflection}
                  </p>
                </div>
              )}
              
              <div className="mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() => navigate(`/decisions/${decisionId}/outcome`)}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Edit Outcome
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Analysis Section */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 bg-gray-50 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">AI Analysis</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {currentDecision.analysis 
                ? 'AI-generated analysis of this decision' 
                : currentDecision.outcome 
                  ? 'Generate an AI analysis of this decision' 
                  : 'Record an outcome to enable AI analysis'}
            </p>
          </div>
          {currentDecision.outcome && !currentDecision.analysis && (
            <button
              onClick={() => navigate(`/decisions/${decisionId}/analysis`)}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Generate Analysis
            </button>
          )}
          {currentDecision.analysis && (
            <button
              onClick={() => navigate(`/decisions/${decisionId}/analysis`)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              View Full Analysis
            </button>
          )}
        </div>
        
        {currentDecision.analysis && (
          <div className="px-4 py-5 sm:px-6">
            <div className="prose max-w-none">
              {currentDecision.analysis.result?.summary ? (
                <p className="text-gray-700">
                  {currentDecision.analysis.result.summary}
                </p>
              ) : (
                <p className="text-gray-500 italic">
                  Analysis summary not available. View full analysis for details.
                </p>
              )}
            </div>
            <div className="mt-4">
              <Link 
                to={`/decisions/${decisionId}/analysis`}
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                View detailed analysis →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DecisionDetail;
