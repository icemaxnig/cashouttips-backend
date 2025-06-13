const User = require("../models/User");

exports.getLeaderboard = async (req, res) => {
  const range = req.query.range || "all";
  const query = {};
  const now = new Date();

  if (range === "weekly") {
    now.setDate(now.getDate() - 7);
    query["referralHistory.date"] = { $gte: now };
  } else if (range === "monthly") {
    now.setDate(now.getDate() - 30);
    query["referralHistory.date"] = { $gte: now };
  }

  const users = await User.find(query)
    .sort({ referralEarnings: -1 })
    .limit(20)
    .select("name email referralEarnings");

  res.json(users);
};