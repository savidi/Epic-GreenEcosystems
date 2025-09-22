const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Register', // Reference to your Register model
        required: true,
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order', // Reference to your Order model
        required: true,
    },
    paymentDate: {
        type: Date,
        default: Date.now, // Automatically set the payment date
    },
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        default: 'lkr',
    },
    transactionId: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['processing', 'succeeded', 'failed'],
        default: 'processing',
    },
}, { timestamps: true });

module.exports = mongoose.model('OrderPayments', paymentSchema);