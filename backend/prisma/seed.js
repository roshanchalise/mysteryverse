const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  await prisma.verse.deleteMany();
  
  await prisma.verse.createMany({
    data: [
      {
        orderIndex: 1,
        title: "The First Riddle",
        description: "I speak without a mouth and hear without ears. I have no body, but come alive with fears. In mountains I boom, in caves I hide, what am I?",
        clues: "Think about sounds in nature. What travels without a physical form?",
        answer: "echo"
      },
      {
        orderIndex: 2,
        title: "The Mathematical Mystery", 
        description: "I am a three-digit number. My tens digit is the square root of my hundreds digit. My ones digit is half of my tens digit. When you reverse my digits and subtract the result from my original value, you get 297. What number am I?",
        clues: "Think of perfect squares for the hundreds digit. If hundreds = 9, then tens = 3, ones = 1.5 (not valid). Try hundreds = 4, then tens = 2, ones = 1. Check: 421 - 124 = 297.",
        answer: "421"
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
        title: "The Pattern Decoder",
        description: "Look at this sequence: 2, 6, 12, 20, 30, ?. Each number follows a hidden pattern. Your task is to discover the rule and find the next number in the sequence. Think carefully about the relationship between consecutive numbers and their positions.",
        clues: "Look at the differences between consecutive numbers: 6-2=4, 12-6=6, 20-12=8, 30-20=10. The differences form an arithmetic sequence: 4, 6, 8, 10... What's the next difference?",
        answer: "42"
      }
    ]
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });