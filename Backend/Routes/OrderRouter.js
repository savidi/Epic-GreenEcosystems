// OrderRouter.js
const express = require('express');
const router = express.Router();
const Order = require('../model/Order'); 
const { getPendingOrder, addOrUpdateOrderItem, getOrderHistory, deleteOrderItem, deleteOrder } = require('../controllers/OrderController');
const auth = require('../Middleware/auth');

// All routes are for authenticated customers
router.get('/pending', auth, getPendingOrder);
router.get('/history', auth, getOrderHistory);
router.post('/', auth, addOrUpdateOrderItem); // Corrected: removed '/orders'
router.delete('/:orderId/:itemId', auth, deleteOrderItem);
router.delete('/:orderId', auth, deleteOrder);
router.put('/clear-cart', auth, async (req, res) => {
    try {
        const userId = req.userId;
        
        const order = await Order.findOneAndUpdate(
            { customer: userId, orderStatus: 'pending' },
            { $set: { items: [], totalPrice: 0 } },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: 'No pending order found to clear' });
        }

        res.status(200).json({ message: 'Cart cleared successfully', order });
    } catch (err) {
        console.error('Error clearing cart:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;