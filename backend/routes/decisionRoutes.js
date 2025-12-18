const express = require('express');
const router = express.Router();
const decisionController = require('../controllers/decisionController');

// Create a new decision
router.post('/', decisionController.createDecision);

// Get all decisions
router.get('/', decisionController.getDecisions);

// Get a single decision by ID
router.get('/:id', decisionController.getDecisionById);

// Add outcome to a decision
router.post('/:id/outcome', decisionController.addOutcome);

// Generate AI analysis for a decision
router.get('/:id/analysis', decisionController.generateAnalysis);

module.exports = router;
