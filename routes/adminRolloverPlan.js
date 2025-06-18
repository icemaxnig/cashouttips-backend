// 📁 routes/adminRolloverPlan.js

const express = require("express");
const router = express.Router();

// ✅ Import rollover plan controllers
const {
  createPlan,
  updatePlan,
  deletePlan,
  getPublicPlans,
} = require("../controllers/rolloverPlanController");

// ✅ PUBLIC: Get all available plans (for dashboard + /subscribe page)
router.get("/rollover-plans", getPublicPlans);

// 🔒 ADMIN: Create new rollover plan
router.post("/rollover-plans", createPlan);

// 🔒 ADMIN: Update existing plan
router.put("/rollover-plan/:id", updatePlan);

// 🔒 ADMIN: Delete a plan
router.delete("/rollover-plan/:id", deletePlan);

module.exports = router;
