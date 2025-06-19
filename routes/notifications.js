const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const verifyToken = require('../middleware/verifyToken');

router.post('/send', (req, res) => {
  const { title, message } = req.body;
  console.log(`[NOTIFY] ${title}: ${message}`);
  res.json({ success: true });
});

router.get('/logs', (req, res) => {
  res.json([{ title: 'System', message: 'All systems operational.' }]);
});

// Get notifications for the authenticated user
router.get('/', verifyToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

module.exports = router;
