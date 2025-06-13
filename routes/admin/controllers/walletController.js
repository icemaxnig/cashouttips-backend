// 📁 admin/controllers/walletController.js

const User = require("../../models/User");

exports.adjustWallet = async (req, res) => {
  const { userId, amount, walletType, mode } = req.body;

  if (!userId || !amount || !walletType || !mode) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isCredit = mode === "credit";
    const value = parseFloat(amount);

    if (walletType === "main") {
      if (!isCredit && user.mainWallet < value)
        return res.status(400).json({ message: "Insufficient main wallet" });
      user.mainWallet = isCredit ? user.mainWallet + value : user.mainWallet - value;
    } else if (walletType === "bonus") {
      if (!isCredit && user.bonusWallet < value)
        return res.status(400).json({ message: "Insufficient bonus wallet" });
      user.bonusWallet = isCredit ? user.bonusWallet + value : user.bonusWallet - value;
    } else {
      return res.status(400).json({ message: "Invalid wallet type" });
    }

    await user.save();
    res.status(200).json({ message: "Wallet adjusted successfully" });
  } catch (err) {
    console.error("Wallet adjustment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
