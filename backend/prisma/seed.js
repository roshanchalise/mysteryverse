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
      },
      {
        orderIndex: 3,
        title: "The Titan's Gift",
        description: "The Titan Prometheus gifted fire to humanity, a flame of knowledge and warmth that forever changed our destiny. But every flame casts a shadow, every gift carries a weight. Some burdens, like the Titan's own, feel too heavy to carry alone. They fester in silence, growing heavier in the dark. Your challenge is to decipher the wisdom hidden in this ancient tale. Look at the symbols—one of an immense weight, the other of division and connection. What single word unlocks the secret to easing such a burden?",
        clues: "Visual clues guide your understanding: [Clue 1] An image of the Titan Atlas, straining as he holds the celestial spheres (the world) on his shoulders - representing an immense emotional burden or stress one person is carrying alone. [Clue 2] A simple diagram of two overlapping circles (a Venn diagram), with the intersecting area highlighted - visually representing the act of creating an overlapping, common space where something that was once separate is now held jointly.",
        answer: "SHARE"
      },
      {
        orderIndex: 4,
        title: "The Unspoken Thought",
        description: "Alex felt a fog separating him from his friends. His thoughts were clear in his mind, but when he spoke, they crumbled, creating walls of misunderstanding. He watched them connect, while he felt stranded on an island of silence. Frustrated, he realized he wasn't missing feelings, but the proper tools to build bridges for them. He discovered that the right one, chosen with care, could cut through the fog, rebuild a connection, and turn a jumbled thought into a shared moment, finally unlocking the door to his friends' minds.",
        clues: "Visual clues guide you: [Clue 1] An image of colorful scattered letters and numbers on a board - representing the chaos of unorganized thoughts and the building blocks of communication. [Clue 2] An image of a man reading through a paper holding a pen in his hand - representing the act of carefully choosing and crafting communication.",
        answer: "WORD"
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