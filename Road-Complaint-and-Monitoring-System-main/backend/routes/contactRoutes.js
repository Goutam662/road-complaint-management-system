const express = require("express");
const ContactMessage = require("../models/ContactMessage");

const router = express.Router();

router.post("/send", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const contactMessage = await ContactMessage.create({
      name,
      email,
      subject,
      message
    });

    res.json({
      message: "Message sent successfully",
      contactMessage
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Failed to send message" });
  }
});

module.exports = router;
