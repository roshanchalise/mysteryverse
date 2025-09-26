# Vercel Deployment Guide

## Step-by-Step Vercel Deployment:

### 1. Go to [vercel.com](https://vercel.com) and sign in

### 2. Click "New Project" → "Import Git Repository"

### 3. Select your repository: `roshanchalise/mysteryverse`

### 4. Configure Build Settings:
```
Framework Preset: Other
Build Command: npm run vercel-build
Output Directory: frontend/dist
Install Command: npm run install-all
```

### 5. Add Environment Variables:
**IMPORTANT:** Replace YOUR_RAILWAY_URL with your actual Railway URL

```env
VITE_API_URL=https://your-railway-app-name.railway.app
```

### 6. Deploy!

## After Deployment:

Your Vercel URL will be: `https://your-project-name.vercel.app`

## Test Your Deployment:

1. **Backend Test:** Visit your Railway URL - should see:
   ```json
   {"message": "Mystery Verse API is running!"}
   ```

2. **Frontend Test:** Visit your Vercel URL - should load the game

3. **Mobile Test:** Try logging in from your mobile device