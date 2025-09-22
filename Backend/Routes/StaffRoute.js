const express = require("express");
const router = express.Router();
const staffController = require("../controllers/StaffController");

router.post("/", staffController.addStaff);
router.get("/", staffController.getAllStaff);
router.get("/:id", staffController.getStaffById);
router.put("/:id", staffController.updateStaff);
router.delete("/:id", staffController.deleteStaff);
router.post("/login", staffController.staffLogin);

module.exports = router;
