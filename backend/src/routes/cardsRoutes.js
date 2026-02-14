const express = require('express');
const router = express.Router();
const { getAllCards, getSavedCards, saveCard, unsaveCard } = require('../controllers/cardsController');
const { authMiddleware } = require('../middleware/auth');

// Public: fetch all cards (no auth required)
router.get('/', getAllCards);

// Protected: saved cards and save/unsave
router.get('/saved', authMiddleware, getSavedCards);
router.post('/saved', authMiddleware, saveCard);
router.delete('/saved', authMiddleware, unsaveCard);

module.exports = router;
