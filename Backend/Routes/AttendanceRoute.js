const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/AttendanceController");

router.post("/", attendanceController.markAttendance);
router.get("/", attendanceController.getAllAttendance);

router.post("/manual", attendanceController.manualAttendance);

module.exports = router;
