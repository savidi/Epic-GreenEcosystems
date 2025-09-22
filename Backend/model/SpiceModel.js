const mongoose = require("mongoose");

const spiceSchema = new mongoose.Schema(
  {
    type: { 
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    currentStock: {
      type: Number,
      required: true
    },
    minStock: { 
      type: Number,
      default: 30
    },
    unit: {
      type: String,
      default: "kg"
    },
    quality: {
      type: String,
      enum: ["High", "Low"],
      default: "High"
    },
    source: { 
      type: String,
      enum: ["Supplier", "Plantation"],
      required: true
    },
    price: { 
      type: Number,
      required: function() {
        return this.source === "Supplier";
      }
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SpiceModel", spiceSchema);