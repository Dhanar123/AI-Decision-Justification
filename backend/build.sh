#!/bin/bash

# Build script for AI Decision Justification Tracker Backend

echo "Starting build process..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

echo "Build process completed successfully!"