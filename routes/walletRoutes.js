// routes/walletRoutes.js
const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/verifyToken");
const { getBalance } = require("../controllers/walletController");

// 💰 Wallet balance route (requires token)
router.get("/balance", verifyToken, getBalance);

module.exports = router;
