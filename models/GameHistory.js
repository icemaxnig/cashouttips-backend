const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  telegramId: String,
  gameType: { type: String, default: 'scratch' },
  result: String, // "win", "lose", or "retry"
  coinsWon: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GameHistory', gameSchema);
