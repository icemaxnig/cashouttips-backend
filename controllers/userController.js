const bcrypt = require("bcryptjs");

exports.getProfile = async (req, res) => {
  res.json(req.user);
};

exports.updateEmail = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    req.user.email = email;
    await req.user.save();
    res.json({ message: "Email updated", email });
  } catch (err) {
    res.status(500).json({ message: "Failed to update email" });
  }
};

exports.updatePassword = async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ message: "Password is required" });

  try {
    const hashed = await bcrypt.hash(password, 10);
    req.user.password = hashed;
    await req.user.save();
    res.json({ message: "Password updated" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update password" });
  }
};