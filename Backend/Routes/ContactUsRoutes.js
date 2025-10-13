const express = require("express");
const router = express.Router();
const ContactController = require("../controllers/ContactUsController");

// 🧭 Debug Middleware
router.use((req, res, next) => {
  console.log(`\n=== CONTACT ROUTE DEBUG ===`);
  console.log("Time:", new Date().toISOString());
  console.log("Method:", req.method);
  console.log("URL:", req.originalUrl);
  console.log("Body:", req.body);
  console.log("=== END DEBUG ===\n");
  next();
});

// Routes
router.get("/", async (req, res) => {
  try {
    const contacts = await ContactController.getAllContacts(req, res);
    // Ensure frontend receives { success: true, messages: [...] }
    res.json({ success: true, messages: contacts });
  } catch (err) {
    console.error("Error fetching contacts:", err);
    res.status(500).json({ success: false, message: "Failed to fetch messages" });
  }
});

router.post("/", async (req, res) => {
  try {
    const newContact = await ContactController.addContact(req, res);
    res.json({ success: true, message: "Message added successfully", contact: newContact });
  } catch (err) {
    console.error("Error adding contact:", err);
    res.status(500).json({ success: false, message: "Failed to add message" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const contact = await ContactController.getContactById(req, res);
    if (!contact) return res.status(404).json({ success: false, message: "Message not found" });
    res.json({ success: true, contact });
  } catch (err) {
    console.error("Error fetching contact:", err);
    res.status(500).json({ success: false, message: "Failed to fetch message" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await ContactController.deleteContact(req, res);
    if (!deleted) return res.status(404).json({ success: false, message: "Message not found" });
    res.json({ success: true, message: "Message deleted successfully" });
  } catch (err) {
    console.error("Error deleting contact:", err);
    res.status(500).json({ success: false, message: "Failed to delete message" });
  }
});

// Catch unmatched routes
router.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableRoutes: [
      "GET /contact",
      "POST /contact",
      "GET /contact/:id",
      "DELETE /contact/:id"
    ]
  });
});

module.exports = router;

