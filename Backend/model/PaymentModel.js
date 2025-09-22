const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", required: true },
  amount: { type: Number, required: true },
  month: { type: String, required: true },
  otPay: { type: Number, default: 0 },
  lateCount: { type: Number, default: 0 },
  absentCount: { type: Number, default: 0 },
  lateDeduction: { type: Number, default: 0 },
  absentDeduction: { type: Number, default: 0 },

});

module.exports = mongoose.model("Payment", paymentSchema);
