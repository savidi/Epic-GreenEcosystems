// Routes/StaffRoute.js
const express = require("express");
const router = express.Router();
const staffController = require("../controllers/StaffController");
const { staffAuth, isManager } = require("../Middleware/staffAuth");

// Public routes
router.post("/login", staffController.staffLogin);

// Protected routes (require authentication)
router.post("/", staffAuth, isManager, staffController.addStaff);
router.get("/", staffAuth, staffController.getAllStaff);
router.get("/:id", staffAuth, staffController.getStaffById);
router.put("/:id", staffAuth, isManager, staffController.updateStaff);
router.delete("/:id", staffAuth, isManager, staffController.deleteStaff);

// Verify token endpoint
router.get("/verify/token", staffAuth, (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Token is valid",
    staffId: req.staffId,
    staffType: req.staffType,
    position: req.position
  });
});

module.exports = router;