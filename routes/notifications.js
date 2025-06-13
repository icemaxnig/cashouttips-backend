const express = require('express');
const router = express.Router();

router.post('/send', (req, res) => {
  const { title, message } = req.body;
  console.log(`[NOTIFY] ${title}: ${message}`);
  res.json({ success: true });
});

router.get('/logs', (req, res) => {
  res.json([{ title: 'System', message: 'All systems operational.' }]);
});

module.exports = router;
