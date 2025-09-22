const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");

const officerSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    nationalId: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    officerType: {
        type: String,
        required: true,
        enum: ["Field Officer", "Inventory Manager", "Sales Manager", "Supplier Manager"]
    },
    permissions: {
        type: [String],
        default: []
    },
    isActive: {
        type: Boolean,
        default: true
    },
    dateRegistered: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
officerSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare password method
officerSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

module.exports = mongoose.model("Officer", officerSchema);