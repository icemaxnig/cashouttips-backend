require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Wallet = mongoose.models.Wallet || require("../models/Wallet");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    const users = await User.find();
    for (const user of users) {
      if (!user?._id || !user?.email) {
        console.warn("⛔ Skipping invalid user record:", user);
        continue;
      }

      const existingWallet = await Wallet.findOne({ user: user._id });
      const balance = typeof user.mainWallet === "number" ? user.mainWallet : 0;
      const bonusBalance = typeof user.bonusWallet === "number" ? user.bonusWallet : 0;

      if (!existingWallet) {
        await Wallet.create({
          user: user._id,
          balance,
          bonusBalance,
        });
        console.log(`✅ Wallet created for ${user.email} → ₦${balance} main / ₦${bonusBalance} bonus`);
      } else {
        let updated = false;
        if (existingWallet.balance !== balance) {
          existingWallet.balance = balance;
          updated = true;
        }
        if (existingWallet.bonusBalance !== bonusBalance) {
          existingWallet.bonusBalance = bonusBalance;
          updated = true;
        }
        if (updated) {
          await existingWallet.save();
          console.log(`🔁 Wallet updated for ${user.email}`);
        } else {
          console.log(`⚠️ Wallet already correct for ${user.email}`);
        }
      }
    }

    console.log("🎉 All user wallets synced from user model.");
    process.exit();
  } catch (err) {
    console.error("❌ Migration error:", err);
    process.exit(1);
  }
})();
