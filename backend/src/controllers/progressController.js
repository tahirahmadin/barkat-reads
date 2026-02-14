const store = require('../store');

function getProgress(req, res) {
  try {
    const data = store.getProgress(req.user.userId);
    if (!data) {
      return res.json({
        learnedCardIds: [],
        savedCardIds: [],
        stats: { cardsLearned: 0, streakDays: 0, topicsFollowed: 0 },
        lastLearningDate: null,
      });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get progress' });
  }
}

function updateProgress(req, res) {
  try {
    const { learnedCardIds, savedCardIds, stats, lastLearningDate } = req.body;
    const updates = {};
    if (Array.isArray(learnedCardIds)) updates.learnedCardIds = learnedCardIds;
    if (Array.isArray(savedCardIds)) updates.savedCardIds = savedCardIds;
    if (stats && typeof stats === 'object') updates.stats = stats;
    if (lastLearningDate !== undefined) updates.lastLearningDate = lastLearningDate;
    const data = store.updateProgress(req.user.userId, updates);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update progress' });
  }
}

module.exports = {
  getProgress,
  updateProgress,
};
