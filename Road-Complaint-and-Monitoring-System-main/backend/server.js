const path = require("path");
const dotenvResult = require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");

// Load models and associations early so Sequelize can handle includes correctly.
require("./models");

const authRoutes = require("./routes/authRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const adminRoutes = require("./routes/adminRoutes");
const chatRoutes = require("./routes/chatRoutes");
const contactRoutes = require("./routes/contactRoutes");

const fs = require("fs");
const app = express();

if (dotenvResult.error) {
  console.error("[ENV] Failed to load backend/.env", dotenvResult.error.message);
} else {
  console.log("[ENV] Loaded environment variables from backend/.env");
}

const requiredEnvVars = ["MYSQL_URI", "JWT_SECRET", "EMAIL_USER", "EMAIL_PASS"];
const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);
if (missingEnvVars.length > 0) {
  console.error("[ENV] Missing required variables:", missingEnvVars.join(", "));
}

console.log("[ENV] OTP email config status", {
  hasEmailUser: Boolean(process.env.EMAIL_USER),
  hasEmailPass: Boolean(process.env.EMAIL_PASS),
  smtpFromConfigured: Boolean(process.env.SMTP_FROM)
});

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5000",
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_2,
  "https://road-complaint-and-monitoring-system.onrender.com",
  "https://road-complaint-and-monitoring-system-1.onrender.com"
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.error("[CORS] Blocked origin:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true
};

// create uploads folder if missing (multer doesn't auto-create it)
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());
app.use("/uploads", express.static(uploadsDir));

// Serve frontend build files in production
const frontendBuildPath = path.join(__dirname, "../frontend/build");
const frontendIndexPath = path.join(frontendBuildPath, "index.html");
const hasFrontendBuild = fs.existsSync(frontendIndexPath);

console.log("[SERVER] Frontend build path:", frontendBuildPath);
console.log("[SERVER] Frontend build exists:", fs.existsSync(frontendBuildPath));
console.log("[SERVER] Index.html exists:", hasFrontendBuild);

if (hasFrontendBuild) {
  app.use(express.static(frontendBuildPath));
}

// connect to mongo
// start app after DB connection and run any initializers
const start = async () => {
  await connectDB();

  // Ensure the configured super admin can always log in.
  // In development/demo setups this prevents stale DB passwords
  // from breaking documented default credentials.
  try {
    const Admin = require("./models/Admin");
    const bcrypt = require("bcryptjs");

    const username = process.env.SUPER_ADMIN_USERNAME || "admin";
    const password = process.env.SUPER_ADMIN_PASSWORD || "admin123";
    const existingSuperAdmin = await Admin.findOne({ where: { username } });

    if (!existingSuperAdmin) {
      const hashed = await bcrypt.hash(password, 10);
      await Admin.create({ username, password: hashed, role: "superadmin" });
      console.log("✅ Super admin created:", username);
    } else {
      const isPasswordMatch = await bcrypt.compare(password, existingSuperAdmin.password);

      if (!isPasswordMatch || existingSuperAdmin.role !== "superadmin") {
        existingSuperAdmin.password = await bcrypt.hash(password, 10);
        existingSuperAdmin.role = "superadmin";
        await existingSuperAdmin.save();
        console.log("✅ Super admin credentials synchronized:", username);
      }
    }
  } catch (err) {
    console.error("Error during superadmin initialization:", err);
  }

  // mount API routes
  app.use("/api/auth", authRoutes);
  app.use("/api/complaints", complaintRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/chat", chatRoutes);
  app.use("/api/contact", contactRoutes);

  // Always return JSON for unknown API routes
  app.use("/api", (req, res) => {
    res.status(404).json({
      error: `API route not found: ${req.method} ${req.originalUrl}`
    });
  });

  if (hasFrontendBuild) {
    // SPA fallback - serve index.html for all non-API routes (for React Router)
    // This must come AFTER all API routes
    app.use((req, res, next) => {
      // Skip if it's an API route
      if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
        return next();
      }

      // Skip if it's a static file request
      if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i)) {
        return next();
      }

      console.log("[SPA] Serving index.html for route:", req.path);
      return res.sendFile(frontendIndexPath, (err) => {
        if (err) {
          console.error("[SPA] Error serving index.html:", err);
          return res.status(500).json({ error: "Could not load application" });
        }
      });
    });
  } else {
    app.get("/", (req, res) => {
      res.json({ message: "API is running" });
    });
  }

  // Centralized JSON error handler for API requests
  app.use((err, req, res, next) => {
    if (req.originalUrl && req.originalUrl.startsWith("/api")) {
      console.error("API error:", err);
      return res.status(err.status || 500).json({
        error: err.message || "Internal server error"
      });
    }

    return next(err);
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

start();
