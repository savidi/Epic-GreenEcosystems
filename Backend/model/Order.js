const mongoose = require('mongoose');
const { Schema } = mongoose;
const ProductModel = require('./ProductModel'); // Use the file name
const SpiceModel = require('./SpiceModel');   // Use the file name
const Spice = require('./Spice');  

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

// --- START: NEW PRE-SAVE HOOK FOR STOCK MANAGEMENT ---

orderSchema.pre('save', async function (next) {
    // Only run this logic if the order is new or if the 'items' array has been modified.
    // For a new order, this.isNew is true.
    // For an existing order being updated (like adding a new item), this.isModified('items') is true.
    // We only want to run this when an item is added or its quantity is increased.
    // NOTE: This logic assumes all quantity changes (additions) are handled via 'addOrUpdateOrderItem'
    // in OrderController, which always calls save() and only adds/increases quantity.
    // If you had a dedicated 'completeOrder' process, that might be a better place.

    // Get the changes to the items array
    const newItems = this.items;
    
    // Check if it's a new order or items were modified
    if (this.isNew || this.isModified('items')) {
        
        
        let itemsToProcess = [];

        if (this.isNew) {
            // For a brand new order, all quantities are reductions from stock
            itemsToProcess = newItems.map(item => ({
                spiceId: item.spice,
                reductionQuantity: item.quantity
            }));
        } else {
            // For an existing order being updated:
            const existingOrder = await this.constructor.findById(this._id);
            
            // Map the new items to the quantity difference
            for (const newItem of newItems) {
                const oldItem = existingOrder.items.find(item => item.spice.equals(newItem.spice));
                
                let reductionQuantity = 0;
                
                if (oldItem) {
                    // Item already existed, reduction is the difference between new and old quantity
                    reductionQuantity = newItem.quantity - oldItem.quantity;
                } else {
                    // Item is new to the order, reduction is the new quantity
                    reductionQuantity = newItem.quantity;
                }

                if (reductionQuantity > 0) {
                     itemsToProcess.push({
                        spiceId: newItem.spice,
                        reductionQuantity: reductionQuantity
                    });
                }
            }
        }

        const updatePromises = itemsToProcess.map(async (item) => {
            const { spiceId, reductionQuantity } = item;
            

            // First, get the name of the ordered spice from the Spice.js model
            const orderedSpice = await mongoose.model('Spice').findById(spiceId);

            if (!orderedSpice) {
                throw new Error(`Spice with ID ${spiceId} not found.`);
            }
            
            const spiceName = orderedSpice.name;
            const reductionInGrams = reductionQuantity * 1000; // Assuming OrderView quantity is in kg, and ProductModel quantity is in grams (from unit: "100g")
            const reductionInPackets = reductionQuantity * 10; // 1 kg is 10 x 100g packets.

            
            let remainingReduction = reductionInPackets;

            // Find all ProductModels for this spice, sorted by quantity to consume smaller batches first (optional)
            const products = await ProductModel.find({ name: spiceName, quantity: { $gt: 0 } }).sort({ quantity: 1 });

            for (const product of products) {
                if (remainingReduction <= 0) break;
                
                const availableQuantity = product.quantity; // in 100g packets
                const consume = Math.min(remainingReduction, availableQuantity);
                
                product.quantity -= consume;
                remainingReduction -= consume;

                await product.save();
            }

            if (remainingReduction > 0) {
                 // You might want to throw an error here if stock is insufficient
                 // For now, we'll just log and continue the order without preventing save.
                 console.error(`Insufficient stock for ${spiceName}. Remaining shortage: ${remainingReduction} x 100g packets.`);
            }

            // --- B. Update SpiceModel (currentStock is in 'kg') ---
            // The reduction in kg is the original `reductionQuantity`
            await SpiceModel.findOneAndUpdate(
                { name: spiceName },
                { $inc: { currentStock: -reductionQuantity } },
                { new: true }
            );

        });

        await Promise.all(updatePromises);
    }
    
    next();
});

// --- END: NEW PRE-SAVE HOOK FOR STOCK MANAGEMENT ---

module.exports = mongoose.model('Order', orderSchema);