const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/:telegramId', async (req, res) => {
  try {
    const user = await User.findOne({ telegramId: req.params.telegramId });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ coins: user.coins || 0 });
  } catch {
    res.status(500).json({ error: 'Failed to fetch coins' });
  }
});

module.exports = router;
