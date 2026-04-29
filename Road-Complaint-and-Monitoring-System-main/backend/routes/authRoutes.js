const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { Op } = require("sequelize");
const User = require("../models/User");
const EmailVerification = require("../models/EmailVerification");
const authMiddleware = require("../middleware/authMiddleware");
const { sendOtpEmail } = require("../config/email");

const router = express.Router();
const OTP_EXPIRY_MINUTES = 5;
const VERIFIED_WINDOW_MINUTES = 15;
const OTP_RESEND_COOLDOWN_SECONDS = 60;
const OTP_MAX_REQUESTS_PER_HOUR = 5;

// Diagnostic endpoint - test if email works
router.get("/test-email", async (req, res) => {
  try {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const smtpFrom = process.env.SMTP_FROM;

    const hasEmailUser = !!emailUser;
    const hasEmailPass = !!emailPass;
    const hasSmtpFrom = !!smtpFrom;

    if (!hasEmailUser || !hasEmailPass) {
      return res.status(400).json({
        error: "Email credentials not configured",
        hasEmailUser,
        hasEmailPass,
        hasSmtpFrom,
        message: "Missing EMAIL_USER or EMAIL_PASS in environment variables"
      });
    }

    // Try to send a test email
    const { sendOtpEmail: sendTestEmail } = require("../config/email");
    await sendTestEmail({
      toEmail: emailUser,
      otp: "123456",
      expiryMinutes: 5
    });

    return res.json({
      success: true,
      message: "Test email sent successfully",
      to: emailUser,
      hasEmailUser,
      hasEmailPass,
      hasSmtpFrom
    });
  } catch (error) {
    return res.status(500).json({
      error: "Test email failed",
      message: error.message,
      code: error.code,
      details: error.response || error.toString()
    });
  }
});

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));
const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const maskEmail = (email) => {
  const value = normalizeEmail(email);
  const [namePart, domainPart] = value.split("@");
  if (!namePart || !domainPart) {
    return "invalid-email";
  }

  const first = namePart[0] || "";
  return `${first}***@${domainPart}`;
};

const hashOtp = (email, otp) => {
  const secret = process.env.OTP_SECRET || process.env.JWT_SECRET || "otp_secret";
  return crypto
    .createHmac("sha256", secret)
    .update(`${normalizeEmail(email)}:${String(otp).trim()}`)
    .digest("hex");
};

const isHashMatch = (a, b) => {
  if (!a || !b) {
    return false;
  }

  const left = Buffer.from(a);
  const right = Buffer.from(b);

  if (left.length !== right.length) {
    return false;
  }

  return crypto.timingSafeEqual(left, right);
};

router.post("/register", async (req, res) => {
  console.log("[REGISTER] req.body:", req.body);

  const { name, mobile, village, email, password } = req.body || {};

  const normalizedName = String(name || "").trim();
  const normalizedMobile = String(mobile || "").trim();
  const normalizedVillage = String(village || "").trim();
  const normalizedEmail = normalizeEmail(email);
  const normalizedPassword = String(password || "");

  const missingFields = [];
  if (!normalizedName) missingFields.push("name");
  if (!normalizedMobile) missingFields.push("mobile");
  if (!normalizedVillage) missingFields.push("village");
  if (!normalizedEmail) missingFields.push("email");
  if (!normalizedPassword.trim()) missingFields.push("password");

  if (missingFields.length > 0) {
    return res.status(400).json({
      error: `Missing required fields: ${missingFields.join(", ")}`,
      missingFields
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  try {
    // Check duplicate user only in users collection.
    const existingUserByEmail = await User.findOne({ where: { email: normalizedEmail } });
    if (existingUserByEmail) {
      return res.status(400).json({
        error: "User already exists, please login"
      });
    }

    const hashed = await bcrypt.hash(normalizedPassword, 10);

    const user = await User.create({
      name: normalizedName,
      mobile: normalizedMobile,
      village: normalizedVillage,
      email: normalizedEmail,
      password: hashed,
      isVerified: true,
      emailVerifiedAt: new Date()
    });

    await EmailVerification.destroy({ where: { email: normalizedEmail } }).catch(() => {});

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "your_jwt_secret");

    res.json({
      message: "Registered Successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        village: user.village,
        isVerified: user.isVerified
      }
    });
  } catch (err) {
    console.error("[REGISTER] ERROR:", err);

    if (err && err.code === 11000) {
      const duplicateField = Object.keys(err.keyPattern || {})[0] || "field";
      return res.status(400).json({
        error: `Duplicate ${duplicateField}. Please use a different ${duplicateField}.`
      });
    }

    return res.status(400).json({
      error: err?.message || "Registration failed"
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: "Email/mobile and password are required" });
    }

    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: identifier?.toLowerCase() },
          { mobile: identifier }
        ]
      }
    });

    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    if (!user.isVerified) {
      return res.status(403).json({
        error: "Please verify your email with OTP before login",
        requiresVerification: true,
        email: user.email
      });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "your_jwt_secret");

    res.json({
      message: "Logged in successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        village: user.village,
        isVerified: user.isVerified
      }
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Login failed" });
  }
});

// Get current user profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] }
    });
    res.json({ user });
  } catch (err) {
    res.status(400).json({ error: "Failed to fetch profile" });
  }
});

module.exports = router;
