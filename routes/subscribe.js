const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const sendError = require("../utils/sendError");

router.post("/subscribe", auth, async (req, res) => {
  const user = req.user;

  if (user.isSubscribed) {
    return sendError(res, 400, "Already subscribed");
  }

  user.isSubscribed = true;
  user.subscriptionStart = new Date();
  user.subscriptionExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await user.save();

  res.json({ message: "Subscription activated" });
});

module.exports = router;