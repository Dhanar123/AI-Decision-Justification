/**
 * INTEGRATION TESTS - Backend APIs
 * Tests API endpoints with real HTTP requests
 */

const request = require('supertest');
const express = require('express');
const cors = require('cors');

// Mock Prisma Client
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

const { PrismaClient } = require('@prisma/client');
const { generateAnalysis } = require('../../services/aiService');
const decisionRoutes = require('../../routes/decisionRoutes');

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/decisions', decisionRoutes);
  
  // Error handler
  app.use((err, req, res, next) => {
    res.status(500).json({ error: err.message });
  });
  
  return app;
};

describe('API Integration Tests', () => {
  let app;
  let prisma;

  beforeAll(() => {
    app = createTestApp();
    prisma = new PrismaClient();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/decisions', () => {
    test('should create a new decision', async () => {
      const newDecision = {
        title: 'Integration Test Decision',
        description: 'Test Description',
        reasoning: 'Test Reasoning',
        assumptions: ['Assumption 1', 'Assumption 2'],
        expectedOutcome: 'Expected Result',
      };

      const createdDecision = {
        id: 1,
        ...newDecision,
        assumptions: JSON.stringify(newDecision.assumptions),
        createdAt: new Date().toISOString(),
      };

      prisma.decision.create.mockResolvedValue(createdDecision);

      const response = await request(app)
        .post('/api/decisions')
        .send(newDecision)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.id).toBe(1);
      expect(response.body.title).toBe(newDecision.title);
    });

    test('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/decisions')
        .send({ title: 'Only Title' })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    test('should handle empty request body', async () => {
      const response = await request(app)
        .post('/api/decisions')
        .send({})
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/decisions', () => {
    test('should return all decisions', async () => {
      const mockDecisions = [
        { id: 1, title: 'Decision 1', assumptions: '[]', outcome: null, analysis: null },
        { id: 2, title: 'Decision 2', assumptions: '["test"]', outcome: null, analysis: null },
      ];

      prisma.decision.findMany.mockResolvedValue(mockDecisions);

      const response = await request(app)
        .get('/api/decisions')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });

    test('should return empty array when no decisions exist', async () => {
      prisma.decision.findMany.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/decisions')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /api/decisions/:id', () => {
    test('should return decision by ID', async () => {
      const mockDecision = {
        id: 1,
        title: 'Test Decision',
        description: 'Test',
        reasoning: 'Test',
        assumptions: '[]',
        expectedOutcome: 'Test',
        outcome: null,
        analysis: null,
      };

      prisma.decision.findUnique.mockResolvedValue(mockDecision);

      const response = await request(app)
        .get('/api/decisions/1')
        .expect(200);

      expect(response.body.id).toBe(1);
      expect(response.body.title).toBe('Test Decision');
    });

    test('should return 404 for non-existent decision', async () => {
      prisma.decision.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/decisions/999')
        .expect(404);

      expect(response.body.error).toBe('Decision not found');
    });

    test('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .get('/api/decisions/invalid')
        .expect(400);

      expect(response.body.error).toBe('Invalid decision ID');
    });
  });

  describe('POST /api/decisions/:id/outcome', () => {
    test('should add outcome to decision', async () => {
      const mockDecision = { id: 1, outcome: null };
      const mockOutcome = {
        id: 1,
        actualOutcome: 'Actual Result',
        reflection: 'Reflection Notes',
        decisionId: 1,
        decision: { id: 1, assumptions: '[]' },
      };

      prisma.decision.findUnique.mockResolvedValue(mockDecision);
      prisma.outcome.create.mockResolvedValue(mockOutcome);

      const response = await request(app)
        .post('/api/decisions/1/outcome')
        .send({
          actualOutcome: 'Actual Result',
          reflection: 'Reflection Notes',
        })
        .expect(201);

      expect(response.body.actualOutcome).toBe('Actual Result');
    });

    test('should return 400 when outcome already exists', async () => {
      prisma.decision.findUnique.mockResolvedValue({
        id: 1,
        outcome: { id: 1, actualOutcome: 'Existing' },
      });

      const response = await request(app)
        .post('/api/decisions/1/outcome')
        .send({ actualOutcome: 'New Result' })
        .expect(400);

      expect(response.body.error).toBe('Outcome already exists for this decision');
    });

    test('should return 400 when actualOutcome is missing', async () => {
      const response = await request(app)
        .post('/api/decisions/1/outcome')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('Actual outcome is required');
    });
  });

  describe('GET /api/decisions/:id/analysis', () => {
    test('should generate analysis for decision with outcome', async () => {
      const mockDecision = {
        id: 1,
        title: 'Test',
        reasoning: 'Test',
        assumptions: '[]',
        expectedOutcome: 'Test',
        outcome: { actualOutcome: 'Result', reflection: 'Notes' },
        analysis: null,
      };

      const mockAnalysisResult = {
        comparison: 'Test comparison',
        invalidAssumptions: ['Invalid 1'],
        lessonsLearned: 'Test lessons',
        improvements: 'Test improvements',
      };

      prisma.decision.findUnique.mockResolvedValue(mockDecision);
      generateAnalysis.mockResolvedValue(mockAnalysisResult);
      prisma.analysis.create.mockResolvedValue({
        id: 1,
        result: JSON.stringify(mockAnalysisResult),
        decisionId: 1,
      });

      const response = await request(app)
        .get('/api/decisions/1/analysis')
        .expect(201);

      expect(response.body.result).toBeDefined();
    });

    test('should return 400 when no outcome exists', async () => {
      prisma.decision.findUnique.mockResolvedValue({
        id: 1,
        outcome: null,
        analysis: null,
      });

      const response = await request(app)
        .get('/api/decisions/1/analysis')
        .expect(400);

      expect(response.body.error).toBe('Cannot analyze decision without an outcome');
    });

    test('should return 400 when analysis already exists', async () => {
      prisma.decision.findUnique.mockResolvedValue({
        id: 1,
        outcome: { id: 1 },
        analysis: { id: 1 },
      });

      const response = await request(app)
        .get('/api/decisions/1/analysis')
        .expect(400);

      expect(response.body.error).toBe('Analysis already exists for this decision');
    });
  });
});

