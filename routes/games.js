const express = require('express');
const router = express.Router();
const GameHistory = require('../models/GameHistory');
const User = require('../models/User');

// POST /games/play
router.post('/play', async (req, res) => {
  const { telegramId } = req.body;
  const won = Math.random() < 0.6; // 60% win chance
  const coins = won ? 10 : 0;

  await GameHistory.create({
    telegramId,
    result: won ? 'win' : 'lose',
    coinsWon: coins
  });

  // Add coins to user
  if (won) {
    await User.updateOne({ telegramId }, { $inc: { coins: coins } });
  }

  res.json({ result: won ? 'win' : 'lose', coins });
});

// GET /games/:telegramId
router.get('/:telegramId', async (req, res) => {
  const games = await GameHistory.find({ telegramId: req.params.telegramId }).sort({ createdAt: -1 }).limit(10);
  res.json(games);
});

module.exports = router;
