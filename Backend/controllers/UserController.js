// UserController.js
const User = require("../model/Register");

//View details of the customer in the customer portal
const getUserProfile = async (req, res, next) => {
    try {
         const userId = req.userId; // Get user ID from the auth middleware
        const user = await User.findById(userId).select('-password'); // Exclude the password field
        if (!user) {
         return res.status(404).json({ message: "User not found" });
        }
         return res.status(200).json({ user });
         } catch (err) {
          console.error(err);
       return res.status(500).json({ message: "Server error" });
    }
};

//Update details of the customer
const updateUserProfile = async (req, res, next) => {
    const userId = req.userId;
    const { name, gmail, phone, address } = req.body;

    try {
        const user = await User.findByIdAndUpdate(userId, { name, gmail, phone, address }, { new: true });
        if (!user) {
         return res.status(404).json({ message: "Unable to update the user" });
        }
         return res.status(200).json({ user });
    } catch (err) {
        console.error(err);
       return res.status(500).json({ message: "Server error" });
    }
};

// Correctly export only the functions you need
exports.getUserProfile = getUserProfile;
exports.updateUserProfile = updateUserProfile;