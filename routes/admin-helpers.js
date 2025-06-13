
const express = require("express");
const router = express.Router();
const BookingPurchase = require("../models/BookingPurchase");
const User = require("../models/User");

// GET: Booking Purchase History
router.get("/booking/history", async (req, res) => {
  try {
    const purchases = await BookingPurchase.find().sort({ createdAt: -1 });
    const users = await User.find({}, "_id email");
    const userMap = {};
    users.forEach(u => userMap[u._id] = u.email);

    res.json({ purchases, users: userMap });
  } catch {
    res.status(500).json({ error: "Failed to load purchases or users" });
  }
});

// PUT: Update User Role
router.put("/user-role/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true }
    );
    res.json(user);
  } catch {
    res.status(400).json({ error: "Failed to update user role" });
  }
});

// GET: Referral Leaderboard
router.get("/referral-leaderboard", async (req, res) => {
  try {
    const users = await User.find();
    const leaderboard = users
      .map((u) => ({
        email: u.email,
        count: u.referrals?.length || 0,
        earnings: u.totalReferralEarnings || 0,
      }))
      .filter((u) => u.count > 0 || u.earnings > 0);

    res.json(leaderboard);
  } catch {
    res.status(500).json({ error: "Failed to load referral leaderboard" });
  }
});

module.exports = router;
