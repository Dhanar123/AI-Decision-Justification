const OpenAI = require('openai');

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:3000',
    'X-Title': 'AI Decision Justification'
  },
});

const generateAnalysis = async (decision) => {
  try {
    const assumptions = Array.isArray(decision.assumptions) 
      ? decision.assumptions 
      : JSON.parse(decision.assumptions || '[]');
    
    const prompt = `
    Please analyze the following decision and its outcome:
    
    **Decision Title:** ${decision.title}
    **Description:** ${decision.description || 'N/A'}
    **Reasoning:** ${decision.reasoning}
    **Assumptions:** ${assumptions.join('\n- ')}
    **Expected Outcome:** ${decision.expectedOutcome}
    **Actual Outcome:** ${decision.outcome.actualOutcome}
    **Reflection Notes:** ${decision.outcome.reflection || 'N/A'}

    Please provide a detailed analysis with the following sections:
    1. Comparison between expected and actual outcomes
    2. List of invalid or weak assumptions
    3. Key lessons learned
    4. Suggestions for improving future decisions
    `;

    const response = await openai.chat.completions.create({
      model: 'mistralai/mistral-7b-instruct',
      messages: [
        {
          role: 'system',
          content: 'You are an expert decision analyst. Provide a thorough, objective analysis of the decision and its outcome.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    
    // Parse the response into structured data
    return parseAnalysisResponse(content);
  } catch (error) {
    console.error('Error generating AI analysis:', error);
    throw new Error('Failed to generate AI analysis');
  }
};

const parseAnalysisResponse = (content) => {
  // This is a simple parser that looks for specific section headers
  // You might need to adjust this based on the actual AI response format
  const sections = content.split(/\d+\.\s+/).filter(section => section.trim());
  
  return {
    comparison: sections[0]?.replace('Comparison between expected and actual outcomes', '').trim() || 'No comparison provided',
    invalidAssumptions: sections[1]?.replace('List of invalid or weak assumptions', '').trim().split('\n').filter(Boolean) || [],
    lessonsLearned: sections[2]?.replace('Key lessons learned', '').trim() || 'No lessons learned provided',
    improvements: sections[3]?.replace('Suggestions for improving future decisions', '').trim() || 'No improvement suggestions provided',
  };
};

module.exports = { generateAnalysis };
