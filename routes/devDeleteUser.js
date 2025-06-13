const express = require("express");
const router = express.Router();
const User = require("../models/User");

// WARNING: Use only in development!
router.post("/delete-user", async (req, res) => {
  const { email } = req.body;
  try {
    const deleted = await User.findOneAndDelete({ email });
    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted", email });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;