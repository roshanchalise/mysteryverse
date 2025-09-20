const { PrismaClient } = require('@prisma/client');

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

module.exports = { getAllVerses, createVerse, updateVerse, deleteVerse, getAllUsers };