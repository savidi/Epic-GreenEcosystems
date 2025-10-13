const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const contactUsSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[0-9+\-\s()]*$/, "Invalid phone number format"]
  },
  email: {
    type: String,
    required: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Invalid email address"]
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("ContactUs", contactUsSchema);
