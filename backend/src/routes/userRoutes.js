const express = require('express');
const router = express.Router();
const { signup, login, getMe, updateMe } = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');

router.post('/signup', signup);
router.post('/login', login);

router.get('/me', authMiddleware, getMe);
router.patch('/me', authMiddleware, updateMe);

module.exports = router;
