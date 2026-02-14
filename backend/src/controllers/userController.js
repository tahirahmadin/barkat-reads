const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');
const store = require('../store');

const SALT_ROUNDS = 10;

function signup(req, res) {
  try {
    const { email, password, name, preferences } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    if (store.getUserByEmail(email)) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const passwordHash = bcrypt.hashSync(password, SALT_ROUNDS);
    const user = store.createUser({
      email,
      passwordHash,
      name: name || email.split('@')[0],
      preferences: Array.isArray(preferences) ? preferences : [],
    });
    const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '7d' });
    const { passwordHash: _, ...publicUser } = user;
    res.status(201).json({
      message: 'User created',
      token,
      user: publicUser,
    });
  } catch (err) {
    res.status(500).json({ error: 'Signup failed' });
  }
}

function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = store.getUserByEmail(email);
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '7d' });
    const { passwordHash: _, ...publicUser } = user;
    res.json({ token, user: publicUser });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
}

function getMe(req, res) {
  try {
    const user = store.getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { passwordHash: _, ...publicUser } = user;
    res.json(publicUser);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get user' });
  }
}

function updateMe(req, res) {
  try {
    const user = store.getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { name, preferences } = req.body;
    if (name !== undefined) user.name = name;
    if (Array.isArray(preferences)) user.preferences = preferences;
    const { passwordHash: _, ...publicUser } = user;
    res.json(publicUser);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
}

module.exports = {
  signup,
  login,
  getMe,
  updateMe,
};
