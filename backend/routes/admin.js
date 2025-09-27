const express = require('express');
const { getAllVerses, createVerse, updateVerse, deleteVerse, getAllUsers, deleteUser } = require('../controllers/adminController');
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

// Backup routes
router.post('/backup/create', authenticateAdmin, createBackup);
router.get('/backup/list', authenticateAdmin, getBackups);
router.get('/backup/stats', authenticateAdmin, getBackupStats);
router.get('/backup/download/:filename', authenticateAdmin, downloadBackup);
router.post('/backup/restore', authenticateAdmin, restoreBackup);
router.post('/backup/cleanup', authenticateAdmin, cleanupBackups);

module.exports = router;