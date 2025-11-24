# CMDB Reconciler - Full-Stack Application

A modern web-based data reconciliation application for comparing and matching datasets with database persistence, user authentication, and comprehensive audit logging.

## Project Structure

```
cmdb_reconciler/
├── server/           # Backend API (Node.js + Express + Prisma)
├── src/              # Frontend React application
├── public/           # Static assets
└── ...
```

## Features

- **User Authentication** - JWT-based authentication with role-based access control
- **Project Management** - Organize reconciliation jobs into projects
- **File Upload & Processing** - Support for CSV and Excel files
- **Field Mapping** - Visual interface for mapping source and target fields
- **Reconciliation Engine** - Exact and fuzzy matching strategies
- **Results Visualization** - Interactive results grid with expandable details
- **Database Persistence** - PostgreSQL database for all data
- **Audit Logging** - Complete audit trail for all operations
- **Export to Excel** - Generate reconciliation reports

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd server
npm install
```

### 2. Set Up Database

See [server/README.md](server/README.md) for detailed database setup instructions.

**Quick setup:**
```bash
# Create database
createdb reconciler_db

# Configure environment variables
cd server
cp .env.example .env
# Edit .env and set your DATABASE_URL and JWT_SECRET

# Run migrations
npm run prisma:migrate
```

### 3. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```
Server will run on `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
npm run dev
```
Frontend will run on `http://localhost:5173`

### 4. Create Your First User

Register a new account at `http://localhost:5173/register` or use the API:

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "name": "Admin User",
    "password": "password123"
  }'
```

## Documentation

- **Frontend:** See [architecture.md](architecture.md) for frontend architecture details
- **Backend API:** See [server/README.md](server/README.md) for API documentation
- **Database Schema:** See [server/prisma/schema.prisma](server/prisma/schema.prisma)

## Technology Stack

### Frontend
- React 19.2.0
- TypeScript 5.9.3
- Vite 7.2.2
- TailwindCSS 3.4.18
- Framer Motion (animations)

### Backend
- Node.js with Express
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Multer (file uploads)
- Winston (logging)

## Development Workflow

### Database Changes

When modifying the database schema:

```bash
cd server
# Edit prisma/schema.prisma
npm run prisma:migrate
npm run prisma:generate
```

### Running Tests

```bash
# Frontend tests
npm test

# Backend tests
cd server
npm test
```

## API Endpoints

All API endpoints are prefixed with `/api`:

- `/api/auth` - Authentication (register, login)
- `/api/projects` - Project management
- `/api/jobs` - Reconciliation jobs
- `/api/files` - File uploads and downloads
- `/api/mappings` - Field mappings
- `/api/results` - Reconciliation results
- `/api/normalization-rules` - Normalization rules

See [server/README.md](server/README.md) for detailed API documentation.

## Building for Production

### Backend
```bash
cd server
npm run build
npm start
```

### Frontend
```bash
npm run build
npm run preview
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/reconciler_db
JWT_SECRET=your-secret-key
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

See [server/.env.example](server/.env.example) for all options.

## Troubleshooting

**Database connection issues:**
- Verify PostgreSQL is running
- Check DATABASE_URL in server/.env
- Ensure database exists

**Port conflicts:**
- Backend default: 3001
- Frontend default: 5173
- Change PORT in .env files if needed

**Authentication issues:**
- Verify JWT_SECRET is set
- Check token in browser DevTools
- Ensure CORS_ORIGIN matches frontend URL

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For issues and questions:
- Check [architecture.md](architecture.md) for frontend architecture
- Check [server/README.md](server/README.md) for backend API details
- Review [server/prisma/schema.prisma](server/prisma/schema.prisma) for database schema
