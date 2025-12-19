# Deployment Guide for AI Decision Justification Tracker

This guide provides instructions for deploying both the frontend and backend of the AI Decision Justification Tracker application.

## Prerequisites

1. Node.js (version 16 or higher)
2. PostgreSQL database
3. OpenRouter API key (for AI services)
4. Git

## Backend Deployment

### Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# OpenRouter API Key for AI services
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Database connection string (PostgreSQL)
DATABASE_URL=postgresql://username:password@host:port/database_name

# Port for the server (defaults to 5001 if not set)
PORT=5001

# Node environment
NODE_ENV=production
```

### Deployment Options

#### Option 1: Vercel (Recommended)

1. Create a new project in Vercel
2. Connect your GitHub repository
3. Set the root directory to `backend`
4. Add the environment variables in the Vercel dashboard
5. Deploy

#### Option 2: Heroku

1. Install the Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Set environment variables:
   ```bash
   heroku config:set OPENROUTER_API_KEY=your_api_key
   heroku config:set DATABASE_URL=your_database_url
   heroku config:set NODE_ENV=production
   ```
5. Deploy: `git push heroku main`

#### Option 3: Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the root directory to `backend`
4. Set build command to `npm install`
5. Set start command to `npm run start:prod`
6. Add environment variables in the dashboard

## Frontend Deployment

### Environment Variables

Create a `.env` file in the `frontend` directory with the following variables:

```env
# API URL for the backend service
VITE_API_URL=https://your-backend-url.vercel.app/api

# Node environment
NODE_ENV=production
```

### Deployment Options

#### Option 1: Vercel

1. Create a new project in Vercel
2. Connect your GitHub repository
3. Set the root directory to `frontend`
4. Add the `VITE_API_URL` environment variable in the Vercel dashboard
5. Deploy

#### Option 2: Netlify

1. Install Netlify CLI: `npm install -g netlify-cli`
2. Login: `netlify login`
3. Build: `npm run build`
4. Deploy: `netlify deploy --prod`

## Database Setup

The application uses Prisma with PostgreSQL. After setting up your database:

1. Update the `DATABASE_URL` in your environment variables
2. Run migrations: `npx prisma migrate deploy`
3. Generate Prisma client: `npx prisma generate`

## Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**: Ensure your `.env` file is in the correct directory and variables are properly formatted.

2. **Database Connection Errors**: Verify your `DATABASE_URL` is correct and the database is accessible.

3. **CORS Issues**: The backend is configured to allow all origins, but you may need to adjust this for production.

4. **Port Conflicts**: Change the `PORT` environment variable if the default port is in use.

### Logs and Monitoring

Check your deployment platform's logs for error messages:
- Vercel: Dashboard > Your App > Logs
- Heroku: `heroku logs --tail`
- Render: Dashboard > Your Service > Logs

## Support

For deployment issues, please check:
1. All environment variables are set correctly
2. Database connection is working
3. Required dependencies are installed
4. Platform-specific deployment requirements