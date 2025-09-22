const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const attendanceSchema = new Schema({
    staffId: {
        type: Schema.Types.ObjectId,
        ref: "Staff",
        required: true
    },
    status: {
        type: String,
        enum: ["Present", "Late", "Absent"],
        default: "Present"
    },
    arrivalTime: {
        type: Date,
        default: Date.now
    },
    leavingTime: {
        type: Date
    },
    overtimeHours: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Attendance", attendanceSchema);
