const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

router.post("/subscribe", auth, async (req, res) => {
  const user = req.user;

  if (user.isSubscribed) {
    return res.status(400).json({ message: "Already subscribed" });
  }

  user.isSubscribed = true;
  user.subscriptionStart = new Date();
  await user.save();

  res.json({ message: "Subscription activated" });
});

module.exports = router;