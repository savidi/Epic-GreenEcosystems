// model/FWModel.js
const mongoose = require("mongoose");

const FieldWorkerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Worker name is required"],
      trim: true,
    },
    nationalid: {
      type: String,
      required: [true, "National ID is required"],
      unique: true,
      trim: true,
    },
    age: {
      type: Number,
      min: [16, "Age must be at least 16"],
      max: [100, "Age must be less than 100"],
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    arrivaltime: {
      type: String, // could also be Date if you want exact timestamps
    },
    departuretime: {
      type: String,
    },
    workedhoures: {
      type: Number,
      default: 0,
      min: 0,
    },
    salary: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentstatus: {
      type: String,
      enum: ["Pending", "Paid", "Partial"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FieldWorker", FieldWorkerSchema);
