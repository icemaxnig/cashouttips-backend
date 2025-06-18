// middleware/verifyToken.js

const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    console.log("❌ No token provided in headers");
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🔑 Decoded token:", decoded);

    // Check if this is an admin token
    if (decoded.adminId) {
      console.log("🔍 Admin token detected, fetching admin user");
      const admin = await Admin.findById(decoded.adminId);
      
      if (!admin) {
        console.log("❌ Admin not found in database");
        return res.status(403).json({ message: "Admin not found" });
      }

      req.user = {
        _id: admin._id,
        role: admin.role || 'admin',
        email: admin.email
      };
    } else {
      // Regular user token
      req.user = {
        _id: decoded._id || decoded.id || decoded.userId,
        role: decoded.role || 'user',
        email: decoded.email
      };
    }

    console.log("✅ User set in request:", req.user);
    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = verifyToken;
