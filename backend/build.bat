@echo off
REM Build script for AI Decision Justification Tracker Backend (Windows)

echo Starting build process...

REM Install dependencies
echo Installing dependencies...
npm install

REM Generate Prisma client
echo Generating Prisma client...
npx prisma generate

echo Build process completed successfully!