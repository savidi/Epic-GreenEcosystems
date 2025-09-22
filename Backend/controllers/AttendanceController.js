const Attendance = require("../model/AttendanceModel");
const Staff = require("../model/StaffModel");
const Payment = require("../model/PaymentModel");


// Add manual attendance
exports.manualAttendance = async (req, res) => {
  try {
    const { staffId, date, status, arrivalTime, leavingTime, overtimeHours } = req.body;

    if (!staffId || !date || !status) {
      return res.status(400).json({
        status: "fail",
        message: "staffId, date, and status are required",
      });
    }

    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(404).json({ status: "fail", message: "Staff not found" });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    // Check if already exists
    const existing = await Attendance.findOne({
      staffId,
      date: { $gte: attendanceDate, $lt: new Date(attendanceDate.getTime() + 24 * 60 * 60 * 1000) },
    });

    if (existing) {
      return res.status(400).json({ status: "fail", message: "Attendance already exists for this date" });
    }

    const attendance = await Attendance.create({
      staffId,
      date: attendanceDate,
      status,
      arrivalTime: arrivalTime ? new Date(arrivalTime) : null,
      leavingTime: leavingTime ? new Date(leavingTime) : null,
      overtimeHours: overtimeHours || 0,
    });

    res.status(201).json({
      status: "success",
      message: `Attendance added for ${staff.name} on ${attendanceDate.toDateString()}`,
      data: attendance,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "fail", message: err.message });
  }
};






// Mark attendance (check-in / check-out)
exports.markAttendance = async (req, res) => {
  try {
    let { staffId, email } = req.body;

    if (!staffId && !email) {
      return res
        .status(400)
        .json({ status: "fail", message: "Either staffId or email is required" });
    }

    if (email) email = email.trim().toLowerCase();

    // 1. Find staff
    const staff = staffId
      ? await Staff.findById(staffId)
      : await Staff.findOne({
          email: { $regex: new RegExp(`^${email}$`, "i") },
        });

    if (!staff) {
      return res.status(404).json({ status: "fail", message: "Staff not found" });
    }

    // 2. Get today’s date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 3. Check if attendance record exists today
    let attendance = await Attendance.findOne({
      staffId: staff._id,
      date: { $gte: today, $lt: tomorrow },
    });

    const now = new Date();

    if (!attendance) {
      // ✅ First scan → Check-in
      const startTime = new Date();
      startTime.setHours(9, 0, 0); // work start 9 AM

      const status = now > startTime ? "Late" : "Present";

      attendance = await Attendance.create({
        staffId: staff._id,
        status,
        arrivalTime: now,
        date: now,
      });

      return res.status(201).json({
        status: "success",
        message: `${staff.name} checked in at ${now.toLocaleTimeString()}`,
        data: attendance,
      });
    } else if (!attendance.leavingTime) {
      // ✅ Second scan → Check-out
      attendance.leavingTime = now;

      // Auto calculate OT if after 4 PM
      const fourPM = new Date(attendance.date);
      fourPM.setHours(16, 0, 0, 0);

      if (now > fourPM) {
        const diffMs = now - fourPM;
        attendance.overtimeHours = parseFloat(
          (diffMs / (1000 * 60 * 60)).toFixed(2)
        );
      } else {
        attendance.overtimeHours = 0;
      }

      await attendance.save();

      return res.status(200).json({
        status: "success",
        message: `${staff.name} checked out at ${now.toLocaleTimeString()}. OT: ${attendance.overtimeHours} hrs`,
        data: attendance,
      });
    } else {
      // ✅ Extra scans → Already checked out
      return res.status(400).json({
        status: "fail",
        message: `${staff.name} has already checked out today.`,
      });
    }
  } catch (err) {
    console.error("Attendance Error:", err);
    res.status(500).json({ status: "fail", message: err.message });
  }
};

// Get all attendance records
exports.getAllAttendance = async (req, res) => {
  try {
    const records = await Attendance.find()
      .populate("staffId", "name email staffType position")
      .sort({ date: -1 });

    res.status(200).json({ status: "success", data: records });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};





/*



{
  "staffId": "68ca8fdcbf8e07901562f8b0",
  "date": "2025-08-31",
  "status": "Present",
  "arrivalTime": "2025-08-31T10:00:00.000Z",
  "leavingTime": "2025-08-31T17:00:00.000Z",
  "overtimeHours": 1
}
  */