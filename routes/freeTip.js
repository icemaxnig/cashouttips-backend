const express = require("express");
const router = express.Router();
const FreeTip = require("../models/FreeTip");
const sendError = require("../utils/sendError");

// POST /api/freetip
router.post("/", async (req, res) => {
  try {
    const { sportType, time, league, teams, date } = req.body;
    const newTip = new FreeTip({
      sportType,
      time,
      league,
      teams,
      date,
    });

    await newTip.save();
    res.status(201).json({ message: "Free tip uploaded successfully" });
  } catch (err) {
    console.error("Free Tip Upload Error:", err);
    sendError(res, 500, "Failed to upload free tip", err);
  }
});

// GET /api/freetip/latest
router.get("/latest", async (req, res) => {
  try {
    const latestTip = await FreeTip.findOne().sort({ createdAt: -1 });
    res.json(latestTip);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch latest free tip" });
  }
});

module.exports = router;
