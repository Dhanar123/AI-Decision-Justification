require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const decisionRoutes = require('./routes/decisionRoutes');

const app = express();
const port = process.env.PORT || 5001;

// Simplified CORS configuration for development
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Initialize Prisma Client
const prisma = new PrismaClient();

// API Routes
app.use('/api/decisions', decisionRoutes);

// Root route with API documentation
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to AI Decision Justification Tracker API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    api_docs: {
      decisions: {
        create: {
          method: 'POST',
          path: '/api/decisions',
          body: {
            title: 'string',
            description: 'string',
            reasoning: 'string',
            assumptions: 'string[]',
            expectedOutcome: 'string'
          }
        },
        list: { method: 'GET', path: '/api/decisions' },
        get: { method: 'GET', path: '/api/decisions/:id' },
        addOutcome: {
          method: 'POST',
          path: '/api/decisions/:id/outcome',
          body: {
            actualOutcome: 'string',
            reflection: 'string'
          }
        },
        getAnalysis: { method: 'GET', path: '/api/decisions/:id/analysis' }
      },
      health_check: '/api/health'
    }
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server - ONLY ONCE
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API Documentation: http://localhost:${port}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  server.close(() => process.exit(1));
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});