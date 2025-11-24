# CMDB Reconciler Server

Backend API server for the CMDB Reconciler application.

## Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Update the following in `.env`:
- `DATABASE_URL`: Your PostgreSQL connection string
- `JWT_SECRET`: A secure random string for JWT signing
- `PORT`: Server port (default: 3001)
- `CORS_ORIGIN`: Frontend URL (default: http://localhost:5173)

### 3. Set Up Database

Make sure PostgreSQL is running, then:

```bash
# Create the database (if not exists)
createdb reconciler_db

# Or using psql
psql -U postgres -c "CREATE DATABASE reconciler_db;"
```

### 4. Run Database Migrations

```bash
npm run prisma:migrate
```

This will:
- Create all database tables
- Generate Prisma Client
- Apply the schema to your database

### 5. (Optional) Open Prisma Studio

To view and manage your database visually:

```bash
npm run prisma:studio
```

## Running the Server

### Development Mode

```bash
npm run dev
```

The server will start on `http://localhost:3001` with hot-reload enabled.

### Production Mode

```bash
# Build
npm run build

# Start
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user profile (protected)

### Projects
- `GET /api/projects` - List user's projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Jobs
- `GET /api/jobs` - List jobs (query: projectId, status)
- `POST /api/jobs` - Create new job
- `GET /api/jobs/:id` - Get job details
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Files
- `POST /api/files/upload` - Upload file (multipart/form-data)
- `GET /api/files/:id` - Get file metadata
- `GET /api/files/:id/download` - Download file
- `DELETE /api/files/:id` - Delete file

### Field Mappings
- `GET /api/mappings` - List mappings (query: projectId, jobId, isTemplate)
- `POST /api/mappings` - Create mapping
- `GET /api/mappings/:id` - Get mapping details
- `PUT /api/mappings/:id` - Update mapping
- `DELETE /api/mappings/:id` - Delete mapping

### Results
- `GET /api/results/jobs/:jobId/results` - Get paginated results (query: type, page, limit)
- `POST /api/results/jobs/:jobId/results` - Store results (bulk)
- `GET /api/results/jobs/:jobId/results/export` - Export all results

### Normalization Rules
- `GET /api/normalization-rules` - List rules (query: projectId)
- `POST /api/normalization-rules` - Create rule
- `GET /api/normalization-rules/:id` - Get rule details
- `PUT /api/normalization-rules/:id` - Update rule
- `DELETE /api/normalization-rules/:id` - Delete rule

## Authentication

All endpoints except `/api/auth/register` and `/api/auth/login` require authentication.

Include the JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## File Uploads

Files are uploaded to the `uploads/` directory by default. Configure `UPLOAD_DIR` in `.env` to change the location.

Supported formats: CSV, Excel (.xlsx, .xls)

## Database Schema

The database consists of 8 main tables:
- `users` - User authentication and profiles
- `projects` - Reconciliation projects
- `reconciliation_jobs` - Individual reconciliation runs
- `files` - Uploaded file metadata
- `field_mappings` - Field mapping configurations
- `reconciliation_results` - Detailed results
- `normalization_rules` - Normalization configurations
- `audit_logs` - Audit trail

See `prisma/schema.prisma` for detailed schema definition.

## Audit Logging

All create, update, and delete operations are automatically logged in the `audit_logs` table with:
- User ID
- Action type
- Entity type and ID
- Changes (before/after)
- IP address and user agent
- Timestamp

## Error Handling

API responses follow this format:

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message",
  "errors": [ ... ] // Optional validation errors
}
```

HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Development

### Database Migrations

```bash
# Create a new migration
npm run prisma:migrate

# Deploy migrations to production
npm run prisma:deploy

# Generate Prisma Client after schema changes
npm run prisma:generate
```

### Logs

Logs are written to:
- Console (colored output)
- `combined.log` (all logs)
- `error.log` (errors only)

## Troubleshooting

**Database connection errors:**
- Verify PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Ensure database exists

**JWT errors:**
- Verify `JWT_SECRET` is set in `.env`
- Check token expiration settings

**File upload errors:**
- Check `UPLOAD_DIR` permissions
- Verify `MAX_FILE_SIZE` setting

## License

MIT
