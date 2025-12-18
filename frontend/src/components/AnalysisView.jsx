import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDecisions } from '../contexts/DecisionContext';

const AnalysisView = () => {
  const { decisionId } = useParams();
  const { currentDecision, generateAnalysis, loading, error } = useDecisions();
  const [analysis, setAnalysis] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  // Load analysis when component mounts or currentDecision changes
  useEffect(() => {
    if (currentDecision?.analysis) {
      try {
        // If analysis is a string, parse it (should be JSON)
        const parsedAnalysis = typeof currentDecision.analysis.result === 'string' 
          ? JSON.parse(currentDecision.analysis.result) 
          : currentDecision.analysis.result;
        setAnalysis(parsedAnalysis);
      } catch (err) {
        console.error('Error parsing analysis:', err);
        setAnalysis({
          error: 'Failed to parse analysis. The format is invalid.'
        });
      }
    }
  }, [currentDecision]);

  const handleGenerateAnalysis = async () => {
    try {
      setIsGenerating(true);
      const updatedDecision = await generateAnalysis(decisionId);
      
      // Parse the analysis result if it's a string
      if (updatedDecision.analysis?.result) {
        const parsedAnalysis = typeof updatedDecision.analysis.result === 'string' 
          ? JSON.parse(updatedDecision.analysis.result) 
          : updatedDecision.analysis.result;
        setAnalysis(parsedAnalysis);
      }
    } catch (err) {
      console.error('Error generating analysis:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!currentDecision) {
    return <div>Loading decision details...</div>;
  }

  if (!currentDecision.outcome) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">No Outcome Recorded</h2>
        <p className="mb-6 text-gray-600">
          You need to record the outcome of this decision before generating an analysis.
        </p>
        <button
          onClick={() => navigate(`/decisions/${decisionId}/outcome`)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Record Outcome
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Decision Analysis</h1>
        <h2 className="text-xl text-gray-600">{currentDecision.title}</h2>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {!analysis ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600 mb-6">
            No analysis has been generated for this decision yet.
          </p>
          <button
            onClick={handleGenerateAnalysis}
            disabled={loading || isGenerating}
            className={`px-6 py-3 text-lg font-medium text-white rounded-md ${(loading || isGenerating) ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {isGenerating ? 'Generating Analysis...' : 'Generate AI Analysis'}
          </button>
          <p className="mt-3 text-sm text-gray-500">
            This will analyze the decision and its outcome using AI.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Analysis Actions */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Analysis Results</h3>
            <button
              onClick={handleGenerateAnalysis}
              disabled={loading || isGenerating}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isGenerating ? 'Regenerating...' : 'Regenerate Analysis'}
            </button>
          </div>

          {/* Analysis Content */}
          <div className="space-y-8">
            {/* Comparison Section */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Comparison of Expected vs. Actual Outcomes
              </h4>
              <div className="prose max-w-none">
                {analysis.comparison ? (
                  <p className="text-gray-700 whitespace-pre-line">{analysis.comparison}</p>
                ) : (
                  <p className="text-gray-500 italic">No comparison available.</p>
                )}
              </div>
            </div>

            {/* Invalid Assumptions Section */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Invalid or Questionable Assumptions
              </h4>
              {analysis.invalidAssumptions && analysis.invalidAssumptions.length > 0 ? (
                <ul className="list-disc pl-5 space-y-2">
                  {analysis.invalidAssumptions.map((assumption, index) => (
                    <li key={index} className="text-gray-700">{assumption}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No invalid assumptions identified.</p>
              )}
            </div>

            {/* Lessons Learned Section */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Key Lessons Learned</h4>
              <div className="prose max-w-none">
                {analysis.lessonsLearned ? (
                  <p className="text-gray-700 whitespace-pre-line">{analysis.lessonsLearned}</p>
                ) : (
                  <p className="text-gray-500 italic">No lessons learned identified.</p>
                )}
              </div>
            </div>

            {/* Improvements Section */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Suggestions for Future Decisions
              </h4>
              <div className="prose max-w-none">
                {analysis.improvements ? (
                  <p className="text-gray-700 whitespace-pre-line">{analysis.improvements}</p>
                ) : (
                  <p className="text-gray-500 italic">No improvement suggestions available.</p>
                )}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between">
            <button
              onClick={() => navigate(`/decisions/${decisionId}`)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Decision
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              View All Decisions
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisView;
