/**
 * In-memory store. Replace with a real DB (e.g. SQLite, PostgreSQL) for production.
 */
const users = new Map();       // userId -> { id, email, passwordHash, name, createdAt, preferences }
const progress = new Map();    // userId -> { learnedCardIds, savedCardIds, stats, lastLearningDate }
const cardsData = require('../data/cards');

function getNextId(prefix) {
  const existing = [...users.keys(), ...progress.keys()];
  let n = 1;
  while (existing.includes(`${prefix}_${n}`)) n++;
  return `${prefix}_${n}`;
}

function getUserByEmail(email) {
  return [...users.values()].find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

function getUserById(userId) {
  return users.get(userId) || null;
}

function createUser({ email, passwordHash, name, preferences = [] }) {
  const id = getNextId('user');
  const user = {
    id,
    email: email.toLowerCase(),
    passwordHash,
    name: name || email.split('@')[0],
    createdAt: new Date().toISOString(),
    preferences: preferences || [],
  };
  users.set(id, user);
  progress.set(id, {
    learnedCardIds: [],
    savedCardIds: [],
    stats: { cardsLearned: 0, streakDays: 0, topicsFollowed: preferences?.length || 0 },
    lastLearningDate: null,
  });
  return user;
}

function getProgress(userId) {
  return progress.get(userId) || null;
}

function updateProgress(userId, updates) {
  let p = progress.get(userId);
  if (!p) {
    p = { learnedCardIds: [], savedCardIds: [], stats: { cardsLearned: 0, streakDays: 0, topicsFollowed: 0 }, lastLearningDate: null };
    progress.set(userId, p);
  }
  if (updates.learnedCardIds !== undefined) p.learnedCardIds = [...new Set(updates.learnedCardIds)];
  if (updates.savedCardIds !== undefined) p.savedCardIds = [...new Set(updates.savedCardIds)];
  if (updates.stats !== undefined) p.stats = { ...p.stats, ...updates.stats };
  if (updates.lastLearningDate !== undefined) p.lastLearningDate = updates.lastLearningDate;
  return p;
}

function getAllCards() {
  return cardsData;
}

function getCardById(cardId) {
  for (const subject of cardsData) {
    for (const topic of subject.topics || []) {
      const article = (topic.articles || []).find((a) => a.id === cardId);
      if (article) return { subject, topic, article };
    }
  }
  return null;
}

module.exports = {
  users,
  progress,
  getNextId,
  getUserByEmail,
  getUserById,
  createUser,
  getProgress,
  updateProgress,
  getAllCards,
  getCardById,
};
