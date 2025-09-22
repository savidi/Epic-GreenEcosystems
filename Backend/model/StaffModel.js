const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");

const staffSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    nationalId: {
        type: String,
        required: true,
        unique: true
    },
    age: {
        type: Number,
        required: true
    },
    gender: {
        type: String,
        required: true,
        enum: ["Male", "Female", "Other"]
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

    accountNo: {
        type: Number,
        required: true
    },

    staffType: {
        type: String,
        required: true,
        enum: ["Inventory", "Sales", "Supplier", "Field", "HR"]
    },

    position: {
        type: String,
        required: true,
        enum: ["Staff", "Manager"]
    },

    qrCode: {
        type: String
    },

});

// Hash password before saving
staffSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare password method
staffSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

module.exports = mongoose.model("Staff", staffSchema);