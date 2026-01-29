# Crochet Community Platform - Backend

This is the Express.js backend server for the Crochet Community Platform, built with TypeScript and PostgreSQL.

## Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up PostgreSQL database:**
   ```bash
   # Create database
   createdb crochet_community
   
   # Or using psql
   psql -c "CREATE DATABASE crochet_community;"
   ```

3. **Configure environment variables:**
   ```bash
   # Copy example environment file
   cp .env.example .env.local
   
   # Edit .env.local with your database credentials
   ```

4. **Run database migrations:**
   ```bash
   npm run migrate:up
   ```

5. **Start development server:**
   ```bash
   npm run dev:backend
   ```

## Available Scripts

- `npm run dev:backend` - Start development server with hot reload
- `npm run build:backend` - Build TypeScript to JavaScript
- `npm run start:backend` - Start production server
- `npm run migrate:up` - Run pending database migrations
- `npm run migrate:down` - Rollback last migration

## API Endpoints

### Health Check
- `GET /health` - Server health status

### API Info
- `GET /api` - API information and available endpoints

## Database Schema

The initial migration creates the following tables:

- **users** - User accounts with roles (user/creator/admin)
- **seller_applications** - Applications to become a pattern creator
- **patterns** - Crochet patterns with files and tutorials
- **purchases** - Pattern purchase transactions
- **messages** - Direct messaging between users and creators
- **competitions** - Platform competitions and contests
- **competition_entries** - User submissions to competitions
- **daily_coins** - Daily coin claiming tracking

## Architecture

- **Express.js** - Web framework
- **TypeScript** - Type safety
- **PostgreSQL** - Primary database with connection pooling
- **JWT** - Authentication tokens
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Custom middleware** - Error handling and request logging

## Development

The server uses nodemon for hot reloading during development. All TypeScript files are automatically compiled and the server restarts on changes.

## Production Deployment

1. Build the application:
   ```bash
   npm run build:backend
   ```

2. Set production environment variables

3. Run migrations:
   ```bash
   npm run migrate:up
   ```

4. Start the server:
   ```bash
   npm run start:backend
   ```