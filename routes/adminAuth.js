const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const User = require("../models/User");
const verifyAdminToken = require("../middleware/adminAuthMiddleware");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ adminId: admin._id, role: admin.role }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });

    return res.status(200).json({
      success: true,
      token,
      admin: {
        id: admin._id,
        email: admin.email
      }
    });
  } catch (err) {
    console.error("Admin login error:", err.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/me", verifyAdminToken, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.adminId).select("-password");
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    return res.status(200).json({ success: true, admin });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// 1. Get all users
router.get("/users", verifyAdminToken, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    return res.status(200).json({ success: true, users });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error fetching users" });
  }
});

// 2. Reset user password
router.post("/users/:id/reset-password", verifyAdminToken, async (req, res) => {
   const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ success: false, message: "New password is required" });
  }

  try {
    const hashed = await bcrypt.hash(newPassword, 10);
    const user = await User.findByIdAndUpdate(req.params.id, { password: hashed });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, message: "Password reset" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Reset failed" });
  }
});

// 3. Delete (ban) a user
router.delete("/users/:id", verifyAdminToken, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, message: "User soft-deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Deletion failed" });
  }
});

router.post("/users", verifyAdminToken, async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password required" });
  }

  try {
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ success: false, message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashed,
      role: role || "user",
      isNewUser: false
    });

    await user.save();

    return res.status(201).json({ success: true, message: "User created", userId: user._id });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to create user" });
  }
});

// View soft-deleted users
router.get("/users/deleted", verifyAdminToken, async (req, res) => {
  try {
    const deletedUsers = await User.find({ isDeleted: true }).select("-password");
    return res.status(200).json({ success: true, users: deletedUsers });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to get deleted users" });
  }
});

// Restore soft-deleted user
router.patch("/users/:id/restore", verifyAdminToken, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isDeleted: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, message: "User restored", user });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Restore failed" });
  }
});

// Permanently delete a user
router.delete("/users/:id/permanent", verifyAdminToken, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, message: "User permanently deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Permanent deletion failed" });
  }
});




module.exports = router;
