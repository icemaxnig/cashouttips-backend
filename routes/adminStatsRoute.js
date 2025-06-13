
const express = require("express");
const router = express.Router();

// Mocked revenue history route
router.get("/revenue-history", async (req, res) => {
  try {
    const mockData = [
      { date: "2025-05-01", amount: 5000 },
      { date: "2025-05-02", amount: 7000 },
      { date: "2025-05-03", amount: 6500 },
      { date: "2025-05-04", amount: 8200 },
      { date: "2025-05-05", amount: 9300 },
    ];
    res.json(mockData);
  } catch (err) {
    console.error("Error in /revenue-history:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
