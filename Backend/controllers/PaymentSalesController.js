const OrderPayments = require('../model/OrderPayments');

exports.getPaymentHistory = async (req, res) => {
    try {
        const userId = req.userId; 
        const payments = await OrderPayments.find({ user: userId })
            .populate('order', 'totalPrice orderStatus')
            .sort({ paymentDate: -1 });

        res.status(200).json({ payments });
    } catch (error) {
        console.error('Error fetching payment history:', error);
        res.status(500).json({ message: 'Server error' });
    }
};