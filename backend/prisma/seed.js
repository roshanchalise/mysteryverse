const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.verse.deleteMany();
  
  await prisma.verse.createMany({
    data: [
      {
        orderIndex: 1,
        title: "The Humor Helix",
        description: "Arthur slumps in his chair, head in hands. 'It's gone,' he whispers. 'The laughter... the spark. I can't even remember what's supposed to be funny anymore.' He looks around his cluttered studio, hoping for inspiration. Suddenly, three oddities catch his eye... Help Arthur rediscover the essence of humor by solving a puzzle that reveals what is truly funny.",
        clues: "Three clues are displayed before you: [Image 1: /images/verse 5/punch image.jpeg] A cartoon-style red boxing glove with sunburst background. [Image 2: /images/verse 5/fishing image.jpeg] A peaceful fishing scene showing someone casting a line. [Riddle] 'I deliver a sudden impact, but leave no bruise. I stretch out long and thin, to catch a laugh, not fish. What am I, that makes us grin?'",
        answer: "PUNCHLINE"
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