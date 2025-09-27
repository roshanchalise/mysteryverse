const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Create backups directory if it doesn't exist
const backupsDir = path.join(__dirname, '../backups');
if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true });
}

// Export all player data to JSON
const exportPlayerData = async () => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        password: true,
        currentVerse: true,
        completedVerses: true,
        createdAt: true,
        updatedAt: true
      }
    });

    const verses = await prisma.verse.findMany();

    const backupData = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      users: users,
      verses: verses,
      totalUsers: users.length,
      totalVerses: verses.length
    };

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `player-data-backup-${timestamp}.json`;
    const filepath = path.join(backupsDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));

    console.log(`✅ Player data backed up to: ${filepath}`);
    return { success: true, filepath, filename, userCount: users.length };
  } catch (error) {
    console.error('❌ Backup failed:', error);
    return { success: false, error: error.message };
  }
};

// Import player data from JSON backup
const importPlayerData = async (backupFilePath) => {
  try {
    if (!fs.existsSync(backupFilePath)) {
      throw new Error('Backup file not found');
    }

    const backupData = JSON.parse(fs.readFileSync(backupFilePath, 'utf8'));

    if (!backupData.users || !Array.isArray(backupData.users)) {
      throw new Error('Invalid backup format: missing users data');
    }

    // Clear existing data (optional - commented out for safety)
    // await prisma.user.deleteMany();
    // await prisma.verse.deleteMany();

    // Restore users
    for (const user of backupData.users) {
      await prisma.user.upsert({
        where: { username: user.username },
        update: {
          password: user.password,
          currentVerse: user.currentVerse,
          completedVerses: user.completedVerses,
          updatedAt: new Date()
        },
        create: {
          username: user.username,
          password: user.password,
          currentVerse: user.currentVerse,
          completedVerses: user.completedVerses,
          createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
          updatedAt: new Date()
        }
      });
    }

    // Restore verses if they exist in backup
    if (backupData.verses && Array.isArray(backupData.verses)) {
      for (const verse of backupData.verses) {
        await prisma.verse.upsert({
          where: { orderIndex: verse.orderIndex },
          update: {
            title: verse.title,
            description: verse.description,
            clues: verse.clues,
            answer: verse.answer,
            isActive: verse.isActive,
            updatedAt: new Date()
          },
          create: {
            title: verse.title,
            description: verse.description,
            clues: verse.clues,
            answer: verse.answer,
            orderIndex: verse.orderIndex,
            isActive: verse.isActive,
            createdAt: verse.createdAt ? new Date(verse.createdAt) : new Date(),
            updatedAt: new Date()
          }
        });
      }
    }

    console.log(`✅ Player data restored from: ${backupFilePath}`);
    console.log(`📊 Restored ${backupData.users.length} users and ${backupData.verses?.length || 0} verses`);

    return {
      success: true,
      usersRestored: backupData.users.length,
      versesRestored: backupData.verses?.length || 0
    };
  } catch (error) {
    console.error('❌ Restore failed:', error);
    return { success: false, error: error.message };
  }
};

// Automatic backup on server start
const createStartupBackup = async () => {
  console.log('🔄 Creating startup backup...');
  const result = await exportPlayerData();
  if (result.success) {
    console.log(`🎯 Startup backup created: ${result.userCount} users backed up`);
  }
  return result;
};

// Get list of available backups
const listBackups = () => {
  try {
    const files = fs.readdirSync(backupsDir)
      .filter(file => file.startsWith('player-data-backup-') && file.endsWith('.json'))
      .map(file => {
        const filepath = path.join(backupsDir, file);
        const stats = fs.statSync(filepath);
        return {
          filename: file,
          filepath: filepath,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime
        };
      })
      .sort((a, b) => b.created - a.created); // Most recent first

    return { success: true, backups: files };
  } catch (error) {
    console.error('❌ Failed to list backups:', error);
    return { success: false, error: error.message };
  }
};

// Clean old backups (keep only last 10)
const cleanOldBackups = () => {
  try {
    const { backups } = listBackups();
    if (backups && backups.length > 10) {
      const toDelete = backups.slice(10); // Keep first 10, delete rest
      toDelete.forEach(backup => {
        fs.unlinkSync(backup.filepath);
        console.log(`🗑️  Deleted old backup: ${backup.filename}`);
      });
    }
    return { success: true, deletedCount: Math.max(0, backups?.length - 10) };
  } catch (error) {
    console.error('❌ Failed to clean old backups:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  exportPlayerData,
  importPlayerData,
  createStartupBackup,
  listBackups,
  cleanOldBackups,
  backupsDir
};