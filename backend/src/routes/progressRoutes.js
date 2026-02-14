const express = require('express');
const router = express.Router();
const { getProgress, updateProgress } = require('../controllers/progressController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', getProgress);
router.patch('/', updateProgress);
router.put('/', updateProgress);

module.exports = router;
