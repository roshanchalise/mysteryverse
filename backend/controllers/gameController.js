const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Puzzle generators
const generateRiddle = () => {
  const riddles = [
    {
      description: "I speak without a mouth and hear without ears. I have no body, but come alive with fears. In mountains I boom, in caves I hide, what am I?",
      clues: "Think about sounds in nature. What travels without a physical form?",
      answer: "echo"
    },
    {
      description: "The more you take, the more you leave behind. What am I?",
      clues: "Think about walking or moving. What do you create as you go?",
      answer: "footsteps"
    },
    {
      description: "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?",
      clues: "Think about representations of places, not actual places.",
      answer: "map"
    },
    {
      description: "What has keys but no locks, space but no room, and you can enter but not go inside?",
      clues: "Think about something you use every day for typing or computing.",
      answer: "keyboard"
    },
    {
      description: "I am not alive, but I grow. I don't have lungs, but I need air. I don't have a mouth, but water kills me. What am I?",
      clues: "Think about something that consumes and spreads, but can be extinguished.",
      answer: "fire"
    }
  ];
  
  return riddles[Math.floor(Math.random() * riddles.length)];
};

const generateMathPuzzle = () => {
  const puzzles = [
    {
      description: "I am a three-digit number. My tens digit is the square root of my hundreds digit. My ones digit is half of my tens digit. When you reverse my digits and subtract the result from my original value, you get 297. What number am I?",
      clues: "Think of perfect squares for the hundreds digit. If hundreds = 9, then tens = 3, ones = 1.5 (not valid). Try hundreds = 4, then tens = 2, ones = 1. Check: 421 - 124 = 297.",
      answer: "421"
    },
    {
      description: "I am a two-digit number. When you multiply my digits together, you get 36. When you add my digits together, you get 13. What number am I?",
      clues: "Find two numbers that multiply to 36 and add to 13. Try factor pairs of 36: 4×9=36, and 4+9=13.",
      answer: "49"
    },
    {
      description: "I am a three-digit number. My hundreds digit is twice my tens digit. My ones digit is the sum of my hundreds and tens digits. The sum of all my digits is 21. What number am I?",
      clues: "Let tens = x, then hundreds = 2x, ones = 2x + x = 3x. Total: x + 2x + 3x = 6x = 21, so x = 3.5 (not valid). Try x = 3: 6 + 3 + 9 = 18 ≠ 21. Try systematically.",
      answer: "642"
    },
    {
      description: "I am thinking of a number. If you multiply it by 3 and add 7, then divide by 2, you get 16. What is my number?",
      clues: "Work backwards: 16 × 2 = 32, then 32 - 7 = 25, then 25 ÷ 3 = ?",
      answer: "8"
    },
    {
      description: "I am a two-digit number. When you reverse my digits, the new number is 27 more than my original value. The sum of my digits is 11. What number am I?",
      clues: "Let the number be 10a + b, where a and b are digits. Reversed: 10b + a. So 10b + a = 10a + b + 27, which gives 9b - 9a = 27, or b - a = 3. Also a + b = 11.",
      answer: "47"
    }
  ];
  
  return puzzles[Math.floor(Math.random() * puzzles.length)];
};

const getVerses = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const verses = await prisma.verse.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: 'asc' },
      select: {
        id: true,
        title: true,
        orderIndex: true
      }
    });

    // Parse completed verses array
    let completedVerses = [];
    try {
      completedVerses = JSON.parse(user.completedVerses || '[]');
    } catch (error) {
      console.error('Error parsing completedVerses:', error);
      completedVerses = [];
    }

    const versesWithStatus = verses.map(verse => ({
      ...verse,
      isUnlocked: true, // All verses are now unlocked
      isSolved: completedVerses.includes(verse.orderIndex) // Check if verse is completed
    }));

    res.json({ verses: versesWithStatus, currentVerse: user.currentVerse });
  } catch (error) {
    console.error('Get verses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getVerse = async (req, res) => {
  try {
    const { id } = req.params;
    const verseId = parseInt(id);

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    const verse = await prisma.verse.findUnique({
      where: { id: verseId, isActive: true }
    });

    if (!verse) {
      return res.status(404).json({ error: 'Verse not found' });
    }

    // All verses are now accessible - no unlock restriction

    // Parse completed verses array
    let completedVerses = [];
    try {
      completedVerses = JSON.parse(user.completedVerses || '[]');
    } catch (error) {
      console.error('Error parsing completedVerses:', error);
      completedVerses = [];
    }

    const verseData = {
      id: verse.id,
      title: verse.title,
      description: verse.description,
      clues: verse.clues,
      orderIndex: verse.orderIndex,
      isUnlocked: true, // All verses are unlocked
      isSolved: completedVerses.includes(verse.orderIndex) // Check if verse is completed
    };

    res.json({ verse: verseData });
  } catch (error) {
    console.error('Get verse error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const submitAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { answer, currentPuzzleAnswer } = req.body;
    const verseId = parseInt(id);

    if (!answer) {
      return res.status(400).json({ error: 'Answer is required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    const verse = await prisma.verse.findUnique({
      where: { id: verseId, isActive: true }
    });

    if (!verse) {
      return res.status(404).json({ error: 'Verse not found' });
    }

    // All verses are accessible - no early return needed since we handle already solved verses below

    // Use current puzzle answer if provided (for dynamic puzzles), otherwise use original verse answer
    const correctAnswer = currentPuzzleAnswer || verse.answer;
    const isCorrect = answer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();

    if (isCorrect) {
      // Parse completed verses array
      let completedVerses = [];
      try {
        completedVerses = JSON.parse(user.completedVerses || '[]');
      } catch (error) {
        console.error('Error parsing completedVerses:', error);
        completedVerses = [];
      }

      // Check if this verse was already completed
      const wasAlreadySolved = completedVerses.includes(verse.orderIndex);

      // Add verse to completed list if not already completed
      if (!wasAlreadySolved) {
        completedVerses.push(verse.orderIndex);

        // Update database with new completion
        await prisma.user.update({
          where: { id: req.user.userId },
          data: {
            completedVerses: JSON.stringify(completedVerses),
            // Keep currentVerse for sequential progression tracking if needed
            currentVerse: verse.orderIndex === user.currentVerse ? user.currentVerse + 1 : user.currentVerse
          }
        });
      }

      const totalVerses = await prisma.verse.count({ where: { isActive: true } });
      const isGameComplete = completedVerses.length >= totalVerses;

      // Custom success messages for different verses
      let successMessage;
      if (wasAlreadySolved) {
        successMessage = 'You have already solved this verse!';
      } else if (verse.orderIndex === 1) {
        if (isGameComplete) {
          successMessage = "A wave of understanding washes over Arthur. 'Of course!' he exclaims, leaping to his feet, a wide grin spreading across his face. 'It was right here all along! The key to laughter isn't a single word or action, but the perfect delivery, the unexpected twist... the PUNCHLINE!' 🎉 CONGRATULATIONS! You have completed ALL VERSES of the Mystery Verse! You are a true puzzle master! 🎉";
        } else {
          successMessage = "A wave of understanding washes over Arthur. 'Of course!' he exclaims, leaping to his feet, a wide grin spreading across his face. 'It was right here all along! The key to laughter isn't a single word or action, but the perfect delivery, the unexpected twist... the PUNCHLINE!'";
        }
      } else if (verse.orderIndex === 2) {
        successMessage = isGameComplete ? "That's it! STREAM! You've helped Leo bridge the gap between old and new. He and Zara are now happily watching 'Cyber Voyager' in glorious HD. Adapting to change can be an upgrade! 🎉 CONGRATULATIONS! You have completed ALL VERSES of the Mystery Verse! You are a true puzzle master! 🎉" : "That's it! STREAM! You've helped Leo bridge the gap between old and new. He and Zara are now happily watching 'Cyber Voyager' in glorious HD. Adapting to change can be an upgrade!";
      } else if (verse.orderIndex === 3) {
        successMessage = isGameComplete ? "The flame brightens when divided! You have understood the Titan's wisdom. The answer is SHARE. A burden is halved when another helps to carry it. Your path forward is illuminated. 🎉 CONGRATULATIONS! You have completed ALL VERSES of the Mystery Verse! You are a true puzzle master! 🎉" : "The flame brightens when divided! You have understood the Titan's wisdom. The answer is SHARE. A burden is halved when another helps to carry it. Your path forward is illuminated.";
      } else {
        successMessage = isGameComplete ? 'Congratulations! You have completed all verses!' : 'Correct! Next verse unlocked!';
      }

      res.json({
        correct: true,
        message: successMessage,
        gameComplete: isGameComplete,
        alreadySolved: wasAlreadySolved
      });
    } else {
      // Custom incorrect messages for different verses
      let incorrectMessage;
      if (verse.orderIndex === 1) {
        incorrectMessage = "Arthur furrows his brow. 'Hmm, that doesn't quite feel right. Perhaps I'm missing something...'";
      } else if (verse.orderIndex === 2) {
        incorrectMessage = "Leo scratches his head. 'That doesn't seem right. There must be a way to bridge this gap between old and new...'";
      } else if (verse.orderIndex === 3) {
        incorrectMessage = "The weight is great, but it need not be yours alone. Look again at the symbols. How can two separate circles hold something in common? How is a burden lessened?";
      } else {
        incorrectMessage = 'Incorrect answer. Try again!';
      }

      res.json({
        correct: false,
        message: incorrectMessage
      });
    }
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getProgress = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const totalVerses = await prisma.verse.count({ where: { isActive: true } });

    // Progress is based on individual verse completions
    let completedVerses = [];
    try {
      completedVerses = JSON.parse(user.completedVerses || '[]');
    } catch (error) {
      console.error('Error parsing completedVerses:', error);
      completedVerses = [];
    }

    const solvedVerses = completedVerses.length;
    const progressPercentage = Math.round((solvedVerses / totalVerses) * 100);

    res.json({
      currentVerse: user.currentVerse,
      solvedVerses,
      totalVerses,
      progressPercentage,
      completedVerses
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const resetProgress = async (req, res) => {
  try {
    await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        currentVerse: 1,
        completedVerses: '[]'
      }
    });

    res.json({
      message: 'Progress reset successfully',
      currentVerse: 1,
      completedVerses: []
    });
  } catch (error) {
    console.error('Reset progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getNewPuzzle = async (req, res) => {
  try {
    const { id } = req.params;
    const verseId = parseInt(id);

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    const verse = await prisma.verse.findUnique({
      where: { id: verseId, isActive: true }
    });

    if (!verse) {
      return res.status(404).json({ error: 'Verse not found' });
    }

    // All verses are accessible - no unlock restriction

    // Parse completed verses array
    let completedVerses = [];
    try {
      completedVerses = JSON.parse(user.completedVerses || '[]');
    } catch (error) {
      console.error('Error parsing completedVerses:', error);
      completedVerses = [];
    }

    let newPuzzle;
    
    // Generate new puzzle based on verse type
    // Note: Verse 1 (The Humor Helix) is a fixed puzzle, so new puzzle generation is not available
    return res.status(400).json({ error: 'New puzzle generation not available for this verse' });

    const verseData = {
      id: verse.id,
      title: verse.title,
      description: newPuzzle.description,
      clues: newPuzzle.clues,
      orderIndex: verse.orderIndex,
      isUnlocked: true, // All verses are unlocked
      isSolved: completedVerses.includes(verse.orderIndex), // Check if verse is completed
      answer: newPuzzle.answer // This will be used internally for answer checking
    };

    res.json({ verse: verseData });
  } catch (error) {
    console.error('Get new puzzle error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getVerses, getVerse, submitAnswer, getProgress, resetProgress, getNewPuzzle };