
const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Debug route to decode and inspect any JWT token
router.get("/debug-token", (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(400).json({ message: "Missing or malformed Authorization header" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json({ decoded });
  } catch (err) {
    return res.status(401).json({ message: "Invalid token", error: err.message });
  }
});

module.exports = router;
