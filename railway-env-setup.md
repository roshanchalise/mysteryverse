# Railway Environment Variables Setup

## Required Environment Variables for Railway:

```env
JWT_SECRET=750aa37311087a7c32c2b04c7a77d5c14e7353c462094f2ff512b1ad24e4cf0297971426d96b74bf5a3fd579adef7f4f8c958c026f37cccac4e4862128470074
NODE_ENV=production
PORT=3000
```

## Steps to add in Railway Dashboard:

1. Go to your Railway project
2. Click on your service
3. Go to "Variables" tab
4. Add each variable above
5. Note: DATABASE_URL will be automatically provided when you add PostgreSQL

## After deployment, you'll need to run these commands in Railway console:

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

## Your Railway URL will be something like:
`https://mysteryverse-production-XXXX.railway.app`

Copy this URL - you'll need it for Vercel deployment.