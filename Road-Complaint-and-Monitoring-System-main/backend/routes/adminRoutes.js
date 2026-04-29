const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const Admin = require("../models/Admin");
const Complaint = require("../models/Complaint");
const User = require("../models/User");

const router = express.Router();

// Middleware to check admin authentication
const adminAuthMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// Utility route to create a new admin account.
// If there are no admins in the system this endpoint is open so the first
// administrator can be bootstrapped. Once at least one admin exists, further
// calls require an authenticated admin token in the Authorization header.
router.post("/create-admin", async (req, res) => {
  try {
    const { username = "admin", password = "admin123" } = req.body;

    // if admins already exist, enforce authentication
    const count = await Admin.count();
    if (count > 0) {
      const authHeader = req.header("Authorization") || "";
      const token = authHeader.replace("Bearer ", "");
      if (!token) return res.status(401).json({ error: "No token provided" });
      try {
        jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
      } catch (err) {
        return res.status(401).json({ error: "Invalid token" });
      }
    }

    const existing = await Admin.findOne({ where: { username } });
    if (existing) {
      return res.status(400).json({ error: "Admin already exists" });
    }
    const hashed = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ username, password: hashed });
    res.json({ message: "Admin created", admin });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Creation failed" });
  }
});

// Register a new admin (for initial setup)
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingAdmin = await Admin.findOne({ where: { username } });
    if (existingAdmin) {
      return res.status(400).json({ error: "Admin already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ username, password: hashed });

    const token = jwt.sign({ id: admin.id, username: admin.username }, process.env.JWT_SECRET || "your_jwt_secret");

    res.json({
      message: "Admin registered successfully",
      token,
      admin: { id: admin.id, username: admin.username, role: admin.role }
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Admin registration failed" });
  }
});

// Admin login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ where: { username } });
    if (!admin) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: admin.id, username: admin.username }, process.env.JWT_SECRET || "your_jwt_secret");

    res.json({
      message: "Admin logged in successfully",
      token,
      admin: { id: admin.id, username: admin.username, role: admin.role }
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Login failed" });
  }
});

// Get all complaints (admin only)
router.get("/complaints", adminAuthMiddleware, async (req, res) => {
  try {
    const { status, location, page = 1, limit = 10 } = req.query;

    let query = {};

    if (status) {
      query.status = status;
    }

    if (location) {
      query.location = { [Op.like]: `%${location}%` };
    }

    const skip = (page - 1) * limit;

    const result = await Complaint.findAndCountAll({
      where: query,
      include: [{ model: User, as: "user", attributes: ["name", "email", "mobile", "village"] }],
      order: [["createdAt", "DESC"]],
      offset: skip,
      limit: parseInt(limit)
    });

    const complaints = result.rows;
    const total = result.count;

    res.json({
      complaints,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Failed to fetch complaints" });
  }
});

// Get complaint details (admin only)
router.get("/complaints/:id", adminAuthMiddleware, async (req, res) => {
  try {
    const complaint = await Complaint.findByPk(req.params.id, {
      include: [{ model: User, as: "user", attributes: ["name", "email", "mobile", "village"] }]
    });

    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    res.json({ complaint });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Failed to fetch complaint" });
  }
});

// Update complaint status (admin only)
router.put("/complaints/:id/status", adminAuthMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const complaint = await Complaint.findByPk(req.params.id);
    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    await complaint.update({ status });

    const updatedComplaint = await Complaint.findByPk(req.params.id, {
      include: [{ model: User, as: "user", attributes: ["name", "email", "mobile", "village"] }]
    });

    res.json({
      message: "Complaint status updated successfully",
      complaint: updatedComplaint
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Update failed" });
  }
});

// Delete a complaint (admin only)
router.delete("/complaints/:id", adminAuthMiddleware, async (req, res) => {
  try {
    const deleted = await Complaint.destroy({ where: { id: req.params.id } });
    if (!deleted) {
      return res.status(404).json({ error: "Complaint not found" });
    }
    res.json({ message: "Complaint deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Delete failed" });
  }
});

// Get admin dashboard statistics
router.get("/stats", adminAuthMiddleware, async (req, res) => {
  try {
    const totalComplaints = await Complaint.count();
    const pendingComplaints = await Complaint.count({ where: { status: "Pending" } });
    const inProgressComplaints = await Complaint.count({ where: { status: "In Progress" } });
    const resolvedComplaints = await Complaint.count({ where: { status: "Resolved" } });
    const withPhotosComplaints = await Complaint.count({ where: { image: { [Op.ne]: null } } });
    const totalUsers = await User.count();

    res.json({
      totalComplaints,
      pendingComplaints,
      inProgressComplaints,
      resolvedComplaints,
      withPhotosComplaints,
      totalUsers
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Failed to fetch statistics" });
  }
});

// Get all admin users (admin only)
router.get("/admins", adminAuthMiddleware, async (req, res) => {
  try {
    const admins = await Admin.findAll({
      attributes: { exclude: ["password"] },
      order: [["createdAt", "DESC"]]
    });
    res.json({ admins });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Failed to fetch admins" });
  }
});

// Get current admin's profile (admin only)
router.get("/profile", adminAuthMiddleware, async (req, res) => {
  try {
    const admin = await Admin.findByPk(req.admin.id, {
      attributes: { exclude: ["password"] }
    });
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }
    res.json({ admin });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Failed to fetch profile" });
  }
});

// Change admin password (admin only)
router.put("/change-password", adminAuthMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "Old password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters long" });
    }

    const admin = await Admin.findByPk(req.admin.id);
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await admin.update({ password: hashedPassword });

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Failed to change password" });
  }
});

// Delete an admin user (admin only)
router.delete("/admins/:id", adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting yourself
    if (req.admin.id === parseInt(id)) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    // Ensure at least one admin remains
    const adminCount = await Admin.count();
    if (adminCount <= 1) {
      return res.status(400).json({ error: "Cannot delete the only admin. At least one admin must exist." });
    }

    const deleted = await Admin.destroy({ where: { id: parseInt(id) } });
    if (!deleted) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.json({ message: "Admin deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Failed to delete admin" });
  }
});

module.exports = router;
