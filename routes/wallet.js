const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

router.get("/balance", auth, async (req, res) => {
  const user = req.user;
  res.json({
    mainWallet: user.mainWallet || 0,
    bonusWallet: user.bonusWallet || 0,
  });
});

router.post("/fund", verifyUser, async (req, res) => {
  const { amount } = req.body;
  const user = await User.findById(req.user._id);
  user.wallet.mainWallet += parseFloat(amount);
  await user.save();
  res.json({ message: "Wallet funded", wallet: user.wallet });
});


module.exports = router;