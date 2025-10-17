const express = require("express");
const router = express.Router();
const staffController = require("../controllers/StaffController");
const { staffAuth, optionalStaffAuth, isManager } = require("../Middleware/staffAuth");

// Public route - login
router.post("/login", staffController.staffLogin);

// Public route - registration (no auth required)
router.post("/", staffController.addStaff);

// Verify token endpoint - MUST be before /:id
router.get("/verify/token", staffAuth, (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Token is valid",
    staffId: req.staffId,
    staffType: req.staffType,
    position: req.position
  });
});

// Read operations - allow without token
router.get("/", optionalStaffAuth, staffController.getAllStaff);

// Write operations - require authentication + manager
router.put("/:id", optionalStaffAuth, isManager, staffController.updateStaff);
router.delete("/:id", optionalStaffAuth, isManager, staffController.deleteStaff);

// Get by ID - MUST be last
router.get("/:id", optionalStaffAuth, staffController.getStaffById);

module.exports = router;