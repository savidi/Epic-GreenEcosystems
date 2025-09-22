const Order = require('../model/Order');

// Function to get a user's pending order
const getPendingOrder = async (req, res) => {
    try {
        const userId = req.userId; // Comes from the JWT middleware
        // Find an order that is pending AND is a 'Local' order type
        const order = await Order.findOne({ 
            customer: userId, 
            orderStatus: 'pending',
            orderType: 'Local' // <-- Add this filter
        }).populate('items.spice');
        
        if (!order) {
            return res.status(404).json({ message: 'No pending local order found' });
        }
        res.status(200).json({ order });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};


// Add a new item or update an existing one in the pending order
// Corrected addOrUpdateOrderItem function
// Corrected addOrUpdateOrderItem function
const addOrUpdateOrderItem = async (req, res) => {
    try {
        const userId = req.userId;
        const { spiceId, quantity, price } = req.body;

        const filter = { customer: userId, orderStatus: 'pending', orderType: 'Local' }; // Add orderType to filter
        
        let order = await Order.findOne(filter);
        
        if (!order) {
            // If no pending order exists, create a new one
            order = new Order({
                customer: userId,
                items: [{ spice: spiceId, quantity, price }],
                orderType: 'Local',
                totalPrice: quantity * price,
            });
        } else {
            // Check if the item already exists in the order
            const existingItem = order.items.find(item => item.spice.toString() === spiceId);
            if (existingItem) {
                // Corrected line: Add the new quantity to the existing one
                existingItem.quantity += quantity;
            } else {
                // If not, push the new item
                order.items.push({ spice: spiceId, quantity, price });
            }

            // Recalculate total price based on the updated items array
            order.totalPrice = order.items.reduce((total, item) => total + (item.quantity * item.price), 0);
        }

        await order.save(); // Save the changes to the order

        const populatedOrder = await Order.findById(order._id).populate('items.spice');
        res.status(200).json({ order: populatedOrder });
    } catch (error) {
        console.error("Error in addOrUpdateOrderItem:", error);
        res.status(500).json({ message: 'Server error', error });
    }
};

const deleteOrderItem = async (req, res) => {
    try {
        const userId = req.userId;
        const { orderId, itemId } = req.params;

        const order = await Order.findOne({ _id: orderId, customer: userId, orderStatus: 'pending' });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        // Use $pull to remove the item from the array by its _id
        order.items.pull(itemId);
        order.totalPrice = order.items.reduce((total, item) => total + (item.quantity * item.price), 0);

        await order.save();
        
        // Re-populate the order to send back to the client
        const populated = await Order.findById(order._id).populate('items.spice');
        res.status(200).json({ order: populated });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Delete the entire order
const deleteOrder = async (req, res) => {
    try {
        const userId = req.userId;
        const { orderId } = req.params;

        const deletedOrder = await Order.findOneAndDelete({
            _id: orderId,
            customer: userId,
            orderStatus: 'pending'
        });

        if (!deletedOrder) {
            return res.status(404).json({ message: 'Order not found or already deleted' });
        }

        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error("Error deleting order:", error);
        res.status(500).json({ message: 'Server error', error });
    }
};

const getOrderHistory = async (req, res) => {
    try {
        const userId = req.userId;
        const orders = await Order.find({ customer: userId }).populate('items.spice').sort({ createdAt: -1 });

        if (orders.length === 0) {
            return res.status(404).json({ message: 'No orders found for this user' });
        }
        res.status(200).json({ orders });
    } catch (error) {
        console.error("Error fetching order history:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getOrderById = async (req, res) => {
    try {
        const userId = req.userId;
        const orderId = req.params.orderId; // Get order ID from URL params

        // Find the order by its ID and ensure it belongs to the authenticated user
        const order = await Order.findOne({ 
            _id: orderId, 
            customer: userId 
        }).populate('items.spice'); // Populate spice details

        if (!order) {
            return res.status(404).json({ message: 'Order not found or not owned by user' });
        }
        
        res.status(200).json({ order });
    } catch (error) {
        console.error("Error fetching order by ID:", error);
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = {
    getPendingOrder,
    addOrUpdateOrderItem,
    deleteOrderItem,
    deleteOrder,
    getOrderHistory,
    getOrderById,
};