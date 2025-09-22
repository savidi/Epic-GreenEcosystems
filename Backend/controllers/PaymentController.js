const Payment = require("../model/PaymentModel");
const Attendance = require("../model/AttendanceModel");
const Staff = require("../model/StaffModel");

// Calculate or update payments for a given month
exports.calculatePayments = async (req, res) => {
  try {
    const { month } = req.body;
    if (!month)
      return res
        .status(400)
        .json({ status: "fail", message: "Month is required" });

    const [year, mon] = month.split("-").map(Number);
    const today = new Date();

    const startDate = new Date(year, mon - 1, 1);
    const endDate = new Date(year, mon, 0); // last day of month
    const totalDays = endDate.getDate();

    // Precompute working days (Mon–Fri)
    const allWorkingDays = Array.from(
      { length: totalDays },
      (_, i) => new Date(year, mon - 1, i + 1)
    ).filter((d) => d.getDay() !== 0 && d.getDay() !== 6);

    // Only past working days count for absence
    const pastWorkingDays = allWorkingDays.filter((d) => d <= today);

    const baseSalary = 30000;

    // Fetch all staff in one go
    const staffList = await Staff.find().lean();

    // For each staff, fetch attendance in parallel
    const payments = await Promise.all(
      staffList.map(async (staff) => {
        const records = await Attendance.find({
          staffId: staff._id,
          date: { $gte: startDate, $lte: endDate },
        }).lean();

        const lateCount = records.filter((r) => r.status === "Late").length;

        const attendedDays = records.filter(
          (r) => new Date(r.date) <= today
        ).length;
        const absentCount = pastWorkingDays.length - attendedDays;

        const otPay = records.reduce(
          (sum, r) => sum + ((r.otHours || 0) * 200),
          0
        );
        const lateDeduction = lateCount * 100;
        const absentDeduction = absentCount * 500;

        const total = baseSalary + otPay - lateDeduction - absentDeduction;

        // Upsert (update or create) in one query
        const payment = await Payment.findOneAndUpdate(
          { staffId: staff._id, month },
          {
            $set: {
              otPay,
              lateCount,
              absentCount,
              lateDeduction,
              absentDeduction,
              amount: total,
            },
            $setOnInsert: { paymentStatus: "Pending" },
          },
          { new: true, upsert: true }
        );

        return payment;
      })
    );

    res.status(200).json({ status: "success", data: payments });
  } catch (err) {
    console.error("Error in calculatePayments:", err);
    res
      .status(500)
      .json({ status: "fail", message: "Error calculating payments" });
  }
};

// Get payments by month (auto-generate if missing)
exports.getPaymentsByMonth = async (req, res) => {
  try {
    const { month } = req.query;
    if (!month)
      return res
        .status(400)
        .json({ status: "fail", message: "Month is required" });

    // Calculate and fetch in one go
    await exports.calculatePayments({ body: { month } }, { status: () => ({ json: () => {} }) });

    const payments = await Payment.find({ month })
      .populate("staffId", "-password")
      .lean();

    res.status(200).json({ status: "success", data: payments });
  } catch (err) {
    console.error("Error in getPaymentsByMonth:", err);
    res.status(500).json({ status: "fail", message: "Could not get payments" });
  }
};




