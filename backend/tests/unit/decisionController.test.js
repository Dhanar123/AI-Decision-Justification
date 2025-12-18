/**
 * UNIT TESTS - Decision Controller
 * Tests controller functions in isolation with mocked dependencies
 */

const { PrismaClient } = require('@prisma/client');

// Mock Prisma
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

// Mock AI Service
jest.mock('../../services/aiService', () => ({
  generateAnalysis: jest.fn(),
}));

const controller = require('../../controllers/decisionController');
const { generateAnalysis } = require('../../services/aiService');

describe('Decision Controller - Unit Tests', () => {
  let mockReq;
  let mockRes;
  let prisma;

  beforeEach(() => {
    prisma = new PrismaClient();
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('createDecision', () => {
    test('should create decision with valid data', async () => {
      mockReq = {
        body: {
          title: 'Test Decision',
          reasoning: 'Test Reasoning',
          expectedOutcome: 'Test Outcome',
          assumptions: ['Assumption 1'],
          description: 'Test Description',
        },
      };

      const mockDecision = {
        id: 1,
        ...mockReq.body,
        assumptions: JSON.stringify(mockReq.body.assumptions),
        createdAt: new Date(),
      };

      prisma.decision.create.mockResolvedValue(mockDecision);

      await controller.createDecision(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockDecision);
    });

    test('should return 400 when title is missing', async () => {
      mockReq = {
        body: {
          reasoning: 'Test Reasoning',
          expectedOutcome: 'Test Outcome',
        },
      };

      await controller.createDecision(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Title, reasoning, and expected outcome are required',
      });
    });

    test('should return 400 when reasoning is missing', async () => {
      mockReq = {
        body: {
          title: 'Test',
          expectedOutcome: 'Test Outcome',
        },
      };

      await controller.createDecision(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test('should return 400 for invalid assumptions format', async () => {
      mockReq = {
        body: {
          title: 'Test',
          reasoning: 'Test',
          expectedOutcome: 'Test',
          assumptions: 'not-valid-json{',
        },
      };

      await controller.createDecision(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid assumptions format. Must be a JSON array.',
      });
    });
  });

  describe('getDecisions', () => {
    test('should return all decisions', async () => {
      const mockDecisions = [
        { id: 1, title: 'Decision 1', assumptions: '[]' },
        { id: 2, title: 'Decision 2', assumptions: '["test"]' },
      ];

      prisma.decision.findMany.mockResolvedValue(mockDecisions);

      mockReq = {};
      await controller.getDecisions(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalled();
    });

    test('should handle database errors', async () => {
      prisma.decision.findMany.mockRejectedValue(new Error('DB Error'));

      mockReq = {};
      await controller.getDecisions(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getDecisionById', () => {
    test('should return decision by ID', async () => {
      const mockDecision = {
        id: 1,
        title: 'Test',
        assumptions: '[]',
      };

      prisma.decision.findUnique.mockResolvedValue(mockDecision);

      mockReq = { params: { id: '1' } };
      await controller.getDecisionById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    test('should return 404 when decision not found', async () => {
      prisma.decision.findUnique.mockResolvedValue(null);

      mockReq = { params: { id: '999' } };
      await controller.getDecisionById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    test('should return 400 for invalid ID', async () => {
      mockReq = { params: { id: 'invalid' } };
      await controller.getDecisionById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('addOutcome', () => {
    test('should add outcome to decision', async () => {
      const mockDecision = { id: 1, outcome: null };
      const mockOutcome = {
        id: 1,
        actualOutcome: 'Result',
        reflection: 'Notes',
        decision: { ...mockDecision, assumptions: '[]' },
      };

      prisma.decision.findUnique.mockResolvedValue(mockDecision);
      prisma.outcome.create.mockResolvedValue(mockOutcome);

      mockReq = {
        params: { id: '1' },
        body: { actualOutcome: 'Result', reflection: 'Notes' },
      };

      await controller.addOutcome(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    test('should return 400 when outcome already exists', async () => {
      prisma.decision.findUnique.mockResolvedValue({
        id: 1,
        outcome: { id: 1 },
      });

      mockReq = {
        params: { id: '1' },
        body: { actualOutcome: 'Result' },
      };

      await controller.addOutcome(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Outcome already exists for this decision',
      });
    });

    test('should return 400 when actualOutcome is missing', async () => {
      mockReq = {
        params: { id: '1' },
        body: {},
      };

      await controller.addOutcome(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('generateAnalysis', () => {
    test('should generate analysis for decision with outcome', async () => {
      const mockDecision = {
        id: 1,
        assumptions: '[]',
        outcome: { actualOutcome: 'Result' },
        analysis: null,
      };

      const mockAnalysisResult = {
        comparison: 'Test',
        invalidAssumptions: [],
        lessonsLearned: 'Test',
        improvements: 'Test',
      };

      prisma.decision.findUnique.mockResolvedValue(mockDecision);
      generateAnalysis.mockResolvedValue(mockAnalysisResult);
      prisma.analysis.create.mockResolvedValue({
        id: 1,
        result: JSON.stringify(mockAnalysisResult),
      });

      mockReq = { params: { id: '1' } };
      await controller.generateAnalysis(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    test('should return 400 when no outcome exists', async () => {
      prisma.decision.findUnique.mockResolvedValue({
        id: 1,
        outcome: null,
      });

      mockReq = { params: { id: '1' } };
      await controller.generateAnalysis(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Cannot analyze decision without an outcome',
      });
    });

    test('should return 400 when analysis already exists', async () => {
      prisma.decision.findUnique.mockResolvedValue({
        id: 1,
        outcome: { id: 1 },
        analysis: { id: 1 },
      });

      mockReq = { params: { id: '1' } };
      await controller.generateAnalysis(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });
});

