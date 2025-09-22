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
router.post('/create-checkout-session', async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
            if (order.customer.toString() !== req.userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }
    
        
        // Pass a single line item for the total price of the order
        const line_items = [{
            price_data: {
                currency: 'lkr',
                product_data: {
                    name: `Order #${order._id.toString()}`,
                },
                unit_amount: Math.round(order.totalPrice * 100), // Convert to cents
            },
            quantity: 1,
        }];

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: line_items,
            mode: 'payment',
            success_url: `http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `http://localhost:3000/cancel`,
            metadata: {
                orderId: order._id.toString() // Pass the orderId for the webhook
            },
        });
        
        res.json({ id: session.id });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;