const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema({
    customer: {
        type: Schema.Types.ObjectId,
        ref: 'Register',
        required: true,
    },
    items: [
        {
            spice: {
                type: Schema.Types.ObjectId,
                ref: 'Spice',
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
            },
            price: {
                type: Number,
                required: true,
            },
        },
    ],
    totalPrice: {
        type: Number,
        required: true,
    },
    orderType: {
        type: String,
        required: true,
        enum: ['Local', 'Global'],
    },
    orderStatus: {
        type: String,
        enum: ['quoted','requested','pending','paid', 'shipped', 'delivered','rejected'],
        default: 'pending',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Order', orderSchema);