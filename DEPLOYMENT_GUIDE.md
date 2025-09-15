# Mystery Verse Deployment Guide - Railway Only

## 🚀 Pre-Deployment Checklist

- [ ] Backend running locally on port 3333
- [ ] Frontend running locally on port 3002
- [ ] Database migrations applied (`npx prisma db push`)
- [ ] Test user registration and login working
- [ ] All game features tested locally

## Step 1: Push Code to GitHub

1. **Initialize Git Repository** (if not already done)
   ```bash
   cd /Users/roshanchalise/Downloads/mystery\ verse/mystery-verse
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create GitHub Repository**
   - Go to https://github.com
   - Click "New repository"
   - Name: `mystery-verse`
   - Set to Public or Private
   - Don't initialize with README (you already have files)

3. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/mystery-verse.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Deploy Backend to Railway

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub for easier deployment

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `mystery-verse` repository

3. **Configure Backend Service**
   - Railway will detect multiple services
   - Create a service for the backend:
     - Root Directory: `/backend`
     - Name: `mystery-verse-backend`

4. **Add PostgreSQL Database**
   - In your project dashboard, click "+ New"
   - Select "Database" → "Add PostgreSQL"
   - Railway automatically connects it to your backend service

5. **Configure Backend Environment Variables**
   - Go to backend service → "Variables" tab
   - Add these variables:
     ```
     JWT_SECRET=your-super-secret-jwt-key-minimum-32-chars
     NODE_ENV=production
     ADMIN_PASSWORD=your-secure-admin-password
     ```
   - `DATABASE_URL` is auto-added by Railway
   - `PORT` is auto-detected by Railway

6. **Update Backend Build Settings**
   - Go to backend service → Settings
   - Build Command: `npm install && npx prisma generate`
   - Start Command: `npm start`
   - Deploy Branch: `main`

7. **Deploy Backend**
   - Railway auto-deploys on git push
   - Copy your backend URL: `https://mystery-verse-backend-production.up.railway.app`

## Step 3: Deploy Frontend to Railway

1. **Create Frontend Service**
   - In the same Railway project, click "+ New"
   - Select "GitHub Repo" → Choose your repository again
   - Configure:
     - Root Directory: `/frontend`
     - Name: `mystery-verse-frontend`

2. **Configure Frontend Build Settings**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run preview`
   - Deploy Branch: `main`

3. **Add Frontend Environment Variables**
   - Go to frontend service → "Variables" tab
   - Add:
     ```
     VITE_API_URL=https://mystery-verse-backend-production.up.railway.app
     ```
   ⚠️ Use your actual backend Railway URL from Step 2

4. **Update Frontend for Production**
   - Railway serves static files differently, so you need to update the frontend

## Step 4: Update Frontend for Railway Static Hosting

1. **Install serve package**
   ```bash
   cd /Users/roshanchalise/Downloads/mystery\ verse/mystery-verse/frontend
   npm install serve --save
   ```

2. **Update frontend package.json scripts**
   Add this to your frontend package.json:
   ```json
   {
     "scripts": {
       "start": "serve -s dist -l 3000",
       "preview": "vite preview --host 0.0.0.0 --port $PORT"
     }
   }
   ```

3. **Create Railway Configuration**
   Create `railway.json` in the frontend directory:
   ```json
   {
     "$schema": "https://railway.app/railway.schema.json",
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "npm run preview",
       "healthcheckPath": "/",
       "healthcheckTimeout": 100,
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10
     }
   }
   ```

## Step 5: Configure Production Settings

### Backend Production Config

1. **Update CORS in backend/server.js**
   ```javascript
   app.use(cors({
     origin: [
       'https://mystery-verse-frontend-production.up.railway.app',
       'https://your-custom-domain.com',
       'http://localhost:3000', // for development
       'http://localhost:3002'  // for development
     ],
     credentials: true
   }));
   ```

2. **Ensure Prisma Production Setup**
   - Backend package.json should have:
   ```json
   "scripts": {
     "start": "node server.js",
     "postinstall": "prisma generate"
   }
   ```

## Step 6: Update Configuration Files

1. **Update Frontend Package.json**
   ```bash
   cd /Users/roshanchalise/Downloads/mystery\ verse/mystery-verse/frontend
   npm install serve --save
   ```

2. **Create Frontend Railway Config**
   ```bash
   cd /Users/roshanchalise/Downloads/mystery\ verse/mystery-verse/frontend
   ```
   Create `railway.json`:
   ```json
   {
     "$schema": "https://railway.app/railway.schema.json",
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "npm run preview",
       "healthcheckPath": "/",
       "healthcheckTimeout": 100,
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10
     }
   }
   ```

## Step 7: Connect Custom Domain (Optional)

### For Railway Frontend

1. **In Railway Dashboard**
   - Go to your frontend service → Settings → Domains
   - Click "Generate Domain" for a free railway.app subdomain
   - Or click "Custom Domain" to add your own domain

2. **For Custom Domain**
   - Add your domain: `mysteryverse.com`
   - Railway will provide DNS instructions
   - Update your domain's DNS records as instructed

## Step 8: Post-Deployment Verification

### ✅ Backend Health Checks
```bash
# Test API root
curl https://mystery-verse-backend-production.up.railway.app

# Test auth endpoint
curl https://mystery-verse-backend-production.up.railway.app/api/auth/profile
```

### ✅ Frontend Checks
1. Visit your Railway frontend URL
2. Open browser console (F12)
3. Check for any API errors
4. Test user registration
5. Test login functionality
6. Play through all verses

### ✅ Database Verification
```bash
# In Railway console
npx prisma studio
```

## 🔧 Troubleshooting

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| **CORS Error** | Update backend CORS origin to include your frontend Railway URL |
| **Database Connection Failed** | Check DATABASE_URL in environment variables |
| **Build Failed on Railway** | Check build logs, ensure all dependencies are in package.json |
| **API calls failing** | Verify VITE_API_URL points to correct backend URL |
| **"Cannot GET /api/..."** | Ensure backend routes are correctly configured |
| **Prisma errors** | Run `npx prisma generate` and `npx prisma db push` |
| **JWT errors** | Ensure JWT_SECRET is same in production as in .env |
| **Admin panel not working** | Check ADMIN_PASSWORD environment variable |
| **Frontend not loading** | Check if npm run preview works, verify start command |
| **Port binding errors** | Railway automatically assigns PORT, use process.env.PORT |

### Checking Logs

**Railway:**
- Dashboard → Your Service → Deployments → View Logs
- Live logs: Dashboard → Your Service → Observability

## 📊 Environment Variables Reference

### Backend (Railway)
| Variable | Example | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://...` | Auto-generated by Railway |
| `JWT_SECRET` | `my-super-secret-key-min-32-chars` | JWT signing secret |
| `NODE_ENV` | `production` | Environment mode |
| `ADMIN_PASSWORD` | `SecureAdminPass123!` | Admin panel password |

### Frontend (Railway)
| Variable | Example | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `https://mystery-verse-backend-production.up.railway.app` | Backend API URL |

## 🔄 Updating Your Deployment

### To update both services:
```bash
git add .
git commit -m "Update mystery verse app"
git push origin main
```
Railway auto-deploys both services on push

### To update specific files:
```bash
# Backend changes
git add backend/
git commit -m "Update backend"
git push origin main

# Frontend changes
git add frontend/
git commit -m "Update frontend"
git push origin main
```

## 📝 Important Notes

1. **Never commit `.env` files** to your repository
2. **Use strong passwords** for JWT_SECRET and ADMIN_PASSWORD
3. **Enable 2FA** on Railway
4. **Monitor usage** on Railway dashboard to avoid unexpected costs
5. **Railway provides $5/month free tier** for hobby projects
6. **Regular backups** of your PostgreSQL database

## 🎉 Success Checklist

- [ ] GitHub repository created and code pushed
- [ ] Backend service deployed on Railway
- [ ] PostgreSQL database connected
- [ ] Frontend service deployed on Railway
- [ ] Backend API responding at Railway URL
- [ ] Frontend loading at Railway URL
- [ ] User registration working
- [ ] User login working
- [ ] All 3 verses playable
- [ ] Progress saving correctly
- [ ] Admin panel accessible
- [ ] Custom domain connected (optional)

## 💡 Quick Deployment Commands

```bash
# 1. Push to GitHub (if not done)
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. Install serve for frontend
cd frontend
npm install serve --save

# 3. Update package.json scripts (add preview script)
# 4. Create railway.json in frontend directory
# 5. Deploy both services on Railway
# 6. Test everything!
```

---

**Need Help?**
- Railway Discord: https://discord.gg/railway
- Railway Docs: https://docs.railway.app
- Check Railway deployment logs for detailed error messages