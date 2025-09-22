const Order = require('../model/Order'); 
const Register = require('../model/Register'); 
const mongoose = require('mongoose');

exports.getSalesStats = async (req, res) => {
    try {
        // Calculate Total Sales
        const completedOrders = await Order.find({ 
            orderStatus: { $in: ['paid', 'shipped', 'delivered'] } 
        });
        const totalSales = completedOrders.reduce((sum, order) => sum + order.totalPrice, 0);

        // Count Pending Orders
        const pendingOrders = await Order.countDocuments({
            orderStatus: 'pending'
        });
        
        // Count Total Customers
        const totalCustomers = await Register.countDocuments();

        // Calculate completed orders
        const deliveredOrdersCount = await Order.countDocuments({
            orderStatus: 'delivered'
        });

        res.status(200).json({
            totalSales,
            pendingOrders,
            totalCustomers,
            completedOrdersCount: deliveredOrdersCount // Send the new count to the frontend
        });

    } catch (error) {
        console.error('Error fetching sales statistics:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getOrders = async (req, res) => {
    try {
        const { type, search } = req.query;

        if (!type) {
            return res.status(400).json({ message: 'Order type is required' });
        }

        let query = { orderType: type };

        if (search) {
            const isValidObjectId = mongoose.Types.ObjectId.isValid(search);

            if (isValidObjectId) {
                query.$or = [
                    { _id: search },
                    { customer: search }
                ];
            } else {
                // If the search is a string, first find matching customers
                const customers = await Register.find({ 
                    name: { $regex: search, $options: 'i' }
                });

                if (customers.length > 0) {
                    const customerIds = customers.map(customer => customer._id);
                    query.customer = { $in: customerIds };
                } else {
                    // If no customers found, return an empty array and exit
                    return res.status(200).json({ orders: [] });
                }
            }
        }
        
        // Populate the customer field to include customer details
        const orders = await Order.find(query).populate('customer', 'name');
        
        if (!orders) {
            // This is a failsafe. If for some reason the database returns a null, handle it.
            return res.status(404).json({ message: 'No orders found for the given criteria.' });
        }

        res.status(200).json({ orders });
    } catch (error) {
        // Log the full error to your server's console for debugging
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        // Find the order by ID and update its status
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { orderStatus: status },
            { new: true, runValidators: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json({ message: 'Order status updated successfully', order: updatedOrder });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getMonthlySalesData = async (req, res) => {
    try {
        const { orderType } = req.query; // 'Local' or 'Global'
        
        // Define the base match query for completed orders
        let matchQuery = {
            orderStatus: { $in: ['paid', 'shipped', 'delivered'] } 
        };

        // If an orderType is provided, add it to the match query
        if (orderType) {
            matchQuery.orderType = orderType;
        }

        const data = await Order.aggregate([
            {
                $match: matchQuery // Filter based on orderType and status
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                    },
                    totalRevenue: { $sum: "$totalPrice" }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            },
            {
                $project: {
                    _id: 0,
                    month: "$_id.month",
                    year: "$_id.year",
                    totalRevenue: 1
                }
            }
        ]);

        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching monthly sales data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getTopSellingSpices = async (req, res) => {
    try {
        const topSpices = await Order.aggregate([
            // Unwind the items array to treat each spice as a separate document
            { $unwind: '$items' },
            // Group by spice and sum the quantities
            {
                $group: {
                    _id: '$items.spice',
                    totalQuantity: { $sum: '$items.quantity' },
                },
            },
            // Sort by total quantity in descending order
            { $sort: { totalQuantity: -1 } },
            // Optionally, limit to the top N spices (e.g., top 10)
            { $limit: 10 },
            // Populate the spice field to get spice details (name, etc.)
            {
                $lookup: {
                    from: 'spices', // The name of the Spice collection
                    localField: '_id',
                    foreignField: '_id',
                    as: 'spiceInfo'
                }
            },
            // Unwind the spiceInfo array
            { $unwind: '$spiceInfo' },
            // Project the final output with cleaned up fields
            {
                $project: {
                    _id: 0,
                    spiceName: '$spiceInfo.name',
                    totalQuantity: 1,
                }
            }
        ]);
        res.status(200).json(topSpices);
    } catch (error) {
        console.error('Error fetching top selling spices:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getOrderTypeCounts = async (req, res) => {
    try {
        const localCount = await Order.countDocuments({ orderType: 'Local' });
        const globalCount = await Order.countDocuments({ orderType: 'Global' });

        res.json({
            local: localCount,
            global: globalCount
        });
    } catch (error) {
        console.error('Error fetching order type counts:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getOrderStatusCounts = async (req, res) => {
    try {
        const counts = await Order.aggregate([
            {
                $group: {
                    _id: "$orderStatus",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 } // Optional: Sort by status name
            }
        ]);
        res.json(counts);
    } catch (error) {
        console.error('Error fetching order status counts:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// SalesController.js (add this function)
exports.getCustomers = async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};

        if (search) {
            query.name = { $regex: search, $options: 'i' }; // Case-insensitive search
        }

        const customers = await Register.find(query);
        res.status(200).json(customers);
    } catch (error) {
        console.error('Error fetching customer data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};