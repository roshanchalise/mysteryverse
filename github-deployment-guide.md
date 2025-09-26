# GitHub Deployment Guide for Mystery Verse

## Overview
This guide deploys:
- **Frontend**: GitHub Pages (free static hosting)
- **Backend**: Render.com (free tier with PostgreSQL)

## 🚀 Quick Deployment Steps

### Step 1: Deploy Backend to Render

1. **Go to [render.com](https://render.com)** and sign up
2. **Create New Web Service**
3. **Connect your GitHub repository:** `roshanchalise/mysteryverse`
4. **Configure the service:**
   ```
   Name: mysteryverse-backend
   Region: Oregon (US West)
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install && npx prisma generate
   Start Command: npm start
   ```

5. **Add Environment Variables:**
   ```env
   DATABASE_URL=postgresql://username:password@host:port/database
   JWT_SECRET=750aa37311087a7c32c2b04c7a77d5c14e7353c462094f2ff512b1ad24e4cf0297971426d96b74bf5a3fd579adef7f4f8c958c026f37cccac4e4862128470074
   NODE_ENV=production
   PORT=10000
   ```

6. **Add PostgreSQL Database:**
   - In Render dashboard, create new PostgreSQL database
   - Copy the DATABASE_URL to your web service environment variables

7. **Deploy!** Render will give you a URL like:
   `https://mysteryverse-backend-xxxx.onrender.com`

### Step 2: Configure Frontend for GitHub Pages

1. **Update frontend API URL** in GitHub Actions workflow (already done)
2. **Enable GitHub Pages** in your repository:
   - Go to repository Settings → Pages
   - Source: GitHub Actions
   - The workflow will automatically deploy to `https://roshanchalise.github.io/mysteryverse`

### Step 3: Deploy Frontend to GitHub Pages

The GitHub Actions workflow will automatically:
1. Build the frontend with the correct API URL
2. Deploy to GitHub Pages
3. Your site will be available at: `https://roshanchalise.github.io/mysteryverse`

## 🔧 Manual Steps Required

### For Backend (Render):
1. Sign up at render.com
2. Connect GitHub repository
3. Set environment variables
4. Add PostgreSQL database
5. Run database migrations in Render console:
   ```bash
   npm run db:push
   npm run db:seed
   ```

### For Frontend (GitHub Pages):
1. Enable GitHub Pages in repository settings
2. Push code to main branch
3. GitHub Actions will automatically deploy

## 🧪 Testing Your Deployment

### Test Backend:
```bash
curl https://mysteryverse-backend-xxxx.onrender.com/
# Should return: {"message": "Mystery Verse API is running!"}
```

### Test Frontend:
Visit: `https://roshanchalise.github.io/mysteryverse`

### Test Mobile Login:
1. Open the GitHub Pages URL on your mobile device
2. Try registering and logging in
3. Should work without CORS issues

## 📱 Why This Fixes Mobile Issues

1. **Proper HTTPS**: Both services use HTTPS
2. **CORS Configuration**: Backend allows GitHub Pages origin
3. **Environment Variables**: Frontend knows where to find backend
4. **Static Hosting**: GitHub Pages serves frontend efficiently

## 🔄 Automatic Deployments

- **Frontend**: Deploys automatically on push to main branch
- **Backend**: Configure Render webhook for auto-deploy on GitHub push

## 💰 Cost
- **Frontend**: Free (GitHub Pages)
- **Backend**: Free tier on Render (750 hours/month)
- **Database**: Free PostgreSQL on Render

## 🚨 Important Notes

1. **Update API URL**: Change `VITE_API_URL` in the workflow to your actual Render URL
2. **Database**: Run migrations after first deployment
3. **Secrets**: All sensitive data is in Render environment variables
4. **Domain**: Optionally add custom domain to GitHub Pages

## 📋 Deployment Checklist

### Backend (Render)
- [ ] Render account created
- [ ] Web service created and deployed
- [ ] PostgreSQL database added
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] API endpoints working

### Frontend (GitHub Pages)
- [ ] GitHub Pages enabled in repository settings
- [ ] GitHub Actions workflow configured
- [ ] Frontend builds successfully
- [ ] Site accessible at GitHub Pages URL
- [ ] Mobile login working

## 🔗 Final URLs

After deployment:
- **Frontend**: https://roshanchalise.github.io/mysteryverse
- **Backend**: https://mysteryverse-backend-xxxx.onrender.com (replace with your actual URL)

This setup provides a completely free, reliable deployment that will fix your mobile sign-in issues!