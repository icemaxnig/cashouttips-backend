const Withdrawal = require('../models/Withdrawal');

exports.requestWithdrawal = async (req, res) => {
  const { telegramId, amount, method, details } = req.body;
  try {
    const withdrawal = await Withdrawal.create({
      telegramId, amount, method, details, status: 'pending'
    });
    res.json(withdrawal);
  } catch (err) {
    res.status(500).json({ error: 'Failed to request withdrawal' });
  }
};

exports.getMyWithdrawals = async (req, res) => {
  const { telegramId } = req.params;
  try {
    const data = await Withdrawal.find({ telegramId }).sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch withdrawals' });
  }
};

exports.approveWithdrawal = async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await Withdrawal.findByIdAndUpdate(id, { status: 'approved' }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve' });
  }
};
