const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const fertilizersSchema = new Schema({
    fertilizerName: {
        type: String,
        required: true
    },
    fType: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model("Fertilizers", fertilizersSchema);