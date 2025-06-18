const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const verifyAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(403).json({ message: "❌ Missing or malformed Authorization header" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("✅ Verifying admin for user:", decoded?.adminId);
    console.log("🔍 Decoded token:", decoded);

    const admin = await Admin.findById(decoded.adminId);

    console.log("🔍 Found admin:", admin);
    console.log("🔍 Admin ID from token:", decoded.adminId);
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
