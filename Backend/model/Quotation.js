const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const quotationSchema = new Schema({
    // Add a reference to the customer who placed the order
    customer: {
        type: Schema.Types.ObjectId,
        ref: 'Register',
        required: true,
    },

     orderId: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
        required: true, // It's a good practice to make this required
    },
    
    // Fields from the customer form
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    companyName: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    interestedSpices: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: 'Spice'
        }],
        required: true,
    },
    requiredQuantity: {
        type: Number,
        required: true,
    },
    preferredCurrency: {
        type: String,
        required: true,
    },
    deliveryAddress: {
        type: String,
        required: true,
    },
    notes: {
        type: String,
    },
    
    // Fields for staff to fill out
    exportDuties: {
        type: Number,
        default: 0,
    },
    packagingMaterials: {
        type: String,
        default: '',
    },
    shippingPartner: {
        type: String,
        default: '',
    },
    totalCost: {
        type: Number,
        default: 0,
    },
    staffNotes: {
        type: String,
        default: '',
    },
    status: {
        type: String,
        enum: ['requested','pending', 'approved', 'rejected'],
        default: 'requested',
    },
}, { timestamps: true });

module.exports = mongoose.model('Quotation', quotationSchema);