# CMDB Reconciler - Setup Guide

Quick setup guide for getting the full-stack application running.

## Prerequisites Installation

### 1. Install Node.js (if not installed)
Download and install Node.js 18+ from https://nodejs.org/

Verify installation:
```bash
node --version  # Should be 18 or higher
npm --version
```

### 2. Install PostgreSQL (if not installed)

**Windows:**
Download from https://www.postgresql.org/download/windows/

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

Verify installation:
```bash
psql --version  # Should be 14 or higher
```

## Project Setup

### Step 1: Clone and Install Dependencies

```bash
# Navigate to project directory
cd cmdb_reconciler

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### Step 2: Database Setup

**Create Database:**
```bash
# Using createdb command
createdb reconciler_db

# OR using psql
psql -U postgres
CREATE DATABASE reconciler_db;
\q
```

**Configure Environment:**
```bash
cd server
# Create .env file from template
cp .env.example .env

# Edit .env file and update:
# - DATABASE_URL: Your PostgreSQL connection string
# - JWT_SECRET: A secure random string (generate one!)
```

**Example .env values:**
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/reconciler_db?schema=public"
JWT_SECRET="use-a-very-long-random-string-here-generate-with-openssl"
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

**Generate JWT Secret:**
```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

**Run Migrations:**
```bash
# Still in server/ directory
npm run prisma:migrate

# This will:
# ✓ Create all database tables
# ✓ Generate Prisma Client
# ✓ Set up relationships
```

### Step 3: Verify Database

```bash
# Open Prisma Studio to view database
npm run prisma:studio

# Opens at http://localhost:5555
# You should see all 8 tables:
# - User
# - Project  
# - ReconciliationJob
# - File
# - FieldMapping
# - ReconciliationResult
# - NormalizationRule
# - AuditLog
```

### Step 4: Start Development Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```
Expected output:
```
🚀 Server running on http://localhost:3001
📊 Environment: development
```

**Terminal 2 - Frontend:**
```bash
# From project root
npm run dev
```
Expected output:
```
VITE v7.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

### Step 5: Test the Application

**1. Open Browser:**
Navigate to http://localhost:5173

**2. Register a User:**
Click "Register" or use API:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "password123"
  }'
```

**3. Login:**
Use the credentials to login and get a token.

**4. Test Health Check:**
```bash
curl http://localhost:3001/health
```
Should return:
```json
{
  "status": "ok",
  "timestamp": "2025-11-22T..."
}
```

## Common Issues

### Database Connection Errors
**Error:** "Connection refused at localhost:5432"
```bash
# Check if PostgreSQL is running
# Windows:
services.msc  # Look for PostgreSQL service
# Mac:
brew services list
# Linux:
sudo systemctl status postgresql
```

**Error:** "Database does not exist"
```bash
# Create the database
createdb reconciler_db
```

**Error:** "password authentication failed"
```bash
# Update DATABASE_URL in server/.env with correct password
# Format: postgresql://username:password@localhost:5432/reconciler_db
```

### Port Already in Use
**Backend port 3001 in use:**
```bash
# Change PORT in server/.env
PORT=3002
```

**Frontend port 5173 in use:**
```bash
# Vite will automatically try next available port
# Or specify in vite.config.ts:
server: { port: 5174 }
```

### Migration Errors
**Error:** "Migration failed"
```bash
# Reset database (WARNING: Deletes all data!)
cd server
npx prisma migrate reset
# Then run migration again
npm run prisma:migrate
```

### Module Not Found Errors
```bash
# Clear node_modules and reinstall
# Frontend:
rm -rf node_modules package-lock.json
npm install

# Backend:
cd server
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. ✓ Backend running on http://localhost:3001
2. ✓ Frontend running on http://localhost:5173
3. ✓ Database connected and migrated
4. ✓ User registered and logged in

**Now you can:**
- Create a project
- Upload CSV/Excel files
- Map fields between source and target
- Run reconciliation
- View and export results

## Development Tips

**View Database:**
```bash
cd server
npm run prisma:studio
```

**Check Logs:**
```bash
# Backend logs are in server/ directory:
tail -f server/combined.log
tail -f server/error.log
```

**Reset Everything:**
```bash
# Database reset
cd server
npx prisma migrate reset
# Clear uploaded files
rm -rf uploads/*
# Restart servers
npm run dev
```

## Production Deployment
See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment instructions (coming soon).

## Getting Help
- Frontend docs: [architecture.md](../architecture.md)
- Backend API: [server/README.md](README.md)
- Database schema: [server/prisma/schema.prisma](prisma/schema.prisma)

**Common Commands:**
```bash
# Frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Backend
npm run dev          # Start dev server
npm run build        # Build TypeScript
npm start            # Run production build
npm run prisma:studio    # Open database GUI
npm run prisma:migrate   # Run migrations
```
