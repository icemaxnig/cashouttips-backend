
const express = require("express");
const router = express.Router();
const AdminSettings = require("../models/AdminSettings");

// GET /api/admin/settings
router.get("/", async (req, res) => {
  try {
    const config = await AdminSettings.findOne();
    res.json(config || {});
  } catch (err) {
    console.error("Failed to fetch settings:", err);
    res.status(500).json({ message: "Error loading settings" });
  }
});

// POST /api/admin/settings
router.post("/", async (req, res) => {
  try {
    console.log("Incoming POST /admin/settings payload:", req.body);

    let settings = await AdminSettings.findOne();
    if (!settings) {
      settings = new AdminSettings(req.body);
    } else {
      Object.assign(settings, req.body);
    }

    await settings.save();
    res.json({ message: "Settings updated successfully" });
  } catch (err) {
    console.error("❌ Failed to save settings:", err);
    res.status(500).json({ message: "Error saving settings" });
  }
});

module.exports = router;
