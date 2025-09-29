const express = require('express');
const { getVerses, getVerse, submitAnswer, getProgress, resetProgress, getNewPuzzle, getVerseLeaderboard } = require('../controllers/gameController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/verses', getVerses);
router.get('/verse/:id', getVerse);
router.get('/verse/:id/new-puzzle', getNewPuzzle);
router.get('/verse/:id/leaderboard', getVerseLeaderboard);
router.post('/verse/:id/submit', submitAnswer);
router.get('/progress', getProgress);
router.post('/reset-progress', resetProgress);

module.exports = router;