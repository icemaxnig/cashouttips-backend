const express = require("express");
const router = express.Router();
const User = require("../models/User");
const sendError = require("../utils/sendError");

// WARNING: Use only in development!
router.post("/delete-user", async (req, res) => {
  const { email } = req.body;
  try {
    const deleted = await User.findOneAndDelete({ email });
    if (!deleted) {
      return sendError(res, 404, "User not found");
    }
    res.status(200).json({ message: "User deleted", email });
  } catch (err) {
    console.error("Delete user error:", err);
    sendError(res, 500, "Server error");
  }
});

module.exports = router;