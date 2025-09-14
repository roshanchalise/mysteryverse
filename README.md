# Mystery Verse - Interactive Puzzle Game

A captivating web application featuring riddles, mathematical puzzles, and an interactive Mahjong-style tile matching game.

## 🎮 Features

- **Verse 1**: Mind-bending riddles
- **Verse 2**: Mathematical mysteries  
- **Verse 3**: Interactive Mahjong tile matching game (6×8 grid, 48 tiles)
- User authentication & progress tracking
- Responsive design with mystical theme
- Sound effects and background music

## 🚀 Deployment

### Backend Deployment (Railway)
1. Deploy backend to Railway
2. Set environment variables:
   - `DATABASE_URL` (PostgreSQL)
   - `JWT_SECRET`
   - `NODE_ENV=production`

### Frontend Deployment (Vercel)
1. Deploy frontend to Vercel
2. Set environment variable:
   - `VITE_API_URL` (your Railway backend URL)

## 🛠 Tech Stack

- **Frontend**: React, Vite, TailwindCSS, Axios
- **Backend**: Node.js, Express, Prisma
- **Database**: SQLite (dev) / PostgreSQL (production)
- **Authentication**: JWT

## 📝 Local Development

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend  
cd frontend
npm install
npm run dev
```
