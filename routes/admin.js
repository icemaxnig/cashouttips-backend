const express = require("express");
const router = express.Router();
const User = require("../models/User");

const {
  adminLogin,
  adminForgotPassword,
  adminResetPassword
} = require("../controllers/adminController");

const {
  getDeletedUsers,
  restoreUser,
  permanentDeleteUser
} = require("../controllers/authController");

const { createRolloverGame } = require("../controllers/rolloverGameController");

const verifyToken = require("../middleware/verifyToken");
const checkRole = require("../middleware/roleMiddleware");
const verifyAdminToken = [verifyToken, checkRole("admin")];
const verifyAdmin = require("../middleware/verifyAdmin");


// Routes
router.post("/login", adminLogin);
router.post("/forgot-password", adminForgotPassword);
router.post("/reset-password", adminResetPassword);

router.get("/users/deleted", verifyAdminToken, getDeletedUsers);
router.patch("/users/:id/restore", verifyAdminToken, restoreUser);
router.delete("/users/:id/permanent", verifyAdminToken, permanentDeleteUser);

router.post("/rollover-game", verifyAdminToken, createRolloverGame);

router.get("/expiring-users", verifyAdmin, async (req, res) => {
  try {
    const now = new Date();
    const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const last7days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const users = await User.find({
      subscriptionExpires: { $gte: last7days, $lte: in7days }
    }).select("email subscriptionExpires isSubscribed subscriptionStart");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch expiring users" });
  }
});

module.exports = router;