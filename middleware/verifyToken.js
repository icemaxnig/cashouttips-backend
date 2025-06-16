// middleware/verifyToken.js

const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    console.log("❌ No token provided in headers");
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🔑 Decoded token:", decoded);

    // Set user with consistent _id field
    req.user = {
      _id: decoded._id || decoded.id || decoded.userId,
      role: decoded.role || 'user',
      email: decoded.email
    };

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
