// routes/rolloverPlanRoutes.js
const express = require("express");
const router = express.Router();
const { getPublicPlans } = require("../controllers/rolloverPlanController");

router.get("/rollover-plans", getPublicPlans); // ✅ This should fetch from the RolloverPlan model

module.exports = router;
