const express = require('express');
const { getAllVerses, createVerse, updateVerse, deleteVerse, getAllUsers } = require('../controllers/adminController');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

router.post('/login', (req, res) => {
  const { adminPassword } = req.body;
  
  if (adminPassword === process.env.ADMIN_PASSWORD) {
    res.json({ message: 'Admin login successful' });
  } else {
    res.status(401).json({ error: 'Invalid admin password' });
  }
});

router.get('/verses', authenticateAdmin, getAllVerses);
router.post('/verses', authenticateAdmin, createVerse);
router.put('/verses/:id', authenticateAdmin, updateVerse);
router.delete('/verses/:id', authenticateAdmin, deleteVerse);

router.get('/users', authenticateAdmin, getAllUsers);

module.exports = router;