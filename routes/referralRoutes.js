const express = require("express");
const router = express.Router();
const { getLeaderboard } = require("../controllers/referralController");

router.get("/leaderboard", getLeaderboard);

module.exports = router;