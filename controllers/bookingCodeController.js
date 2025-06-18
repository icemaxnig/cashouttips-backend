const BookingCode = require("../models/BookingCode");
const Wallet = require("../models/Wallet");

// ✅ Admin uploads a new booking code
const uploadBookingCode = async (req, res) => {
  try {
    const {
      bookingCode,
      totalOdds,
      platform,
      price,
      confidence,
      adminNote,
      category,
      urgency,
      slotLimit,
      expiryMinutes,
    } = req.body;

    if (!bookingCode || !totalOdds || !platform || !price || !expiryMinutes) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const successRate = parseInt(confidence || 75);
    const expiresAt = new Date(Date.now() + expiryMinutes * 60000);

    const codeObj = await BookingCode.create({
      code: bookingCode,
      odds: totalOdds,
      price,
      bookmaker: platform,
      successRate,
      note: adminNote,
      category,
      urgencyTag: urgency,
      slotLimit,
      expiresAt,
      postedAt: new Date(),
      purchasedBy: [],
      purchaseLog: [],
    });

    res.status(201).json(codeObj);
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
};

// ✅ Public - Get all available booking codes (not expired)
const getBookingCodes = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const userId = req.user._id;
    const codes = await BookingCode.find({ 
      expiresAt: { $gt: new Date() } 
    })
    .sort({ postedAt: -1 })
    .lean();

    const enriched = codes.map((code) => {
      const alreadyPurchased = code.purchasedBy.some(id => id.toString() === userId.toString());
      const buyerCount = code.purchasedBy.length;
      const purchaseEntry = code.purchaseLog?.find(p => p.userId.toString() === userId.toString());

      return {
        ...code,
        alreadyPurchased,
        buyerCount,
        purchaseTime: purchaseEntry?.time || null,
      };
    });

    res.json(enriched);
  } catch (err) {
    console.error("Error fetching booking codes:", err);
    res.status(500).json({ error: "Failed to fetch booking codes" });
  }
};

// ✅ Logged-in user - Buy booking code (deduct from wallet, add to purchased)
const buyBookingCode = async (req, res) => {
  const userId = req.user.id;
  const codeId = req.params.id;

  try {
    const code = await BookingCode.findById(codeId);
    if (!code) return res.status(404).json({ error: "Booking code not found" });

    if (new Date() > code.expiresAt)
      return res.status(400).json({ error: "Code has expired" });

    if (code.purchasedBy.includes(userId))
      return res.status(400).json({ error: "Already purchased" });

    if (code.slotLimit && code.purchasedBy.length >= code.slotLimit)
      return res.status(400).json({ error: "Slots filled" });

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) return res.status(404).json({ error: "Wallet not found" });

    const { price } = code;
    let from = "";

    if (wallet.wallet >= price) {
      wallet.wallet -= price;
      from = "wallet";
    } else if (wallet.bonusWallet >= price) {
      wallet.bonusWallet -= price;
      from = "bonusWallet";
    } else {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    await wallet.save();

    code.purchasedBy.push(userId);
    code.purchaseLog.push({ userId, time: new Date() });
    await code.save();

    res.json({
      success: true,
      message: `Booking code purchased with ₦${price} from ${from}`,
      code,
    });
  } catch (err) {
    console.error("Purchase error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// ✅ Get all codes a user has purchased
const getUserPurchasedCodes = async (req, res) => {
  try {
    const userId = req.user.id;
    const codes = await BookingCode.find({ purchasedBy: userId });
    res.json(codes);
  } catch (err) {
    console.error("Fetch user codes error:", err);
    res.status(500).json({ error: "Failed to fetch purchased codes" });
  }
};

module.exports = {
  uploadBookingCode,
  getBookingCodes,
  buyBookingCode,
  getUserPurchasedCodes,
};
