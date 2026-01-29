# Crochet Community Platform

A comprehensive digital marketplace and community hub for crochet enthusiasts, featuring pattern sales, creator tutorials, gamification, and community competitions.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/n2s-projects-18211ae8/v0-crochet-ecommerce-site)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/0YodicXhD10)

## Overview

The Crochet Community Platform is a full-stack web application that enables users to:

- **Purchase affordable patterns** with step-by-step creator tutorials
- **Communicate directly** with pattern creators for support and testing
- **Earn coins and points** through daily activities and purchases
- **Participate in competitions** and showcase their work
- **Apply to become creators** and sell their own patterns
- **Access comprehensive admin tools** for platform management

## Architecture

### Frontend
- **Next.js 15** with React 19
- **TypeScript** for type safety
- **Tailwind CSS** with custom pink/white theme
- **Radix UI** components for accessibility
- **Responsive design** for mobile and desktop

### Backend
- **Express.js** with TypeScript
- **PostgreSQL** database with connection pooling
- **JWT authentication** with role-based access control
- **RESTful API** design
- **Database migrations** system

### Key Features
- Real-time messaging between users and creators
- Gamification with coins and points system
- Competition system with voting
- File upload and storage for patterns/videos
- Payment processing integration ready
- Comprehensive admin panel

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd crochet-community-platform
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up PostgreSQL database:**
   ```bash
   createdb crochet_community
   ```

4. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your database credentials
   ```

5. **Run database migrations:**
   ```bash
   npm run migrate:up
   ```

6. **Start development servers:**
   ```bash
   # Terminal 1: Start backend server
   npm run dev:backend
   
   # Terminal 2: Start frontend server
   npm run dev
   ```

7. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Health check: http://localhost:3001/health

## Development

### Available Scripts

**Frontend:**
- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

**Backend:**
- `npm run dev:backend` - Start Express server with hot reload
- `npm run build:backend` - Build TypeScript to JavaScript
- `npm run start:backend` - Start production backend server

**Database:**
- `npm run migrate:up` - Run pending migrations
- `npm run migrate:down` - Rollback last migration

### Project Structure

```
├── app/                    # Next.js app directory
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
└── styles/                # Global styles
```

## Database Schema

The platform uses PostgreSQL with the following main entities:

- **Users** - Account management with role-based access
- **Patterns** - Crochet patterns with files and tutorials
- **Purchases** - Transaction records and access control
- **Messages** - Direct communication system
- **Competitions** - Community contests and voting
- **Seller Applications** - Creator approval workflow
- **Daily Coins** - Gamification tracking

## API Documentation

### Health Check
- `GET /health` - Server status and information

### Core Endpoints (Coming in future tasks)
- `/api/auth/*` - Authentication and user management
- `/api/patterns/*` - Pattern marketplace and management
- `/api/messages/*` - Direct messaging system
- `/api/competitions/*` - Competition system
- `/api/admin/*` - Administrative functions

## Contributing

This project follows a spec-driven development approach. See the `.kiro/specs/crochet-community-platform/` directory for:

- `requirements.md` - Detailed feature requirements
- `design.md` - System architecture and design decisions
- `tasks.md` - Implementation roadmap and progress tracking

## Deployment

### Production Setup

1. **Build the application:**
   ```bash
   npm run build
   npm run build:backend
   ```

2. **Set up production database and environment variables**

3. **Run migrations:**
   ```bash
   npm run migrate:up
   ```

4. **Start production servers:**
   ```bash
   npm run start:backend  # Backend on port 3001
   npm run start         # Frontend on port 3000
   ```

### Vercel Deployment

The frontend is configured for Vercel deployment. The backend can be deployed separately to services like Railway, Heroku, or DigitalOcean.

## License

This project is private and proprietary.

---

**Continue building your app on [v0.dev](https://v0.dev/chat/projects/0YodicXhD10)**
