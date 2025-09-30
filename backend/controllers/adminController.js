const { PrismaClient } = require('@prisma/client');
const { createEventBackup } = require('../utils/scheduler');
const { checkDatabaseHealth } = require('../utils/databaseCheck');

const prisma = new PrismaClient();

const getAllVerses = async (req, res) => {
  try {
    const verses = await prisma.verse.findMany({
      orderBy: { orderIndex: 'asc' }
    });
    res.json({ verses });
  } catch (error) {
    console.error('Get all verses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createVerse = async (req, res) => {
  try {
    const { title, description, clues, answer, orderIndex } = req.body;

    if (!title || !description || !answer || !orderIndex) {
      return res.status(400).json({ error: 'Title, description, answer, and order index are required' });
    }

    const existingVerse = await prisma.verse.findUnique({
      where: { orderIndex: parseInt(orderIndex) }
    });

    if (existingVerse) {
      return res.status(400).json({ error: 'A verse with this order index already exists' });
    }

    const verse = await prisma.verse.create({
      data: {
        title,
        description,
        clues: clues || '',
        answer,
        orderIndex: parseInt(orderIndex)
      }
    });

    res.status(201).json({ message: 'Verse created successfully', verse });
  } catch (error) {
    console.error('Create verse error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateVerse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, clues, answer, orderIndex, isActive } = req.body;
    const verseId = parseInt(id);

    const existingVerse = await prisma.verse.findUnique({
      where: { id: verseId }
    });

    if (!existingVerse) {
      return res.status(404).json({ error: 'Verse not found' });
    }

    if (orderIndex && orderIndex !== existingVerse.orderIndex) {
      const conflictingVerse = await prisma.verse.findUnique({
        where: { orderIndex: parseInt(orderIndex) }
      });

      if (conflictingVerse && conflictingVerse.id !== verseId) {
        return res.status(400).json({ error: 'A verse with this order index already exists' });
      }
    }

    const verse = await prisma.verse.update({
      where: { id: verseId },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(clues !== undefined && { clues }),
        ...(answer && { answer }),
        ...(orderIndex && { orderIndex: parseInt(orderIndex) }),
        ...(isActive !== undefined && { isActive })
      }
    });

    res.json({ message: 'Verse updated successfully', verse });
  } catch (error) {
    console.error('Update verse error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteVerse = async (req, res) => {
  try {
    const { id } = req.params;
    const verseId = parseInt(id);

    const existingVerse = await prisma.verse.findUnique({
      where: { id: verseId }
    });

    if (!existingVerse) {
      return res.status(404).json({ error: 'Verse not found' });
    }

    await prisma.verse.delete({
      where: { id: verseId }
    });

    res.json({ message: 'Verse deleted successfully' });
  } catch (error) {
    console.error('Delete verse error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        currentVerse: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const resetAllProgress = async (req, res) => {
  console.log('🔄 Starting admin reset operation...');

  try {
    // Try to create backup before reset (non-blocking for production)
    console.log('📦 Attempting to create backup...');
    try {
      await createEventBackup('admin_full_reset', {
        resetBy: 'admin',
        timestamp: new Date().toISOString()
      });
      console.log('✅ Pre-reset backup created successfully');
    } catch (backupError) {
      console.warn('⚠️ Backup creation failed (continuing with reset):', backupError.message);
      // Don't block the reset operation if backup fails
    }

    // Reset all users' currentVerse to 1 and clear completedVerses
    console.log('👥 Resetting user progress...');
    const userUpdateResult = await prisma.user.updateMany({
      data: {
        currentVerse: 1,
        completedVerses: "[]"
      }
    });
    console.log(`✅ Reset ${userUpdateResult.count} users to verse 1`);

    // Clear all leaderboard entries (optional if table doesn't exist)
    console.log('🏆 Attempting to clear leaderboard entries...');
    let leaderboardDeleteResult = { count: 0 };
    try {
      leaderboardDeleteResult = await prisma.leaderboardEntry.deleteMany({});
      console.log(`✅ Cleared ${leaderboardDeleteResult.count} leaderboard entries`);
    } catch (leaderboardError) {
      console.warn('⚠️ Leaderboard table not found or accessible (skipping leaderboard reset):', leaderboardError.message);
      console.warn('Leaderboard error details:', {
        code: leaderboardError.code,
        message: leaderboardError.message,
        meta: leaderboardError.meta
      });
      // Continue without failing - leaderboard table might not exist yet
    }

    console.log('🎉 Admin reset completed successfully');
    res.json({
      message: 'All player progress and leaderboards have been reset successfully. All players can now start fresh from verse 1.',
      details: {
        usersReset: userUpdateResult.count,
        leaderboardEntriesCleared: leaderboardDeleteResult.count
      }
    });
  } catch (error) {
    console.error('❌ Reset all progress error:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      meta: error.meta,
      stack: error.stack
    });

    // Provide more specific error information
    if (error.code === 'P2002') {
      res.status(500).json({ error: 'Database constraint error during reset operation' });
    } else if (error.code === 'P2025') {
      res.status(500).json({ error: 'Required data not found during reset operation' });
    } else if (error.code === 'P2021') {
      res.status(500).json({ error: 'Database table does not exist' });
    } else {
      res.status(500).json({
        error: 'Internal server error during reset operation',
        code: error.code,
        details: process.env.NODE_ENV === 'development' ? error.message : 'Reset operation failed'
      });
    }
  }
};

const getDatabaseHealth = async (req, res) => {
  try {
    const healthStatus = await checkDatabaseHealth();
    res.json(healthStatus);
  } catch (error) {
    console.error('Database health check error:', error);
    res.status(500).json({
      status: 'error',
      error: 'Failed to check database health',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = { getAllVerses, createVerse, updateVerse, deleteVerse, getAllUsers, deleteUser, resetAllProgress, getDatabaseHealth };