// routes/admin/index.js
const express = require("express");
const router = express.Router();

const rolloverPlans = require("./rolloverPlans");
const rolloverTips = require("./rolloverTips");
const rolloverGameController = require("../../controllers/rolloverGameController"); // ✅ FIXED

router.use("/rollover-plans", rolloverPlans);
router.use("/rollover-tips", rolloverTips);

// ✅ NEW: Admin uploads a single rollover game (1 game → 1 tip)
router.post("/rollover-game", rolloverGameController.createRolloverGame); // ✅ FIXED

module.exports = router;
