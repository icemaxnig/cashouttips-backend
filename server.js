require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const adminRoutes = require("./routes/admin");
const rolloverTipRoutes = require("./routes/admin/rolloverTips");
const debugTokenRoute = require("./routes/debugTokenRoute");
const verifyAdmin = require("./middleware/verifyAdmin");
const rolloverRoutes = require("./routes/rolloverRoutes");
const bookingRoutes = require("./routes/booking");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

// ✅ API ROUTES
app.use("/api/auth", require("./routes/auth"));
app.use("/api/auth/telegram", require("./routes/authTelegram"));
app.use("/api/admin", require("./routes/adminAuth"));
app.use("/api/admin", require("./routes/admin/rolloverPlans"));
app.use("/api/admin", require("./routes/admin/wallet"));
app.use("/api/admin", require("./routes/admin/walletAdjust"));
app.use("/api/admin", require("./routes/admin/rolloverTips"));
app.use("/api/users", require("./routes/user"));
app.use("/api/booking", require("./routes/booking"));
app.use("/api/booking-code", require("./routes/booking"));
app.use("/api/booking-codes", require("./routes/bookingCodes"));
app.use("/api/rollover", rolloverRoutes);
app.use("/api/rollover-tips", require("./routes/rolloverTips"));
app.use("/api/free-tip", require("./routes/freeTip"));
app.use("/api/free-tips", require("./routes/freeTips"));
app.use("/api/settings", require("./routes/settings"));
app.use("/api/tips", require("./routes/tips"));
app.use("/api/wallet", require("./routes/walletRoutes"));
app.use("/api/send-otp", require("./routes/sendOtp"));
app.use("/api/codes", require("./routes/codes"));
app.use("/api/rollover-plans", require("./routes/public/rolloverPlansPublic"));
app.use("/api/rollover", require("./routes/rolloverRoutes"));
app.use("/api", require("./routes/rolloverRoutes"));
app.use("/api/booking", bookingRoutes);
app.use("/api/debug", debugTokenRoute);

// ✅ Legacy/Non-API
app.use("/admin", require("./routes/adminRolloverPlan"));
app.use("/rollover", require("./routes/publicRollover"));

// 🧹 Start Cron Jobs
const startRolloverCleanupJob = require("./cron/rolloverCleanup");
startRolloverCleanupJob();

// ❌ 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found" });
});

// 🧯 Error Handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

// 🚀 MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log(`✅ MongoDB connected`);
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log("✅ ROUTES ADMIN.JS IS EXECUTING");
    const rolloverGameController = require("./controllers/rolloverGameController");
    console.log("🔎 createRolloverGame:", typeof rolloverGameController?.createRolloverGame);
  });
})
.catch(err => {
  console.error("❌ MongoDB connection error:", err);
});