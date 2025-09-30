const express = require('express');
const { getAllVerses, createVerse, updateVerse, deleteVerse, getAllUsers, deleteUser, resetAllProgress, getDatabaseHealth } = require('../controllers/adminController');
const { createBackup, getBackups, downloadBackup, restoreBackup, cleanupBackups, getBackupStats } = require('../controllers/backupController');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

router.post('/login', (req, res) => {
  const { adminPassword } = req.body;
  
  if (adminPassword === process.env.ADMIN_PASSWORD) {
    res.json({ message: 'Admin login successful' });
  } else {
    res.status(401).json({ error: 'Invalid admin password' });
  }
});

router.get('/verses', authenticateAdmin, getAllVerses);
router.post('/verses', authenticateAdmin, createVerse);
router.post('/verses-list', authenticateAdmin, getAllVerses);
router.put('/verses/:id', authenticateAdmin, updateVerse);
router.delete('/verses/:id', authenticateAdmin, deleteVerse);

router.get('/users', authenticateAdmin, getAllUsers);
router.post('/users', authenticateAdmin, getAllUsers);
router.delete('/users/:id', authenticateAdmin, deleteUser);

// Reset functionality
router.post('/reset-all-progress', authenticateAdmin, resetAllProgress);

// Database health check
router.get('/database-health', authenticateAdmin, getDatabaseHealth);

// Production debug endpoint
router.get('/debug', authenticateAdmin, (req, res) => {
  res.json({
    environment: process.env.NODE_ENV,
    platform: process.platform,
    nodeVersion: process.version,
    timestamp: new Date().toISOString(),
    databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
    adminPassword: process.env.ADMIN_PASSWORD ? 'Set' : 'Not set',
    backupsDisabled: process.env.DISABLE_BACKUPS === 'true'
  });
});

// Backup routes
router.post('/backup/create', authenticateAdmin, createBackup);
router.get('/backup/list', authenticateAdmin, getBackups);
router.get('/backup/stats', authenticateAdmin, getBackupStats);
router.get('/backup/download/:filename', authenticateAdmin, downloadBackup);
router.post('/backup/restore', authenticateAdmin, restoreBackup);
router.post('/backup/cleanup', authenticateAdmin, cleanupBackups);

module.exports = router;