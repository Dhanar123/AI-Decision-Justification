/**
 * UNIT TESTS - AI Service
 * Tests individual functions in isolation
 */

// Create mock before requiring module
const mockCreate = jest.fn();

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockCreate
      }
    }
  }));
});

// Now require the service after mocking
const { generateAnalysis } = require('../../services/aiService');

describe('AI Service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateAnalysis', () => {
    const mockDecision = {
      title: 'Test Decision',
      description: 'Test Description',
      reasoning: 'Test Reasoning',
      assumptions: ['Assumption 1', 'Assumption 2'],
      expectedOutcome: 'Expected Result',
      outcome: {
        actualOutcome: 'Actual Result',
        reflection: 'Test Reflection'
      }
    };

    test('should generate analysis with valid decision data', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: `1. Comparison between expected and actual outcomes
The expected outcome was partially achieved.

2. List of invalid or weak assumptions
- Assumption 1 was incorrect
- Assumption 2 was valid

3. Key lessons learned
Important insights were gained.

4. Suggestions for improving future decisions
Consider more data before deciding.`
          }
        }]
      };

      mockCreate.mockResolvedValue(mockResponse);

      const result = await generateAnalysis(mockDecision);

      expect(result).toHaveProperty('comparison');
      expect(result).toHaveProperty('invalidAssumptions');
      expect(result).toHaveProperty('lessonsLearned');
      expect(result).toHaveProperty('improvements');
      expect(mockCreate).toHaveBeenCalled();
    });

    test('should handle string assumptions (JSON)', async () => {
      const decisionWithStringAssumptions = {
        ...mockDecision,
        assumptions: JSON.stringify(['Assumption 1', 'Assumption 2'])
      };

      const mockResponse = {
        choices: [{
          message: {
            content: '1. Comparison\nTest\n2. Invalid\nNone\n3. Lessons\nLearned\n4. Suggestions\nImprove'
          }
        }]
      };

      mockCreate.mockResolvedValue(mockResponse);

      const result = await generateAnalysis(decisionWithStringAssumptions);
      expect(result).toBeDefined();
    });

    test('should throw error when API fails', async () => {
      mockCreate.mockRejectedValue(new Error('API Error'));

      await expect(generateAnalysis(mockDecision)).rejects.toThrow('Failed to generate AI analysis');
    });

    test('should handle empty assumptions', async () => {
      const decisionWithEmptyAssumptions = {
        ...mockDecision,
        assumptions: []
      };

      const mockResponse = {
        choices: [{
          message: {
            content: '1. Comparison\nTest\n2. Invalid\nNone\n3. Lessons\nLearned\n4. Suggestions\nImprove'
          }
        }]
      };

      mockCreate.mockResolvedValue(mockResponse);

      const result = await generateAnalysis(decisionWithEmptyAssumptions);
      expect(result).toBeDefined();
    });

    test('should call OpenAI with correct parameters', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: '1. Comparison\nTest\n2. Invalid\n3. Lessons\n4. Suggestions'
          }
        }]
      };

      mockCreate.mockResolvedValue(mockResponse);

      await generateAnalysis(mockDecision);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'mistralai/mistral-7b-instruct',
          messages: expect.arrayContaining([
            expect.objectContaining({ role: 'system' }),
            expect.objectContaining({ role: 'user' })
          ])
        })
      );
    });
  });
});
