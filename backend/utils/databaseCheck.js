const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Check if LeaderboardEntry table exists and create it if missing
const ensureLeaderboardTable = async () => {
  try {
    // Try to access the LeaderboardEntry table
    await prisma.leaderboardEntry.findFirst();
    console.log('✅ LeaderboardEntry table exists and accessible');
    return true;
  } catch (error) {
    console.warn('⚠️ LeaderboardEntry table access failed:', error.message);

    // Check if it's a table existence issue
    if (error.code === 'P2021' || error.message.includes('does not exist') || error.message.includes('relation')) {
      console.error('🚨 LeaderboardEntry table does not exist - this may cause leaderboard features to fail');
      console.log('📋 Required table schema:');
      console.log(`
CREATE TABLE "LeaderboardEntry" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "verseId" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "solvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaderboardEntry_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LeaderboardEntry_userId_verseId_key" ON "LeaderboardEntry"("userId", "verseId");
CREATE INDEX "LeaderboardEntry_verseId_rank_idx" ON "LeaderboardEntry"("verseId", "rank");

ALTER TABLE "LeaderboardEntry" ADD CONSTRAINT "LeaderboardEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LeaderboardEntry" ADD CONSTRAINT "LeaderboardEntry_verseId_fkey" FOREIGN KEY ("verseId") REFERENCES "Verse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `);

      return false;
    }

    // Other error - re-throw
    throw error;
  }
};

// Check overall database health
const checkDatabaseHealth = async () => {
  try {
    console.log('🔍 Checking database health...');

    // Check basic tables
    const userCount = await prisma.user.count();
    const verseCount = await prisma.verse.count();

    console.log(`✅ Database connection successful`);
    console.log(`📊 Found ${userCount} users and ${verseCount} verses`);

    // Check leaderboard table
    const leaderboardExists = await ensureLeaderboardTable();

    if (leaderboardExists) {
      const leaderboardCount = await prisma.leaderboardEntry.count();
      console.log(`🏆 Found ${leaderboardCount} leaderboard entries`);
    }

    return {
      status: 'healthy',
      userCount,
      verseCount,
      leaderboardExists,
      leaderboardCount: leaderboardExists ? await prisma.leaderboardEntry.count() : 0
    };
  } catch (error) {
    console.error('❌ Database health check failed:', error.message);
    return {
      status: 'unhealthy',
      error: error.message,
      code: error.code
    };
  }
};

module.exports = {
  ensureLeaderboardTable,
  checkDatabaseHealth
};