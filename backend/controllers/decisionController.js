const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { generateAnalysis } = require('../services/aiService');

// Create a new decision
exports.createDecision = async (req, res) => {
  try {
    console.log('Received request to create decision:', req.body);
    const { title, description, reasoning, assumptions, expectedOutcome } = req.body;
    
    if (!title || !reasoning || !expectedOutcome) {
      console.error('Validation failed: Missing required fields');
      return res.status(400).json({ error: 'Title, reasoning, and expected outcome are required' });
    }

    // Validate assumptions is a valid JSON array
    let parsedAssumptions = [];
    try {
      parsedAssumptions = Array.isArray(assumptions) ? assumptions : JSON.parse(assumptions || '[]');
      if (!Array.isArray(parsedAssumptions)) {
        throw new Error('Assumptions must be an array');
      }
    } catch (error) {
      console.error('Assumptions parsing error:', error.message);
      return res.status(400).json({ error: 'Invalid assumptions format. Must be a JSON array.' });
    }

    console.log('Creating decision with parsed assumptions:', parsedAssumptions);
    
    const decision = await prisma.decision.create({
      data: {
        title,
        description: description || '',
        reasoning,
        assumptions: JSON.stringify(parsedAssumptions),
        expectedOutcome,
      },
    });

    console.log('Decision created successfully:', decision);
    res.status(201).json(decision);
  } catch (error) {
    console.error('Error creating decision:', error);
    res.status(500).json({ error: 'Failed to create decision', details: error.message });
  }
};

// Get all decisions with their outcomes and analyses
exports.getDecisions = async (req, res) => {
  try {
    console.log('Fetching all decisions');
    const decisions = await prisma.decision.findMany({
      include: {
        outcome: true,
        analysis: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Parse assumptions from JSON string to array for the frontend
    const decisionsWithParsedAssumptions = decisions.map(decision => ({
      ...decision,
      assumptions: JSON.parse(decision.assumptions || '[]'),
    }));

    console.log(`Found ${decisionsWithParsedAssumptions.length} decisions`);
    res.status(200).json(decisionsWithParsedAssumptions);
  } catch (error) {
    console.error('Error fetching decisions:', error);
    res.status(500).json({ error: 'Failed to fetch decisions', details: error.message });
  }
};

// Get a single decision by ID
exports.getDecisionById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    console.log(`Fetching decision with ID: ${id}`);
    
    if (isNaN(id)) {
      console.error('Invalid decision ID provided:', req.params.id);
      return res.status(400).json({ error: 'Invalid decision ID' });
    }
    
    const decision = await prisma.decision.findUnique({
      where: { id },
      include: {
        outcome: true,
        analysis: true
      },
    });

    if (!decision) {
      console.error(`Decision with ID ${id} not found`);
      return res.status(404).json({ error: 'Decision not found' });
    }

    // Parse assumptions from JSON string to array for the frontend
    const decisionWithParsedAssumptions = {
      ...decision,
      assumptions: JSON.parse(decision.assumptions || '[]'),
    };

    console.log('Decision found:', decisionWithParsedAssumptions);
    res.status(200).json(decisionWithParsedAssumptions);
  } catch (error) {
    console.error('Error fetching decision:', error);
    res.status(500).json({ error: 'Failed to fetch decision', details: error.message });
  }
};

// Add outcome to a decision
exports.addOutcome = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { actualOutcome, reflection } = req.body;
    
    console.log(`Adding outcome to decision ${id}:`, req.body);

    if (isNaN(id)) {
      console.error('Invalid decision ID provided:', req.params.id);
      return res.status(400).json({ error: 'Invalid decision ID' });
    }

    if (!actualOutcome) {
      console.error('Validation failed: Actual outcome is required');
      return res.status(400).json({ error: 'Actual outcome is required' });
    }

    // Check if decision exists and doesn't already have an outcome
    const decision = await prisma.decision.findUnique({
      where: { id },
      include: { outcome: true }
    });

    if (!decision) {
      console.error(`Decision with ID ${id} not found`);
      return res.status(404).json({ error: 'Decision not found' });
    }

    if (decision.outcome) {
      console.error(`Outcome already exists for decision ${id}`);
      return res.status(400).json({ error: 'Outcome already exists for this decision' });
    }

    const outcome = await prisma.outcome.create({
      data: {
        actualOutcome,
        reflection: reflection || '',
        decisionId: id
      },
      include: {
        decision: true
      }
    });

    // Parse assumptions from JSON string to array for the frontend
    const outcomeWithParsedAssumptions = {
      ...outcome,
      decision: {
        ...outcome.decision,
        assumptions: JSON.parse(outcome.decision.assumptions || '[]')
      }
    };

    console.log('Outcome created successfully:', outcomeWithParsedAssumptions);
    res.status(201).json(outcomeWithParsedAssumptions);
  } catch (error) {
    console.error('Error adding outcome:', error);
    res.status(500).json({ error: 'Failed to add outcome', details: error.message });
  }
};

// Generate AI analysis for a decision
exports.generateAnalysis = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    console.log(`Generating analysis for decision ${id}`);
    
    if (isNaN(id)) {
      console.error('Invalid decision ID provided:', req.params.id);
      return res.status(400).json({ error: 'Invalid decision ID' });
    }

    // Check if decision exists and has an outcome
    const decision = await prisma.decision.findUnique({
      where: { id },
      include: { 
        outcome: true,
        analysis: true
      }
    });

    if (!decision) {
      console.error(`Decision with ID ${id} not found`);
      return res.status(404).json({ error: 'Decision not found' });
    }

    if (!decision.outcome) {
      console.error(`Cannot analyze decision ${id} without an outcome`);
      return res.status(400).json({ error: 'Cannot analyze decision without an outcome' });
    }

    if (decision.analysis) {
      console.error(`Analysis already exists for decision ${id}`);
      return res.status(400).json({ error: 'Analysis already exists for this decision' });
    }

    // Parse assumptions for the AI
    const decisionWithParsedAssumptions = {
      ...decision,
      assumptions: JSON.parse(decision.assumptions || '[]')
    };

    console.log('Generating AI analysis for decision:', decisionWithParsedAssumptions);
    // Generate AI analysis
    const analysisResult = await generateAnalysis(decisionWithParsedAssumptions);

    // Save analysis to database
    const analysis = await prisma.analysis.create({
      data: {
        result: JSON.stringify(analysisResult),
        decisionId: id
      }
    });

    // Parse assumptions from JSON string to array for the frontend
    const decisionWithParsedAssumptions = {
      ...decision,
      assumptions: JSON.parse(decision.assumptions || '[]'),
    };

    // Include the updated decision with parsed assumptions in the response
    const analysisWithDecision = {
      ...analysis,
      decision: decisionWithParsedAssumptions,
      result: analysisResult // Send parsed result to frontend
    };

    console.log('Analysis generated successfully:', analysisWithDecision);
    res.status(201).json(analysisWithDecision);
  } catch (error) {
    console.error('Error generating analysis:', error);
    res.status(500).json({ 
      error: 'Failed to generate analysis',
      details: error.message 
    });
  }
};