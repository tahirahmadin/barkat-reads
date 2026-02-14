const store = require('../store');

function getAllCards(req, res) {
  try {
    const cards = store.getAllCards();
    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
}

function getSavedCards(req, res) {
  try {
    const progress = store.getProgress(req.user.userId);
    const savedIds = progress?.savedCardIds || [];
    const allSubjects = store.getAllCards();
    const saved = [];
    for (const subject of allSubjects) {
      for (const topic of subject.topics || []) {
        for (const article of topic.articles || []) {
          if (savedIds.includes(article.id)) {
            saved.push({
              ...article,
              subject: subject.title,
              topic: topic.title,
            });
          }
        }
      }
    }
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch saved cards' });
  }
}

function saveCard(req, res) {
  try {
    const { cardId } = req.body;
    if (!cardId) {
      return res.status(400).json({ error: 'cardId is required' });
    }
    const found = store.getCardById(cardId);
    if (!found) {
      return res.status(404).json({ error: 'Card not found' });
    }
    const progress = store.getProgress(req.user.userId);
    const savedIds = progress?.savedCardIds || [];
    if (savedIds.includes(cardId)) {
      return res.json({ message: 'Already saved', savedCardIds: savedIds });
    }
    const updated = store.updateProgress(req.user.userId, {
      savedCardIds: [...savedIds, cardId],
    });
    res.json({ message: 'Card saved', savedCardIds: updated.savedCardIds });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save card' });
  }
}

function unsaveCard(req, res) {
  try {
    const { cardId } = req.body;
    if (!cardId) {
      return res.status(400).json({ error: 'cardId is required' });
    }
    const progress = store.getProgress(req.user.userId);
    const savedIds = progress?.savedCardIds || [];
    const updatedIds = savedIds.filter((id) => id !== cardId);
    const updated = store.updateProgress(req.user.userId, {
      savedCardIds: updatedIds,
    });
    res.json({ message: 'Card removed from saved', savedCardIds: updated.savedCardIds });
  } catch (err) {
    res.status(500).json({ error: 'Failed to unsave card' });
  }
}

module.exports = {
  getAllCards,
  getSavedCards,
  saveCard,
  unsaveCard,
};
