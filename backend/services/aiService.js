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
  
  // Split by section headers (more robust approach)
  const comparisonMatch = content.match(/1\.\s*Comparison[^:]*:\s*([\s\S]*?)(?=\d+\.|$)/i);
  const assumptionsMatch = content.match(/2\.\s*.*?assumptions[^:]*:\s*([\s\S]*?)(?=\d+\.|$)/i);
  const lessonsMatch = content.match(/3\.\s*.*?lessons[^:]*:\s*([\s\S]*?)(?=\d+\.|$)/i);
  const improvementsMatch = content.match(/4\.\s*.*?improvements|suggestions[^:]*:\s*([\s\S]*?)(?=\d+\.|$)/i);
  
  // Parse invalid assumptions as an array
  let invalidAssumptions = [];
  if (assumptionsMatch && assumptionsMatch[1]) {
    // Split by line breaks and filter out empty lines and bullet points
    invalidAssumptions = assumptionsMatch[1]
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.match(/^\s*[-*•]\s*$/))
      .map(line => line.replace(/^\s*[-*•]\s*/, '')); // Remove bullet points
  }
  
  return {
    comparison: comparisonMatch ? comparisonMatch[1].trim() : 'No comparison provided',
    invalidAssumptions: invalidAssumptions,
    lessonsLearned: lessonsMatch ? lessonsMatch[1].trim() : 'No lessons learned provided',
    improvements: improvementsMatch ? improvementsMatch[1].trim() : 'No improvement suggestions provided',
  };
};

module.exports = { generateAnalysis };
