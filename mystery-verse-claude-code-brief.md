# 🎮 Mystery Verse - Claude Code Brief

## Project Overview
Fullstack web application for a puzzle-based game called "Mystery Verse" where players progress through verses by solving complex puzzles.

## Tech Stack
- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Node.js + Express
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT tokens

## Core Features

### Game Mechanics
- All verse-based gameplay
- Each verse contains one complex puzzle
- All verses are available for players
- 

### User System
- Registration/Login/Logout with JWT auth
- User profiles with progress tracking
- Password hashing and secure storage

### Game Interface
- Dashboard with progress visualization
- Dynamic puzzle pages (`/verse/:id`)
- verse Available/Completed status display
- Answer submission and validation

### Admin Panel
- Password-protected admin interface
- CRUD operations for verses and puzzles
- Puzzle answer management

## Project Structure
```
mystery-verse/
├── backend/
│   ├── server.js
│   ├── prisma/
│   ├── routes/
│   ├── controllers/
│   └── middleware/
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── pages/
│   │   ├── components/
│   │   └── styles/
│   └── package.json
└── package.json
```

## Key Pages
- Landing page with branding and auth
- Dashboard with progress overview
- Dynamic puzzle interface
- Admin management panel

## Database Schema
- **Users**: username, hashed password, current verse progress
- **Verses**: title, description, clues, letter boxes for answer, Available/Completed Status

## Implementation Priority
1. Authentication system setup
2. Database schema and migrations
3. Core game flow implementation
4. Frontend routing and components
5. Admin panel functionality
6. Seed data with example puzzles