const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../model/Order');
const OrderPayments = require('../model/OrderPayments');
const auth = require('../Middleware/auth');

// Add this line to import the controller function
const { getPaymentHistory } = require('../controllers/PaymentSalesController');

router.get('/history', auth, getPaymentHistory);

// Route to create a Stripe Checkout Session
router.post('/create-checkout-session', auth, async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        if (order.customer.toString() !== req.userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        
        const line_items = [{
            price_data: {
                currency: 'lkr',
                product_data: {
                    name: `Order #${order._id.toString()}`,
                },
                unit_amount: Math.round(order.totalPrice * 100),
            },
            quantity: 1,
        }];

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: line_items,
            mode: 'payment',
            // Corrected line: Pass the orderId as a query parameter
            success_url: `http://localhost:3000/success?order_id=${orderId}`, 
            cancel_url: `http://localhost:3000/cancel`,
            metadata: {
                orderId: order._id.toString()
            },
        });
        
        res.json({ id: session.id });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// The existing GET route for a single order is correct and will now be used by Success.js
router.get('/:id', auth, async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = req.userId;

        const order = await Order.findOne({ _id: orderId, customer: userId })
            .populate('customer')
            .populate('items.spice');

        if (!order) {
            return res.status(404).json({ error: 'Order not found or not owned by user' });
        }

        res.status(200).json({ order });
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;