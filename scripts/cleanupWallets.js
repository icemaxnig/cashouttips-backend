const mongoose = require("mongoose");
require("dotenv").config();

const Wallet = require("../models/Wallet");

async function cleanupWallets() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Find and remove wallets with null user field
    const result = await Wallet.deleteMany({ user: null });
    console.log(`🗑️ Removed ${result.deletedCount} wallets with null user`);

    // Find and remove wallets with undefined user field
    const result2 = await Wallet.deleteMany({ user: { $exists: false } });
    console.log(`🗑️ Removed ${result2.deletedCount} wallets with undefined user`);

    // Check for any remaining problematic wallets
    const problematicWallets = await Wallet.find({
      $or: [
        { user: null },
        { user: { $exists: false } }
      ]
    });

    if (problematicWallets.length > 0) {
      console.log(`⚠️ Found ${problematicWallets.length} remaining problematic wallets`);
      console.log(problematicWallets);
    } else {
      console.log("✅ No problematic wallets found");
    }

    console.log("✅ Wallet cleanup completed");
  } catch (error) {
    console.error("❌ Error during wallet cleanup:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

cleanupWallets(); 