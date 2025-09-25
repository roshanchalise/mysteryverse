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
      },
      {
        orderIndex: 2,
        title: "The Analog Sunset",
        description: "Leo rummaged through a dusty old box in his attic, a wave of nostalgia washing over him. \"Here it is!\" he exclaimed, holding up a scratched DVD case for the 2000s blockbuster, 'Cyber Voyager'. He was so excited to show the classic sci-fi film to his younger cousin, Zara. But when he plugged in his old player, the screen just flickered: \"ERROR\".\n\nZara tilted her head. \"A disc? Why don't we just... you know... watch it now?\" She tapped her smart TV, and a familiar grid of colorful app icons appeared. Leo was baffled. He had the movie right here in his hand, but it was useless. To watch it, he had to embrace a completely new way.\n\nLeo needs to adapt to the modern way of watching movies. What single word describes this necessary leap forward?",
        clues: "Visual clues guide you: [Clue 1] An image of a dusty, bulky DVD player from the early 2000s. A physical DVD disc is halfway out of the tray. The small digital display on the player reads \"NO DISC\". [Clue 2] A sleek, modern smart TV screen displaying a vibrant grid of app icons. The logos for Netflix, Hulu, and Disney+ are clearly visible and in focus.",
        answer: "STREAM"
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