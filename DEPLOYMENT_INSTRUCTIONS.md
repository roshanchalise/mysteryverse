# Mystery Verse - Deployment Instructions

This guide will help you deploy the Mystery Verse application to Vercel (frontend) and Railway (backend).

## Prerequisites

1. **GitHub Account** - Your code should be pushed to GitHub
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **Railway Account** - Sign up at [railway.app](https://railway.app)
4. **PostgreSQL Database** - Railway will provide this

## 🚀 Quick Deployment Steps

### Step 1: Deploy Backend to Railway

1. **Login to Railway**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Deploy Backend**
   ```bash
   cd backend
   railway up
   ```

3. **Add PostgreSQL Database**
   - In Railway dashboard, click "Add Service" → "Database" → "PostgreSQL"
   - Railway will automatically provide `DATABASE_URL`

4. **Set Environment Variables in Railway Dashboard**
   ```env
   DATABASE_URL=postgresql://... (automatically provided)
   JWT_SECRET=your-super-secret-jwt-key-here
   NODE_ENV=production
   PORT=3000
   ```

5. **Generate a JWT Secret**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

### Step 2: Deploy Frontend to Vercel

1. **Method 1: Via Vercel CLI**
   ```bash
   npm install -g vercel
   vercel login
   cd ..  # Go back to root directory
   vercel --prod
   ```

2. **Method 2: Via GitHub (Recommended)**
   - Push your code to GitHub
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Set build settings:
     - **Build Command**: `npm run vercel-build`
     - **Output Directory**: `frontend/dist`
     - **Install Command**: `npm run install-all`

### Step 3: Configure Frontend Environment

1. **In Vercel Dashboard, add Environment Variable:**
   ```env
   VITE_API_URL=https://your-railway-backend-url.railway.app
   ```

2. **Update Frontend API Configuration**
   - The frontend should use the Railway backend URL
   - Make sure CORS is configured in backend for Vercel domain

### Step 4: Configure CORS in Backend

Ensure your backend allows requests from Vercel domain. In `server.js`:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'https://your-vercel-app.vercel.app',
    'http://localhost:5173', // for development
    'http://localhost:3000'
  ]
}));
```

## 📋 Deployment Checklist

### Backend (Railway)
- [ ] PostgreSQL database created
- [ ] Environment variables set:
  - [ ] `DATABASE_URL` (auto-provided)
  - [ ] `JWT_SECRET` (generate random string)
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=3000`
- [ ] Database migrations run (`prisma db push`)
- [ ] Database seeded (`npm run db:seed`)
- [ ] CORS configured for Vercel domain

### Frontend (Vercel)
- [ ] Repository connected to Vercel
- [ ] Build command: `npm run vercel-build`
- [ ] Output directory: `frontend/dist`
- [ ] Environment variable `VITE_API_URL` set to Railway backend URL
- [ ] Domain configured (optional)

## 🔧 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check that all dependencies are in `package.json`
   - Ensure build commands are correct
   - Verify environment variables are set

2. **Database Connection Issues**
   - Verify `DATABASE_URL` is correctly set
   - Run `prisma generate` and `prisma db push`
   - Check Railway logs for database errors

3. **CORS Errors**
   - Update CORS configuration in backend
   - Ensure Vercel domain is whitelisted
   - Check frontend API URL configuration

4. **API Connection Issues**
   - Verify `VITE_API_URL` points to Railway backend
   - Check that Railway backend is running
   - Test API endpoints directly

### Railway CLI Commands

```bash
# Deploy
railway up

# Check status
railway status

# View logs
railway logs

# Add database
railway add postgresql

# Set environment variable
railway variables set JWT_SECRET=your-secret-here
```

### Vercel CLI Commands

```bash
# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs

# Set environment variable
vercel env add VITE_API_URL
```

## 🌐 Post-Deployment

1. **Test the Application**
   - Visit your Vercel URL
   - Register a new account
   - Test all three games (Simon, Symbol Matching, Mahjong)
   - Verify user progress is saved

2. **Monitor Performance**
   - Check Railway dashboard for backend metrics
   - Monitor Vercel analytics for frontend performance
   - Set up error tracking if needed

3. **Configure Custom Domains** (Optional)
   - Add custom domain in Vercel dashboard
   - Update CORS configuration with new domain

## 📱 Mobile Optimization

The application is responsive and works on mobile devices. Test on:
- iOS Safari
- Android Chrome
- Various screen sizes

## 🔒 Security Notes

- Never commit `.env` files with real credentials
- Use strong, random JWT secrets
- Enable HTTPS in production (automatic with Vercel/Railway)
- Consider rate limiting for API endpoints

## 📞 Support

If you encounter issues:
1. Check Railway and Vercel logs
2. Verify all environment variables
3. Test API endpoints independently
4. Check CORS configuration

---

**Success!** Your Mystery Verse application should now be live and accessible to users worldwide! 🎉

⏺ Since you're in a non-interactive environment, you can manually link using your project ID. First, let me show you the Railway
   commands you need:

  # Navigate to your backend directory
  cd "/Users/roshanchalise/Downloads/mystery verse/mystery-verse/backend"

  # Link to your existing Railway project (you'll need to select it)
  railway link

  # Or if you know your project ID:
  railway link [PROJECT_ID]

  # Then run the database commands:
  railway run npm run db:generate
  railway run npm run db:push
  railway run npm run db:seed

  Alternative approach:
  You can also run these commands directly in the Railway dashboard:
  1. Go to your Railway project dashboard
  2. Click on your backend service
  3. Go to the "Deploy" tab
  4. Run these commands in the Railway console

  To find your project:
  - Go to https://railway.app
  - Look for your mystery-verse project
  - Copy the project ID from the URL or settings

  Would you like me to help you identify which Railway project to link to?