/**
 * ACCEPTANCE TESTS - Problem Validation
 * Tests that the system meets business requirements and user stories
 */

const request = require('supertest');
const express = require('express');
const cors = require('cors');

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
const { generateAnalysis } = require('../../services/aiService');
const decisionRoutes = require('../../routes/decisionRoutes');

const createTestApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/decisions', decisionRoutes);
  return app;
};

describe('Acceptance Tests - User Stories & Requirements', () => {
  let app;
  let prisma;

  beforeAll(() => {
    app = createTestApp();
    prisma = new PrismaClient();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * User Story 1: As a user, I want to record a decision with its justification
   * so that I can track my reasoning process.
   */
  describe('US1: Record Decision with Justification', () => {
    test('AC1.1: User can create a decision with title, reasoning, and expected outcome', async () => {
      const decisionData = {
        title: 'Adopt React for Frontend',
        description: 'Choose React as the primary frontend framework',
        reasoning: 'React has a large community, good documentation, and fits our team skills',
        assumptions: [
          'Team has JavaScript experience',
          'Project requires interactive UI',
          'Long-term maintenance is important',
        ],
        expectedOutcome: 'Faster development, easier hiring, maintainable codebase',
      };

      prisma.decision.create.mockResolvedValue({
        id: 1,
        ...decisionData,
        assumptions: JSON.stringify(decisionData.assumptions),
        createdAt: new Date().toISOString(),
      });

      const response = await request(app)
        .post('/api/decisions')
        .send(decisionData)
        .expect(201);

      expect(response.body.title).toBe(decisionData.title);
      expect(response.body.reasoning).toBe(decisionData.reasoning);
      expect(response.body.id).toBeDefined();
    });

    test('AC1.2: User cannot create a decision without required fields', async () => {
      const incompleteData = {
        title: 'Incomplete Decision',
        // Missing reasoning and expectedOutcome
      };

      const response = await request(app)
        .post('/api/decisions')
        .send(incompleteData)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    test('AC1.3: User can include multiple assumptions', async () => {
      const decisionWithAssumptions = {
        title: 'Test Decision',
        reasoning: 'Test Reasoning',
        expectedOutcome: 'Test Outcome',
        assumptions: ['Assumption 1', 'Assumption 2', 'Assumption 3'],
      };

      prisma.decision.create.mockResolvedValue({
        id: 1,
        ...decisionWithAssumptions,
        assumptions: JSON.stringify(decisionWithAssumptions.assumptions),
      });

      const response = await request(app)
        .post('/api/decisions')
        .send(decisionWithAssumptions)
        .expect(201);

      expect(response.body).toBeDefined();
    });
  });

  /**
   * User Story 2: As a user, I want to view all my decisions
   * so that I can review my decision history.
   */
  describe('US2: View Decision History', () => {
    test('AC2.1: User can see a list of all decisions', async () => {
      const mockDecisions = [
        { id: 1, title: 'Decision 1', assumptions: '[]', createdAt: new Date() },
        { id: 2, title: 'Decision 2', assumptions: '[]', createdAt: new Date() },
        { id: 3, title: 'Decision 3', assumptions: '[]', createdAt: new Date() },
      ];

      prisma.decision.findMany.mockResolvedValue(mockDecisions);

      const response = await request(app).get('/api/decisions').expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(3);
    });

    test('AC2.2: Decisions are returned in chronological order (newest first)', async () => {
      const mockDecisions = [
        { id: 3, title: 'Newest', assumptions: '[]', createdAt: new Date('2024-03-01') },
        { id: 2, title: 'Middle', assumptions: '[]', createdAt: new Date('2024-02-01') },
        { id: 1, title: 'Oldest', assumptions: '[]', createdAt: new Date('2024-01-01') },
      ];

      prisma.decision.findMany.mockResolvedValue(mockDecisions);

      const response = await request(app).get('/api/decisions').expect(200);

      expect(response.body[0].title).toBe('Newest');
    });

    test('AC2.3: Empty list is returned when no decisions exist', async () => {
      prisma.decision.findMany.mockResolvedValue([]);

      const response = await request(app).get('/api/decisions').expect(200);

      expect(response.body).toEqual([]);
    });
  });

  /**
   * User Story 3: As a user, I want to view details of a specific decision
   * so that I can understand my past reasoning.
   */
  describe('US3: View Decision Details', () => {
    test('AC3.1: User can view full details of a decision', async () => {
      const mockDecision = {
        id: 1,
        title: 'Technology Choice',
        description: 'Choosing backend technology',
        reasoning: 'Node.js for JavaScript consistency',
        assumptions: '["Team knows JS", "Need real-time features"]',
        expectedOutcome: 'Faster development',
        createdAt: new Date(),
        outcome: null,
        analysis: null,
      };

      prisma.decision.findUnique.mockResolvedValue(mockDecision);

      const response = await request(app).get('/api/decisions/1').expect(200);

      expect(response.body.title).toBe('Technology Choice');
      expect(response.body.reasoning).toBe('Node.js for JavaScript consistency');
    });

    test('AC3.2: User receives error for non-existent decision', async () => {
      prisma.decision.findUnique.mockResolvedValue(null);

      const response = await request(app).get('/api/decisions/999').expect(404);

      expect(response.body.error).toBe('Decision not found');
    });
  });

  /**
   * User Story 4: As a user, I want to record the actual outcome of a decision
   * so that I can compare it with my expectations.
   */
  describe('US4: Record Decision Outcome', () => {
    test('AC4.1: User can add outcome after decision is made', async () => {
      const mockDecision = { id: 1, outcome: null };
      const outcomeData = {
        actualOutcome: 'Development was 20% faster than expected',
        reflection: 'The team adapted quickly to React',
      };

      prisma.decision.findUnique.mockResolvedValue(mockDecision);
      prisma.outcome.create.mockResolvedValue({
        id: 1,
        ...outcomeData,
        decisionId: 1,
        decision: { assumptions: '[]' },
      });

      const response = await request(app)
        .post('/api/decisions/1/outcome')
        .send(outcomeData)
        .expect(201);

      expect(response.body.actualOutcome).toBe(outcomeData.actualOutcome);
    });

    test('AC4.2: User cannot add multiple outcomes to same decision', async () => {
      prisma.decision.findUnique.mockResolvedValue({
        id: 1,
        outcome: { id: 1, actualOutcome: 'Existing outcome' },
      });

      const response = await request(app)
        .post('/api/decisions/1/outcome')
        .send({ actualOutcome: 'New outcome' })
        .expect(400);

      expect(response.body.error).toBe('Outcome already exists for this decision');
    });

    test('AC4.3: Outcome requires actual outcome description', async () => {
      const response = await request(app)
        .post('/api/decisions/1/outcome')
        .send({ reflection: 'Only reflection, no outcome' })
        .expect(400);

      expect(response.body.error).toBe('Actual outcome is required');
    });
  });

  /**
   * User Story 5: As a user, I want AI to analyze my decision
   * so that I can learn from my assumptions and improve future decisions.
   */
  describe('US5: AI Analysis of Decisions', () => {
    test('AC5.1: User can request AI analysis after recording outcome', async () => {
      const mockDecision = {
        id: 1,
        title: 'Test Decision',
        reasoning: 'Test Reasoning',
        assumptions: '["Assumption 1"]',
        expectedOutcome: 'Expected Result',
        outcome: {
          actualOutcome: 'Actual Result',
          reflection: 'It worked well',
        },
        analysis: null,
      };

      const mockAnalysisResult = {
        comparison: 'Expected and actual outcomes were closely aligned',
        invalidAssumptions: ['Assumption 1 was partially incorrect'],
        lessonsLearned: 'Better market research would have helped',
        improvements: 'Consider more data sources in future decisions',
      };

      prisma.decision.findUnique.mockResolvedValue(mockDecision);
      generateAnalysis.mockResolvedValue(mockAnalysisResult);
      prisma.analysis.create.mockResolvedValue({
        id: 1,
        result: JSON.stringify(mockAnalysisResult),
        decisionId: 1,
      });

      const response = await request(app).get('/api/decisions/1/analysis').expect(201);

      expect(response.body.result).toBeDefined();
      expect(response.body.result.comparison).toBe(mockAnalysisResult.comparison);
    });

    test('AC5.2: Analysis cannot be generated without outcome', async () => {
      prisma.decision.findUnique.mockResolvedValue({
        id: 1,
        outcome: null,
        analysis: null,
      });

      const response = await request(app).get('/api/decisions/1/analysis').expect(400);

      expect(response.body.error).toBe('Cannot analyze decision without an outcome');
    });

    test('AC5.3: Analysis identifies invalid assumptions', async () => {
      const mockDecision = {
        id: 1,
        assumptions: '["Market will grow 50%", "No competition"]',
        outcome: { actualOutcome: 'Market grew 10%, faced competition' },
        analysis: null,
      };

      const mockAnalysis = {
        comparison: 'Outcome differed significantly',
        invalidAssumptions: ['Market will grow 50%', 'No competition'],
        lessonsLearned: 'Market predictions were overly optimistic',
        improvements: 'Use conservative estimates',
      };

      prisma.decision.findUnique.mockResolvedValue(mockDecision);
      generateAnalysis.mockResolvedValue(mockAnalysis);
      prisma.analysis.create.mockResolvedValue({
        id: 1,
        result: JSON.stringify(mockAnalysis),
      });

      const response = await request(app).get('/api/decisions/1/analysis').expect(201);

      expect(response.body.result.invalidAssumptions).toContain('Market will grow 50%');
      expect(response.body.result.invalidAssumptions).toContain('No competition');
    });

    test('AC5.4: User cannot regenerate analysis', async () => {
      prisma.decision.findUnique.mockResolvedValue({
        id: 1,
        outcome: { id: 1 },
        analysis: { id: 1, result: '{}' },
      });

      const response = await request(app).get('/api/decisions/1/analysis').expect(400);

      expect(response.body.error).toBe('Analysis already exists for this decision');
    });
  });

  /**
   * User Story 6: Complete Decision Lifecycle
   * End-to-end flow validation
   */
  describe('US6: Complete Decision Lifecycle', () => {
    test('AC6.1: Full lifecycle - Create → View → Outcome → Analysis', async () => {
      // Step 1: Create Decision
      const decisionData = {
        title: 'Hire Remote Team',
        reasoning: 'Access to global talent pool',
        expectedOutcome: 'Higher quality candidates',
        assumptions: ['Remote work is productive', 'Communication tools are sufficient'],
      };

      prisma.decision.create.mockResolvedValue({
        id: 1,
        ...decisionData,
        assumptions: JSON.stringify(decisionData.assumptions),
      });

      const createResponse = await request(app)
        .post('/api/decisions')
        .send(decisionData)
        .expect(201);

      const decisionId = createResponse.body.id;

      // Step 2: View Decision
      prisma.decision.findUnique.mockResolvedValue({
        id: decisionId,
        ...decisionData,
        assumptions: JSON.stringify(decisionData.assumptions),
        outcome: null,
        analysis: null,
      });

      const viewResponse = await request(app)
        .get(`/api/decisions/${decisionId}`)
        .expect(200);

      expect(viewResponse.body.title).toBe(decisionData.title);

      // Step 3: Add Outcome
      const outcomeData = {
        actualOutcome: 'Hired excellent remote team, productivity exceeded expectations',
        reflection: 'Remote work worked better than anticipated',
      };

      prisma.decision.findUnique.mockResolvedValue({
        id: decisionId,
        outcome: null,
      });
      prisma.outcome.create.mockResolvedValue({
        id: 1,
        ...outcomeData,
        decision: { assumptions: JSON.stringify(decisionData.assumptions) },
      });

      const outcomeResponse = await request(app)
        .post(`/api/decisions/${decisionId}/outcome`)
        .send(outcomeData)
        .expect(201);

      expect(outcomeResponse.body.actualOutcome).toBe(outcomeData.actualOutcome);

      // Step 4: Generate Analysis
      prisma.decision.findUnique.mockResolvedValue({
        id: decisionId,
        ...decisionData,
        assumptions: JSON.stringify(decisionData.assumptions),
        outcome: outcomeData,
        analysis: null,
      });

      const analysisResult = {
        comparison: 'Outcome exceeded expectations',
        invalidAssumptions: [],
        lessonsLearned: 'Remote work can be highly effective',
        improvements: 'Continue with remote-first approach',
      };

      generateAnalysis.mockResolvedValue(analysisResult);
      prisma.analysis.create.mockResolvedValue({
        id: 1,
        result: JSON.stringify(analysisResult),
      });

      const analysisResponse = await request(app)
        .get(`/api/decisions/${decisionId}/analysis`)
        .expect(201);

      expect(analysisResponse.body.result.lessonsLearned).toBeDefined();
    });
  });
});

