# Crochet Community Platform - Setup Guide

This guide will help you set up the Crochet Community Platform development environment.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **PostgreSQL 12+** - [Download here](https://www.postgresql.org/download/)
- **npm or yarn** - Comes with Node.js

## Quick Setup

### 1. Install Dependencies

```bash
npm install --legacy-peer-deps
```

*Note: We use `--legacy-peer-deps` due to React 19 compatibility with some UI components.*

### 2. Set Up PostgreSQL Database

Create a new PostgreSQL database:

```bash
# Using createdb command
createdb crochet_community

# Or using psql
psql -c "CREATE DATABASE crochet_community;"
```

### 3. Configure Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your database credentials:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/crochet_community
DB_HOST=localhost
DB_PORT=5432
DB_NAME=crochet_community
DB_USER=postgres
DB_PASSWORD=your_password
DB_SSL=false

# Server Configuration
PORT=3001
NODE_ENV=development
API_BASE_URL=http://localhost:3001

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Set Up Database Schema

Run the database migrations to create all necessary tables:

```bash
npm run setup:db
```

This will:
- Connect to your PostgreSQL database
- Run all migrations to create the schema
- Verify the setup is working correctly

### 5. Start Development Servers

Open two terminal windows:

**Terminal 1 - Backend Server:**
```bash
npm run dev:backend
```

**Terminal 2 - Frontend Server:**
```bash
npm run dev
```

### 6. Verify Setup

- **Backend API**: http://localhost:3001/health
- **Frontend**: http://localhost:3000
- **API Documentation**: http://localhost:3001/api

## Available Scripts

### Frontend
- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Backend
- `npm run dev:backend` - Start Express server with hot reload
- `npm run build:backend` - Build TypeScript to JavaScript
- `npm run start:backend` - Start production backend server
- `npm run test:server` - Test backend server functionality

### Database
- `npm run setup:db` - Complete database setup with migrations
- `npm run migrate:up` - Run pending migrations
- `npm run migrate:down` - Rollback last migration

## Project Structure

```
├── app/                    # Next.js app directory (frontend)
├── components/             # React components
├── context/               # React context providers
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
├── server/                # Express.js backend
│   ├── src/
│   │   ├── config/        # Database and app configuration
│   │   ├── database/      # Migrations and database utilities
│   │   ├── middleware/    # Express middleware
│   │   └── scripts/       # CLI scripts
│   └── README.md          # Backend-specific documentation
├── public/                # Static assets
├── styles/                # Global styles
├── .env.local             # Environment variables (create from .env.example)
└── SETUP.md              # This file
```

## Database Schema

The platform includes the following main tables:

- **users** - User accounts with role-based access (user/creator/admin)
- **seller_applications** - Applications to become a pattern creator
- **patterns** - Crochet patterns with files and tutorials
- **purchases** - Pattern purchase transactions
- **messages** - Direct messaging between users and creators
- **competitions** - Platform competitions and contests
- **competition_entries** - User submissions to competitions
- **daily_coins** - Daily coin claiming tracking

## Troubleshooting

### Database Connection Issues

1. **Check PostgreSQL is running:**
   ```bash
   # On macOS with Homebrew
   brew services start postgresql
   
   # On Linux
   sudo systemctl start postgresql
   ```

2. **Verify database exists:**
   ```bash
   psql -l | grep crochet_community
   ```

3. **Test connection:**
   ```bash
   psql -d crochet_community -c "SELECT NOW();"
   ```

### Port Conflicts

If ports 3000 or 3001 are in use:

1. **Change backend port** in `.env.local`:
   ```env
   PORT=3002
   NEXT_PUBLIC_API_URL=http://localhost:3002
   ```

2. **Change frontend port:**
   ```bash
   npm run dev -- -p 3001
   ```

### Build Issues

1. **Clear node_modules and reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install --legacy-peer-deps
   ```

2. **Clear Next.js cache:**
   ```bash
   rm -rf .next
   npm run build
   ```

## Next Steps

After setup is complete, you can:

1. **Explore the API** at http://localhost:3001/health
2. **View the frontend** at http://localhost:3000
3. **Check the database** using your preferred PostgreSQL client
4. **Start implementing features** following the task list in `.kiro/specs/crochet-community-platform/tasks.md`

## Development Workflow

1. **Backend changes**: Edit files in `server/src/` - nodemon will auto-reload
2. **Frontend changes**: Edit files in `app/`, `components/`, etc. - Next.js will hot-reload
3. **Database changes**: Create new migration files in `server/src/database/migrations/`
4. **Environment changes**: Update `.env.local` and restart servers

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the backend README at `server/README.md`
3. Check the project requirements at `.kiro/specs/crochet-community-platform/requirements.md`