const BookingCode = require('../models/BookingCode');

exports.uploadBookingCode = async (req, res) => {
  const { code, odds, bookmaker, urgencyTag, slotLimit, expiresInHours, expiresInMinutes } = req.body;

  let successRate = 45;
  if (odds <= 4) successRate = 98;
  else if (odds <= 10) successRate = 90;
  else if (odds <= 20) successRate = 85;
  else if (odds <= 30) successRate = 80;
  else if (odds <= 50) successRate = 70;
  else if (odds <= 100) successRate = 60;
  else if (odds <= 200) successRate = 50;

  const priceMap = {
    4: 3000, 10: 2500, 20: 2000, 30: 1500, 50: 1000, 100: 500, 200: 400
  };
  let price = 300;
  for (const max of Object.keys(priceMap)) {
    if (odds <= +max) {
      price = priceMap[max];
      break;
    }
  }

  try {
    const expiresAt = new Date(Date.now() + ((expiresInHours * 60 + expiresInMinutes) * 60000));
    const codeObj = await BookingCode.create({
      code, odds, bookmaker, urgencyTag, slotLimit,
      price, successRate, expiresAt
    });
    res.json(codeObj);
  } catch {
    res.status(500).json({ error: 'Failed to upload code' });
  }
};

exports.getBookingCodes = async (req, res) => {
  try {
    const codes = await BookingCode.find({ expiresAt: { $gt: new Date() } }).sort({ postedAt: -1 });
    res.json(codes);
  } catch {
    res.status(500).json({ error: 'Fetch failed' });
  }
};
