const Staff = require("../model/StaffModel");
const QRCode = require("qrcode");

// Add/register a new staff
exports.addStaff = async (req, res) => {
  try {
    const { name, nationalId, age, gender, email, password, accountNo, staffType, position } = req.body;

    const existingStaff = await Staff.findOne({ $or: [{ email }, { nationalId }] });
    if (existingStaff) {
      return res.status(400).json({ status: "fail", message: "Staff already exists" });
    }

    // Generate QR code (can encode the staff's email or ID)
    const qrCode = await QRCode.toDataURL(email); // or `${name}-${nationalId}`

    const newStaff = await Staff.create({
      name,
      nationalId,
      age,
      gender,
      email,
      password,
      accountNo,
      staffType,
      position,
      qrCode, // store the generated QR code
    });

    newStaff.password = undefined; // hide password
    res.status(201).json({ status: "success", data: newStaff });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "fail", message: "Could not add staff" });
  }
};

// Get all staff
exports.getAllStaff = async (req, res) => {
    try {
        const staffList = await Staff.find().select("-password");
        res.status(200).json({ status: "success", data: staffList });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: "fail", message: "Could not get staff" });
    }
};

// Get staff by ID
exports.getStaffById = async (req, res) => {
    try {
        const staff = await Staff.findById(req.params.id).select("-password");
        if (!staff) {
            return res.status(404).json({ status: "fail", message: "Staff not found" });
        }
        res.status(200).json({ status: "success", data: staff });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: "fail", message: "Could not get staff" });
    }
};

// Update staff by ID
exports.updateStaff = async (req, res) => {
    try {
        const updatedStaff = await Staff.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedStaff) {
            return res.status(404).json({ status: "fail", message: "Staff not found" });
        }

        res.status(200).json({ status: "success", data: updatedStaff });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: "fail", message: "Could not update staff" });
    }
};

// Delete staff by ID
exports.deleteStaff = async (req, res) => {
    try {
        const deletedStaff = await Staff.findByIdAndDelete(req.params.id);
        if (!deletedStaff) {
            return res.status(404).json({ status: "fail", message: "Staff not found" });
        }
        res.status(200).json({ status: "success", message: "Staff deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: "fail", message: "Could not delete staff" });
    }
};


// Staff login (for Managers only)
// controllers/StaffController.js - UPDATE staffLogin function only
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

exports.staffLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const staff = await Staff.findOne({ email });
    if (!staff) {
      return res.status(404).json({ status: "fail", message: "Staff not found" });
    }

    // Check if Manager
    if (staff.position !== "Manager") {
      return res.status(403).json({ status: "fail", message: "Access denied. Not a manager." });
    }

    // Validate password
    const isMatch = await staff.correctPassword(password, staff.password);
    if (!isMatch) {
      return res.status(401).json({ status: "fail", message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        staffId: staff._id,
        staffType: staff.staffType,
        position: staff.position,
        email: staff.email
      },
      JWT_SECRET,
      { expiresIn: '8h' } // Token expires in 8 hours
    );

    // Return success with token
    res.status(200).json({
      status: "success",
      token,
      staffType: staff.staffType,
      id: staff._id,
      name: staff.name,
      email: staff.email,
      position: staff.position
    });

  } catch (err) {
    console.error("Manager login error:", err);
    res.status(500).json({ status: "fail", message: "Server error" });
  }
};