const { exportPlayerData, cleanOldBackups } = require('./backup');

// Schedule automatic backups
const scheduleBackups = () => {
  // Create backup every hour
  setInterval(async () => {
    console.log('🕐 Running scheduled backup...');
    const result = await exportPlayerData();
    if (result.success) {
      console.log(`✅ Scheduled backup completed: ${result.userCount} users backed up`);

      // Clean old backups (keep only last 10)
      const cleanResult = await cleanOldBackups();
      if (cleanResult.success && cleanResult.deletedCount > 0) {
        console.log(`🗑️  Cleaned ${cleanResult.deletedCount} old backups`);
      }
    } else {
      console.error('❌ Scheduled backup failed:', result.error);
    }
  }, 60 * 60 * 1000); // Every hour

  // Create backup every 10 minutes during active hours (for safety)
  setInterval(async () => {
    const hour = new Date().getHours();
    // Only during typical active hours (8 AM to 11 PM)
    if (hour >= 8 && hour <= 23) {
      console.log('🕒 Running frequent backup...');
      const result = await exportPlayerData();
      if (result.success) {
        console.log(`✅ Frequent backup completed: ${result.userCount} users backed up`);
      }
    }
  }, 10 * 60 * 1000); // Every 10 minutes during active hours

  console.log('⏰ Backup scheduler initialized - backups will run every hour and every 10 minutes during active hours');
};

// Auto-backup on important events (whenever user data changes)
const createEventBackup = async (eventType, userData = null) => {
  try {
    console.log(`🔄 Creating event backup for: ${eventType}`);
    const result = await exportPlayerData();
    if (result.success) {
      console.log(`✅ Event backup completed for ${eventType}: ${result.userCount} users backed up`);
      return result;
    } else {
      console.error(`❌ Event backup failed for ${eventType}:`, result.error);
      return result;
    }
  } catch (error) {
    console.error(`❌ Event backup error for ${eventType}:`, error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  scheduleBackups,
  createEventBackup
};