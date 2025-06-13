const nodemailer = require("nodemailer");
const Settings = require("../models/Settings");

async function sendEmail(to, subject, html) {
  const config = await Settings.findOne();
  const values = config?.values || {};

  const smtpUser = values.smtpUser || process.env.SMTP_USER;
  const smtpPass = values.smtpPass || process.env.SMTP_PASS;
  const smtpHost = values.smtpHost || process.env.SMTP_HOST;
  const smtpPort = values.smtpPort || process.env.SMTP_PORT;
  const smtpFrom = values.smtpFrom || process.env.SMTP_FROM;

  if (!smtpUser || !smtpPass || !smtpHost || !smtpPort || !smtpFrom) {
    throw new Error("SMTP credentials are missing from .env or database.");
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort == 465, // use TLS for 465
    auth: { user: smtpUser, pass: smtpPass },
  });

  return transporter.sendMail({
    from: smtpFrom,
    to,
    subject,
    html,
  });
}

module.exports = sendEmail;
