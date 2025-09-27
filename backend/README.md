# Mystery Verse Backend API

Node.js/Express backend for the Mystery Verse puzzle game.

## Features

- **Authentication**: JWT-based user authentication
- **Game API**: Verses, puzzles, and progress tracking
- **Admin Panel**: User management and content administration
- **Data Backup**: Automated player data backup system
- **Database**: Prisma ORM with SQLite (dev) / PostgreSQL (prod)

## Quick Start

```bash
# Install dependencies
npm install

# Setup database
npm run db:generate
npm run db:push
npm run db:seed

# Start development server
npm run dev
```

## Environment Variables

```env
DATABASE_URL="your-database-url"
JWT_SECRET="your-jwt-secret"
NODE_ENV="production"
ADMIN_PASSWORD="your-admin-password"
PORT=3333
```

## Deployment

Deploy to Railway with PostgreSQL database. See `railway.toml` and `railway-env-setup.md` for configuration.

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/game/verses` - Get available verses
- `GET /api/game/progress` - Get user progress
- `POST /api/admin/login` - Admin authentication

## Tech Stack

- Node.js + Express
- Prisma ORM
- JWT Authentication
- SQLite/PostgreSQL