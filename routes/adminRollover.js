
// routes/adminRollover.js
const express = require('express');
const router = express.Router();
const RolloverTip = require('../models/RolloverTip');

// GET all tips
router.get('/', async (req, res) => {
  const tips = await RolloverTip.find().populate('planId');
  res.json(tips);
});

// GET single tip
router.get('/:id', async (req, res) => {
  const tip = await RolloverTip.findById(req.params.id);
  if (!tip) return res.status(404).send('Not found');
  res.json(tip);
});

// POST create tip
router.post('/', async (req, res) => {
  const tip = new RolloverTip(req.body);
  await tip.save();
  res.json(tip);
});

// PUT update tip
router.put('/:id', async (req, res) => {
  const updated = await RolloverTip.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// DELETE tip
router.delete('/:id', async (req, res) => {
  await RolloverTip.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
