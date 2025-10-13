const ContactUs = require("../model/ContactUsModel");

// ✅ Get all messages
const getAllContacts = async (req, res, next) => {
  let contacts;
  try {
    contacts = await ContactUs.find().sort({ date: -1 });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error retrieving contact messages" });
  }

  if (!contacts || contacts.length === 0) {
    return res.status(404).json({ message: "No contact messages found" });
  }

  return res.status(200).json({ success: true, contacts });
};

// ✅ Add new contact message
const addContact = async (req, res, next) => {
  const { name, company, phone, email, subject, message } = req.body;

  console.log("📩 Received Contact Data:", req.body);

  // Validation
  if (!name || !email || !subject || !message) {
    return res.status(400).json({
      success: false,
      message: "Name, email, subject, and message are required."
    });
  }

  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format."
    });
  }

  try {
    const contact = new ContactUs({
      name: name.trim(),
      company: company?.trim(),
      phone: phone?.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim()
    });

    await contact.save();
    return res.status(201).json({
      success: true,
      message: "Message submitted successfully!",
      contact
    });
  } catch (err) {
    console.error("❌ Error saving contact:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to save contact message",
      error: err.message
    });
  }
};

// ✅ Get contact message by ID
const getContactById = async (req, res, next) => {
  const id = req.params.id;
  try {
    const contact = await ContactUs.findById(id);
    if (!contact) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }
    return res.status(200).json({ success: true, contact });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Error retrieving message" });
  }
};

// ✅ Delete contact message
const deleteContact = async (req, res, next) => {
  const id = req.params.id;
  try {
    const contact = await ContactUs.findByIdAndDelete(id);
    if (!contact) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }
    return res.status(200).json({ success: true, message: "Message deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Error deleting message" });
  }
};

module.exports = {
  getAllContacts,
  addContact,
  getContactById,
  deleteContact
};
