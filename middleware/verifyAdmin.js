const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const User = require("../models/User");

const verifyAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(403).json({ message: "❌ Missing or malformed Authorization header" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Handle different token structures: 'id', 'adminId', 'userId'
    const adminId = decoded.id || decoded.adminId || decoded.userId;

    console.log("✅ Verifying admin for user:", adminId);
    console.log("🔍 Decoded token:", decoded);

    // Check both Admin and User collections
    let admin = await Admin.findById(adminId);
    
    if (!admin) {
      // If not found in Admin collection, check User collection
      const user = await User.findById(adminId);
      if (user && user.role === "admin") {
        admin = user; // Treat user with admin role as admin
        console.log("🔍 Found admin in User collection");
      }
    } else {
      console.log("🔍 Found admin in Admin collection");
    }

    console.log("🔍 Found admin:", admin);
    console.log("🔍 Admin ID from token:", adminId);
    console.log("🔍 Admin found:", !!admin);

    if (!admin) {
      console.log("❌ Admin not found in database");
      return res.status(403).json({ message: "❌ Admin not found" });
    }

    req.user = { _id: admin._id, role: admin.role, email: admin.email };
    console.log("✅ User set in request:", req.user);
    next();
  } catch (err) {
    console.error("❌ verifyAdmin error:", err.message);
    return res.status(403).json({ message: "Access denied: Admins only" });
  }
};

module.exports = verifyAdmin;
