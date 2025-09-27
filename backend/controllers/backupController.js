const fs = require('fs');
const path = require('path');
const { exportPlayerData, importPlayerData, listBackups, cleanOldBackups } = require('../utils/backup');

// Create manual backup
const createBackup = async (req, res) => {
  try {
    const result = await exportPlayerData();

    if (result.success) {
      res.json({
        message: 'Backup created successfully',
        filename: result.filename,
        userCount: result.userCount,
        filepath: result.filepath
      });
    } else {
      res.status(500).json({
        error: 'Failed to create backup',
        details: result.error
      });
    }
  } catch (error) {
    console.error('Create backup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// List all available backups
const getBackups = async (req, res) => {
  try {
    const result = listBackups();

    if (result.success) {
      res.json({
        backups: result.backups.map(backup => ({
          filename: backup.filename,
          size: backup.size,
          created: backup.created,
          modified: backup.modified,
          sizeFormatted: formatFileSize(backup.size)
        })),
        total: result.backups.length
      });
    } else {
      res.status(500).json({
        error: 'Failed to list backups',
        details: result.error
      });
    }
  } catch (error) {
    console.error('Get backups error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Download a specific backup file
const downloadBackup = async (req, res) => {
  try {
    const { filename } = req.params;

    // Security check: ensure filename doesn't contain path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    // Ensure it's a backup file
    if (!filename.startsWith('player-data-backup-') || !filename.endsWith('.json')) {
      return res.status(400).json({ error: 'Invalid backup file' });
    }

    const backupsDir = path.join(__dirname, '../backups');
    const filepath = path.join(backupsDir, filename);

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'Backup file not found' });
    }

    res.download(filepath, filename, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).json({ error: 'Failed to download backup' });
      }
    });

  } catch (error) {
    console.error('Download backup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Restore from backup
const restoreBackup = async (req, res) => {
  try {
    const { filename } = req.body;

    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    // Security check
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const backupsDir = path.join(__dirname, '../backups');
    const filepath = path.join(backupsDir, filename);

    const result = await importPlayerData(filepath);

    if (result.success) {
      res.json({
        message: 'Data restored successfully',
        usersRestored: result.usersRestored,
        versesRestored: result.versesRestored
      });
    } else {
      res.status(500).json({
        error: 'Failed to restore data',
        details: result.error
      });
    }

  } catch (error) {
    console.error('Restore backup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete old backups
const cleanupBackups = async (req, res) => {
  try {
    const result = cleanOldBackups();

    if (result.success) {
      res.json({
        message: 'Cleanup completed',
        deletedCount: result.deletedCount
      });
    } else {
      res.status(500).json({
        error: 'Cleanup failed',
        details: result.error
      });
    }
  } catch (error) {
    console.error('Cleanup backups error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get backup statistics
const getBackupStats = async (req, res) => {
  try {
    const { success, backups } = listBackups();

    if (!success) {
      return res.status(500).json({ error: 'Failed to get backup statistics' });
    }

    const totalSize = backups.reduce((sum, backup) => sum + backup.size, 0);
    const newestBackup = backups.length > 0 ? backups[0] : null;
    const oldestBackup = backups.length > 0 ? backups[backups.length - 1] : null;

    res.json({
      totalBackups: backups.length,
      totalSize: totalSize,
      totalSizeFormatted: formatFileSize(totalSize),
      newestBackup: newestBackup ? {
        filename: newestBackup.filename,
        created: newestBackup.created
      } : null,
      oldestBackup: oldestBackup ? {
        filename: oldestBackup.filename,
        created: oldestBackup.created
      } : null
    });

  } catch (error) {
    console.error('Get backup stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

module.exports = {
  createBackup,
  getBackups,
  downloadBackup,
  restoreBackup,
  cleanupBackups,
  getBackupStats
};