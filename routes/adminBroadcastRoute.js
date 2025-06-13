const express = require('express');
const router = express.Router();
const User = require('../models/User');
const axios = require('axios');
const { loadSettings } = require('../utils/loadSettings');

router.post('/broadcast', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  const users = await User.find({}, 'telegramId');
  const settings = await loadSettings();
  const botToken = settings.botToken;

  for (const user of users) {
    try {
      await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        chat_id: user.telegramId,
        text: message,
      });
    } catch (err) {
      console.log(`❌ Failed to message ${user.telegramId}`);
    }
  }

  res.json({ success: true });
});

module.exports = router;
