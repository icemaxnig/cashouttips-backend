
const axios = require("axios");

const verifyTurnstile = async (req, res, next) => {
  const token = req.body.captchaToken;

  if (!token) {
    return res.status(400).json({ message: "CAPTCHA token is required" });
  }

  try {
    const response = await axios.post(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET,
        response: token,
        remoteip: req.ip,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (response.data.success) {
      next();
    } else {
      res.status(403).json({ message: "Failed CAPTCHA verification" });
    }
  } catch (err) {
    console.error("Turnstile verification error:", err.message);
    res.status(500).json({ message: "CAPTCHA verification failed" });
  }
};

module.exports = verifyTurnstile;
