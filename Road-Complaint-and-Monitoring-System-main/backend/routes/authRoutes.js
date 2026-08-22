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
const { sendOtpEmail, sendResetPasswordEmail } = require("../config/email");
 
const router = express.Router();
const OTP_EXPIRY_MINUTES = 5;
const VERIFIED_WINDOW_MINUTES = 15;
const OTP_RESEND_COOLDOWN_SECONDS = 60;
const OTP_MAX_REQUESTS_PER_HOUR = 5;
const RESET_TOKEN_EXPIRY_MINUTES = 15;
 
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
 
// Create test user for development/testing
router.post("/create-test-user", async (req, res) => {
  try {
    const testUser = {
      name: "Test User",
      email: "test@example.com",
      mobile: "9999999999",
      village: "Test Village",
      password: "test@123",
      isVerified: true
    };
 
    // Check if test user already exists
    let user = await User.findOne({
      where: { email: testUser.email }
    });
 
    if (user) {
      return res.json({
        message: "Test user already exists",
        email: testUser.email,
        password: testUser.password,
        note: "Use these credentials to login"
      });
    }
 
    // Hash password
    const hashedPassword = await bcrypt.hash(testUser.password, 10);
 
    // Create user
    user = await User.create({
      name: testUser.name,
      email: testUser.email,
      mobile: testUser.mobile,
      village: testUser.village,
      password: hashedPassword,
      isVerified: true
    });
 
    return res.json({
      message: "Test user created successfully",
      email: testUser.email,
      password: testUser.password,
      note: "Use these credentials to login. This endpoint is for development only."
    });
  } catch (error) {
    console.error("Error creating test user:", error);
    return res.status(500).json({
      error: "Failed to create test user",
      message: error.message
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
 
// Derive a short fingerprint of the current password hash so a reset token
// automatically becomes invalid once it has been used (password changed).
const passwordFingerprint = (passwordHash) =>
  crypto.createHash("sha256").update(String(passwordHash || "")).digest("hex");
 
const getFrontendBaseUrl = (req) => {
  const configured = process.env.FRONTEND_URL;
  if (configured) {
    return configured.trim().replace(/\/+$/, "");
  }
 
  // Fallback: derive from the request origin (works for same-origin deployments).
  return `${req.protocol}://${req.get("host")}`;
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
 
// Step 1: request a password reset link via email
router.post("/forgot-password", async (req, res) => {
  try {
    const normalizedEmail = normalizeEmail(req.body?.email);
 
    if (!normalizedEmail) {
      return res.status(400).json({ error: "Email is required" });
    }
 
    const user = await User.findOne({ where: { email: normalizedEmail } });
 
    // Always respond with a generic success message so we don't reveal
    // whether an account exists for this email address.
    const genericResponse = {
      message: "If an account exists for this email, a password reset link has been sent."
    };
 
    if (!user) {
      console.warn("[FORGOT-PASSWORD] No account for email:", maskEmail(normalizedEmail));
      return res.json(genericResponse);
    }
 
    const resetToken = jwt.sign(
      {
        id: user.id,
        purpose: "password_reset",
        pwd: passwordFingerprint(user.password)
      },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: `${RESET_TOKEN_EXPIRY_MINUTES}m` }
    );
 
    const frontendBase = getFrontendBaseUrl(req);
    const resetLink = `${frontendBase}/reset-password?token=${encodeURIComponent(resetToken)}`;
 
    try {
      await sendResetPasswordEmail({
        toEmail: user.email,
        resetLink,
        expiryMinutes: RESET_TOKEN_EXPIRY_MINUTES
      });
    } catch (emailError) {
      console.error("[FORGOT-PASSWORD] Failed to send email:", emailError.message);
      return res.status(500).json({
        error: "Failed to send reset email. Please try again later."
      });
    }
 
    return res.json(genericResponse);
  } catch (err) {
    console.error("[FORGOT-PASSWORD] ERROR:", err);
    return res.status(500).json({ error: "Failed to process request" });
  }
});
 
// Step 2: consume the reset token and set a new password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body || {};
    const normalizedPassword = String(password || "");
 
    if (!token) {
      return res.status(400).json({ error: "Reset token is required" });
    }
 
    if (!normalizedPassword || normalizedPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
 
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
    } catch (err) {
      return res.status(400).json({ error: "Reset link is invalid or has expired" });
    }
 
    if (decoded.purpose !== "password_reset") {
      return res.status(400).json({ error: "Invalid reset token" });
    }
 
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(400).json({ error: "Reset link is invalid or has expired" });
    }
 
    // If the password has already changed since this token was issued
    // (e.g. token already used, or password changed elsewhere), reject it.
    if (passwordFingerprint(user.password) !== decoded.pwd) {
      return res.status(400).json({ error: "Reset link has already been used or is invalid" });
    }
 
    user.password = await bcrypt.hash(normalizedPassword, 10);
    await user.save();
 
    return res.json({ message: "Password has been reset successfully. You can now log in." });
  } catch (err) {
    console.error("[RESET-PASSWORD] ERROR:", err);
    return res.status(500).json({ error: "Failed to reset password" });
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