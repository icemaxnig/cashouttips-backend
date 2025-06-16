const User = require("../models/User");

exports.getBalance = async (req, res) => {
  try {
    console.log("🔍 Fetching wallet balance for user:", req.user._id);
    const user = await User.findById(req.user._id);

    if (!user) {
      console.log("❌ User not found:", req.user._id);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("✅ Wallet balance found:", {
      mainWallet: user.mainWallet,
      bonusWallet: user.bonusWallet
    });

    res.json({
      mainWallet: user.mainWallet || 0,
      bonusWallet: user.bonusWallet || 0,
    });
  } catch (error) {
    console.error("❌ Wallet fetch error:", error);
    res.status(500).json({ message: "Server error while fetching wallet balance" });
  }
};
