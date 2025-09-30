const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/game');
const adminRoutes = require('./routes/admin');
// const { createStartupBackup } = require('./utils/backup');
// const { scheduleBackups } = require('./utils/scheduler');
const { checkDatabaseHealth } = require('./utils/databaseCheck');

const app = express();
const PORT = process.env.PORT || 3333;

// CORS configuration for production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);

    // Allow localhost for development
    if (origin.includes('localhost')) return callback(null, true);

    // Allow GitHub Pages
    if (origin.includes('github.io')) return callback(null, true);

    // Allow Vercel deployments
    if (origin.includes('vercel.app')) return callback(null, true);

    // Allow Railway deployments
    if (origin.includes('railway.app')) return callback(null, true);

    // Allow Render deployments
    if (origin.includes('onrender.com')) return callback(null, true);

    // For production, you might want to restrict this further
    return callback(null, true);
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Mystery Verse API is running!' });
});

// Initialize server with health checks - BACKUP SYSTEM TEMPORARILY DISABLED
const initializeServer = async () => {
  try {
    // Check database health on startup
    const healthStatus = await checkDatabaseHealth();

    if (healthStatus.status === 'healthy') {
      console.log('🎉 Server initialization completed successfully');

      if (!healthStatus.leaderboardExists) {
        console.log('⚠️  Leaderboard features will be limited until table is created');
      }
    } else {
      console.error('❌ Database health check failed:', healthStatus.error);
    }

    // await createStartupBackup();
    // scheduleBackups();
    console.log('⚠️  Backup system temporarily disabled for Railway deployment');
  } catch (error) {
    console.error('⚠️  Server initialization failed:', error);
  }
};

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    initializeServer();
  });
}

// Export for Vercel serverless
module.exports = app;