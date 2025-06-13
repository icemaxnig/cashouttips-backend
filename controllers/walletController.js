// controllers/walletController.js
exports.getBalance = async (req, res) => {
  try {
    const userId = req.user.id;

    // TODO: Replace with actual DB logic to fetch wallet balances
    const mainWallet = 3000; // Example mock value
    const bonusWallet = 1500; // Example mock value

    res.json({ mainWallet, bonusWallet });
  } catch (error) {
    console.error("❌ Wallet fetch error:", error);
    res.status(500).json({ message: "Server error while fetching wallet balance" });
  }
};
