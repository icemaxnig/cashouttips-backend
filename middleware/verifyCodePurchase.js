const jwt = require("jsonwebtoken");
const User = require("../models/User");

const verifyCodePurchase = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "yoursecret");
    const user = await User.findById(decoded.userId || decoded.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const tipId = req.params.id;
    if (!user.purchasedBookingCodes || !user.purchasedBookingCodes.includes(tipId)) {
      return res.status(403).json({ success: false, message: "Booking code not purchased" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: "Invalid token" });
  }
};

module.exports = verifyCodePurchase;
