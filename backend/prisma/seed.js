const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.verse.deleteMany();
  
  await prisma.verse.createMany({
    data: [
      {
        orderIndex: 1,
        title: "The Simon Memory Challenge",
        description: "Welcome to the ultimate memory test! You must complete 5 consecutive rounds of increasingly difficult patterns to unlock this verse. Each round gets faster and longer. One mistake resets everything. Are you ready for the maximum difficulty Simon challenge?",
        clues: "Focus intensely on each pattern. The game speeds up with each round (400ms → 200ms). Watch out for the distraction flash after each sequence. You have only 2 seconds to start your input. Pattern lengths: 4 → 6 → 8 → 10 → 12 items.",
        answer: "COMPLETE"
      },
      {
        orderIndex: 2,
        title: "The Ancient Symbol Challenge",
        description: "Welcome to the ancient symbol matching challenge! You must correctly match 10 sacred symbols with their meanings through drag and drop. These symbols represent wisdom from cultures across the world - from the Eastern Yin Yang to the Norse Valknut. Study each symbol carefully and discover their hidden meanings to unlock this verse.",
        clues: "Drag symbols from the left to their correct meanings on the right. Each symbol represents deep cultural and spiritual concepts: balance, protection, life, healing, and divine wisdom. Pay attention to the visual characteristics of each symbol to help guide your matches. Remember: Yin Yang (balance), Om (sacred sound), Ankh (life), Hamsa (protection), Caduceus (medicine).",
        answer: "COMPLETE"
      },
      {
        orderIndex: 3,
        title: "The Tile Harmony Puzzle",
        description: "Ancient Mahjong tiles lie scattered on a 6×8 grid before you. Your task is to clear the board by matching identical pairs, but beware - only 'free' tiles can be selected. A tile is 'free' if it has no tile directly blocking its left OR right side. Match all 24 pairs to unlock the harmony. Enter coordinates like 'A1 B3' to select two tiles.\n\nThe board uses coordinates A-H (columns) and 1-6 (rows). Corner and edge tiles are often good starting points. Plan your moves carefully - random matching may lead to an unsolvable state where no valid moves remain!",
        clues: "Study the board carefully before making moves. A tile is 'free' when its left OR right side is completely open (no adjacent tile). Focus on freeing up buried tiles by removing their blocking neighbors first. If you get stuck, look for tiles at the edges or corners - they're more likely to be free. The key is strategic thinking, not speed.",
        answer: "COMPLETE"
      },
      {
        orderIndex: 4,
        title: "The Ultra-Hard Symbol Challenge",
        description: "Welcome to the ultimate test of focus and perception! You face a 10×10 grid containing 100 symbols that are nearly identical. Your mission: find and click all 25 target symbols hidden among 75 decoys. There are 5 types of symbols (A-E), and you must find all 5 of each type. The challenge? These symbols are 80% identical script letters with distinguishable but subtle differences. This is difficulty level 10/10 - only the most focused minds will succeed!",
        clues: "Study the symbol guide carefully before starting. Script A Normal: Standard cursive 'a'. Script A Short: Vertically compressed (65% height). Script A Bold: Enhanced boldness with thick text shadow. Script A Slanted: Extra italicized (-18° skew). Script A Compressed: Horizontally squeezed (45% width). Focus on the shape variations, line thickness, and proportions. Find all 5 of each type to clear that set. Clear all 5 sets to win!",
        answer: "COMPLETE"
      }
    ]
  });

  console.log('Database seeded successfully with verses!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });