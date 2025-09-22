const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const supplierSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    phoneno: {
        type: Number,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    spicename: {
        type: String,
        required: true
    },
    qty: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model("Supplier", supplierSchema);