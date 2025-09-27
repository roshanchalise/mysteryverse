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

### Recommended: Vercel Frontend + Railway Backend

1. **Backend Deployment (Railway)**:
   - Deploy backend to Railway with PostgreSQL database
   - Environment variables: `JWT_SECRET`, `NODE_ENV=production`, `ADMIN_PASSWORD`

2. **Frontend Deployment (Vercel)**:
   - Deploy frontend to Vercel for optimal performance
   - Environment variable: `VITE_API_URL` (your Railway backend URL)

📖 **See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed step-by-step instructions**

### Alternative: Full Railway Deployment
You can also deploy both frontend and backend to Railway if preferred.

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
# Vercel deployment fix
