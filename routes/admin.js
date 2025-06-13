const express = require("express");
const router = express.Router();

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

const rolloverGameController = require("../controllers/rolloverGameController");

const verifyToken = require("../middleware/verifyToken");
const checkRole = require("../middleware/roleMiddleware");
const verifyAdminToken = [verifyToken, checkRole("admin")];


// Routes
router.post("/login", adminLogin);
router.post("/forgot-password", adminForgotPassword);
router.post("/reset-password", adminResetPassword);

router.get("/users/deleted", verifyAdminToken, getDeletedUsers);
router.patch("/users/:id/restore", verifyAdminToken, restoreUser);
router.delete("/users/:id/permanent", verifyAdminToken, permanentDeleteUser);

router.post("/rollover-game", verifyAdminToken, rolloverGameController.createRolloverGame);

module.exports = router;