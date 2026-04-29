const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Send chat message (public endpoint with simple FAQ logic)
router.post("/message", (req, res) => {
  console.log("[chat] received message", req.body); // log for debugging
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // very simple keyword-based assistant
    const text = message.toLowerCase();
    let reply = "I'm here to help! You can ask me about registration, complaints, checking status or updating your profile.";

    if (text.includes("register") || text.includes("sign up")) {
      reply =
        "To register, click the 'Register' link in the navigation bar, fill out the form with your details and submit. You'll receive a confirmation email if the process succeeds.";
    } else if (text.includes("complaint") || text.includes("file")) {
      reply =
        "To file a complaint, log in and go to the 'Upload' page (or Dashboard). Provide the required information and submit the form; your complaint will then be visible on your dashboard.";
    } else if (text.includes("status")) {
      reply =
        "You can check the status of your complaint by logging in and visiting your 'Dashboard' where all your submitted complaints appear with their current status.";
    } else if (text.includes("profile") || text.includes("update")) {
      reply =
        "To update your profile, log in and navigate to the 'Profile' page. From there you can change any of your personal information and save the updates.";
    }

    // other helpful hints
    if (reply === "I'm here to help! You can ask me about registration, complaints, checking status or updating your profile.") {
      // if none of the specific keywords matched, give a fallback prompt
      reply += " If you need a step-by-step walkthrough, ask something like 'how do I register' or 'how to check complaint status?'.";
    }

    res.json({ success: true, reply });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Failed to send message" });
  }
});

// Health check for chat route
router.get("/ping", (req, res) => {
  res.json({ message: "Chat service is alive" });
});

module.exports = router;
