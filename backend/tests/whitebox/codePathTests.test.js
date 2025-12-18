/**
 * WHITE-BOX TESTS - Code Path Testing
 * Tests internal code paths, branches, and logic flows
 */

// Mock dependencies
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    decision: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    outcome: {
      create: jest.fn(),
    },
    analysis: {
      create: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

jest.mock('../../services/aiService', () => ({
  generateAnalysis: jest.fn(),
}));

const { PrismaClient } = require('@prisma/client');
const controller = require('../../controllers/decisionController');

describe('White-Box Tests - Code Path Coverage', () => {
  let prisma;
  let mockRes;

  beforeEach(() => {
    prisma = new PrismaClient();
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('createDecision - Branch Coverage', () => {
    // Path 1: All required fields present, array assumptions
    test('Path 1: Valid data with array assumptions', async () => {
      const mockReq = {
        body: {
          title: 'Test',
          reasoning: 'Test',
          expectedOutcome: 'Test',
          assumptions: ['A1', 'A2'],
          description: 'Desc',
        },
      };

      prisma.decision.create.mockResolvedValue({ id: 1, ...mockReq.body });
      await controller.createDecision(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    // Path 2: Valid data with string JSON assumptions
    test('Path 2: Valid data with JSON string assumptions', async () => {
      const mockReq = {
        body: {
          title: 'Test',
          reasoning: 'Test',
          expectedOutcome: 'Test',
          assumptions: '["A1", "A2"]',
        },
      };

      prisma.decision.create.mockResolvedValue({ id: 1 });
      await controller.createDecision(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    // Path 3: Missing title (early return)
    test('Path 3: Missing title triggers validation error', async () => {
      const mockReq = {
        body: { reasoning: 'Test', expectedOutcome: 'Test' },
      };

      await controller.createDecision(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(prisma.decision.create).not.toHaveBeenCalled();
    });

    // Path 4: Missing reasoning (early return)
    test('Path 4: Missing reasoning triggers validation error', async () => {
      const mockReq = {
        body: { title: 'Test', expectedOutcome: 'Test' },
      };

      await controller.createDecision(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    // Path 5: Missing expectedOutcome (early return)
    test('Path 5: Missing expectedOutcome triggers validation error', async () => {
      const mockReq = {
        body: { title: 'Test', reasoning: 'Test' },
      };

      await controller.createDecision(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    // Path 6: Invalid JSON assumptions
    test('Path 6: Invalid JSON assumptions triggers parse error', async () => {
      const mockReq = {
        body: {
          title: 'Test',
          reasoning: 'Test',
          expectedOutcome: 'Test',
          assumptions: 'not-valid-json{[',
        },
      };

      await controller.createDecision(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid assumptions format. Must be a JSON array.',
      });
    });

    // Path 7: Assumptions is not an array after parsing
    test('Path 7: Non-array assumptions after parsing', async () => {
      const mockReq = {
        body: {
          title: 'Test',
          reasoning: 'Test',
          expectedOutcome: 'Test',
          assumptions: '"just a string"',
        },
      };

      await controller.createDecision(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    // Path 8: Empty/null assumptions defaults to empty array
    test('Path 8: Null assumptions defaults to empty array', async () => {
      const mockReq = {
        body: {
          title: 'Test',
          reasoning: 'Test',
          expectedOutcome: 'Test',
          assumptions: null,
        },
      };

      prisma.decision.create.mockResolvedValue({ id: 1 });
      await controller.createDecision(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    // Path 9: Database error
    test('Path 9: Database error triggers 500 response', async () => {
      const mockReq = {
        body: {
          title: 'Test',
          reasoning: 'Test',
          expectedOutcome: 'Test',
          assumptions: [],
        },
      };

      prisma.decision.create.mockRejectedValue(new Error('DB Error'));
      await controller.createDecision(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });

    // Path 10: No description provided
    test('Path 10: Missing description uses empty string default', async () => {
      const mockReq = {
        body: {
          title: 'Test',
          reasoning: 'Test',
          expectedOutcome: 'Test',
          assumptions: [],
        },
      };

      prisma.decision.create.mockResolvedValue({ id: 1 });
      await controller.createDecision(mockReq, mockRes);

      expect(prisma.decision.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          description: '',
        }),
      });
    });
  });

  describe('getDecisionById - Branch Coverage', () => {
    // Path 1: Valid numeric ID, decision found
    test('Path 1: Valid ID returns decision', async () => {
      prisma.decision.findUnique.mockResolvedValue({ id: 1, title: 'Test' });

      await controller.getDecisionById({ params: { id: '1' } }, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    // Path 2: Invalid ID format (NaN)
    test('Path 2: Non-numeric ID returns 400', async () => {
      await controller.getDecisionById({ params: { id: 'abc' } }, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid decision ID' });
    });

    // Path 3: Valid ID, decision not found
    test('Path 3: Valid ID but decision not found returns 404', async () => {
      prisma.decision.findUnique.mockResolvedValue(null);

      await controller.getDecisionById({ params: { id: '999' } }, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    // Path 4: Database error
    test('Path 4: Database error returns 500', async () => {
      prisma.decision.findUnique.mockRejectedValue(new Error('DB Error'));

      await controller.getDecisionById({ params: { id: '1' } }, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('addOutcome - Branch Coverage', () => {
    // Path 1: Valid outcome added
    test('Path 1: Successfully adds outcome', async () => {
      prisma.decision.findUnique.mockResolvedValue({ id: 1, outcome: null });
      prisma.outcome.create.mockResolvedValue({
        id: 1,
        actualOutcome: 'Result',
        decision: { assumptions: '[]' },
      });

      await controller.addOutcome(
        { params: { id: '1' }, body: { actualOutcome: 'Result' } },
        mockRes
      );

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    // Path 2: Invalid ID
    test('Path 2: Invalid ID returns 400', async () => {
      await controller.addOutcome(
        { params: { id: 'invalid' }, body: { actualOutcome: 'Result' } },
        mockRes
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    // Path 3: Missing actualOutcome
    test('Path 3: Missing actualOutcome returns 400', async () => {
      await controller.addOutcome({ params: { id: '1' }, body: {} }, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    // Path 4: Decision not found
    test('Path 4: Decision not found returns 404', async () => {
      prisma.decision.findUnique.mockResolvedValue(null);

      await controller.addOutcome(
        { params: { id: '1' }, body: { actualOutcome: 'Result' } },
        mockRes
      );

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    // Path 5: Outcome already exists
    test('Path 5: Existing outcome returns 400', async () => {
      prisma.decision.findUnique.mockResolvedValue({
        id: 1,
        outcome: { id: 1 },
      });

      await controller.addOutcome(
        { params: { id: '1' }, body: { actualOutcome: 'Result' } },
        mockRes
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    // Path 6: No reflection provided (uses empty string)
    test('Path 6: Missing reflection uses empty string', async () => {
      prisma.decision.findUnique.mockResolvedValue({ id: 1, outcome: null });
      prisma.outcome.create.mockResolvedValue({
        id: 1,
        actualOutcome: 'Result',
        reflection: '',
        decision: { assumptions: '[]' },
      });

      await controller.addOutcome(
        { params: { id: '1' }, body: { actualOutcome: 'Result' } },
        mockRes
      );

      expect(prisma.outcome.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            reflection: '',
          }),
        })
      );
    });
  });

  describe('generateAnalysis - Branch Coverage', () => {
    const { generateAnalysis: aiGenerateAnalysis } = require('../../services/aiService');

    // Path 1: Successfully generates analysis
    test('Path 1: Successfully generates analysis', async () => {
      prisma.decision.findUnique.mockResolvedValue({
        id: 1,
        assumptions: '[]',
        outcome: { actualOutcome: 'Result' },
        analysis: null,
      });
      aiGenerateAnalysis.mockResolvedValue({ comparison: 'Test' });
      prisma.analysis.create.mockResolvedValue({ id: 1, result: '{}' });

      await controller.generateAnalysis({ params: { id: '1' } }, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    // Path 2: Invalid ID
    test('Path 2: Invalid ID returns 400', async () => {
      await controller.generateAnalysis({ params: { id: 'invalid' } }, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    // Path 3: Decision not found
    test('Path 3: Decision not found returns 404', async () => {
      prisma.decision.findUnique.mockResolvedValue(null);

      await controller.generateAnalysis({ params: { id: '1' } }, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    // Path 4: No outcome exists
    test('Path 4: No outcome returns 400', async () => {
      prisma.decision.findUnique.mockResolvedValue({
        id: 1,
        outcome: null,
        analysis: null,
      });

      await controller.generateAnalysis({ params: { id: '1' } }, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    // Path 5: Analysis already exists
    test('Path 5: Existing analysis returns 400', async () => {
      prisma.decision.findUnique.mockResolvedValue({
        id: 1,
        outcome: { id: 1 },
        analysis: { id: 1 },
      });

      await controller.generateAnalysis({ params: { id: '1' } }, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    // Path 6: AI service error
    test('Path 6: AI service error returns 500', async () => {
      prisma.decision.findUnique.mockResolvedValue({
        id: 1,
        assumptions: '[]',
        outcome: { actualOutcome: 'Result' },
        analysis: null,
      });
      aiGenerateAnalysis.mockRejectedValue(new Error('AI Error'));

      await controller.generateAnalysis({ params: { id: '1' } }, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });
});

