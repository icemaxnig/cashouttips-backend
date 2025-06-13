
const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const Settings = require("../models/Settings");
const sendEmail = require("../utils/sendEmail");

// GET admin settings
router.get("/", async (req, res) => {
  try {
    let config = await Settings.findOne();
    if (!config) config = await Settings.create({});
    const merged = {
      ...(config.values || {}),
      allowMultipleRolloverPosts: config.allowMultipleRolloverPosts || false
    };
    res.json(merged);
  } catch (err) {
    console.error("Failed to load settings:", err);
    res.status(500).json({ error: "Failed to load settings" });
  }
});

// UPDATE admin settings
router.put("/", async (req, res) => {
  try {
    let config = await Settings.findOne();
    if (!config) config = new Settings({});

    if ("allowMultipleRolloverPosts" in req.body) {
      config.allowMultipleRolloverPosts = req.body.allowMultipleRolloverPosts;
    }

    const { allowMultipleRolloverPosts, ...rest } = req.body;
    config.values = rest;

    await config.save();
    res.json({ success: true });
  } catch (err) {
    console.error("Failed to update settings:", err);
    res.status(400).json({ error: "Failed to update settings" });
  }
});

// POST test email
router.post("/test-email", async (req, res) => {
  const { to } = req.body;
  try {
    const config = await Settings.findOne();
    const s = config.values;

    const transporter = nodemailer.createTransport({
      host: s.smtpHost,
      port: s.smtpPort,
      secure: false,
      auth: {
        user: s.smtpEmail,
        pass: s.smtpPassword,
      },
    });

    await transporter.sendMail({
      from: s.smtpEmail,
      to,
      subject: "Test Email from CashoutTips",
      text: "SMTP is working!",
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Test email failed" });
  }
});

// POST tesst SMTP
router.post("/test-smtp", async (req, res) => {
  try {
    const settings = await Settings.findOne();
    const values = settings?.values || {};

    const testTo = values.smtpFrom || process.env.SMTP_FROM;
    if (!testTo) {
      return res.status(400).json({ message: "Missing 'From Email' in SMTP config." });
    }

    await sendEmail(testTo, "SMTP Test - CashoutTips", "<p>This is a test email from your admin panel.</p>");

    res.json({ message: "Test email sent" });
  } catch (err) {
    console.error("SMTP test failed:", err);
    res.status(500).json({ message: "SMTP test failed", error: err.message });
  }
});

module.exports = router;
