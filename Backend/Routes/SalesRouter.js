// salesRoute.js
const express = require('express');
const router = express.Router();
const salesController = require('../controllers/SalesController');
const { submitQuotation, updateStaffFields, getQuotations, getQuotationById } = require('../controllers/QuotationController'); 
const auth = require('../Middleware/auth');

// Sales Routes
router.get('/stats', auth, salesController.getSalesStats);
router.get('/orders', auth, salesController.getOrders);
router.put('/orders/:orderId/status', auth, salesController.updateOrderStatus);
router.get('/monthly-sales', auth, salesController.getMonthlySalesData);
router.get('/top-spices', auth, salesController.getTopSellingSpices);
router.get('/order-type-counts', auth, salesController.getOrderTypeCounts);
router.get('/order-status-counts', auth, salesController.getOrderStatusCounts);
router.get('/customers', auth, salesController.getCustomers);

// Quotation Routes (merged from QuotationRouter.js)
router.post('/quotations', auth, submitQuotation);
router.put('/quotations/:id/update-staff-fields', auth, updateStaffFields);
router.get('/quotations', auth, getQuotations); // <-- This is the route for your table
router.get('/quotations/:id', auth, getQuotationById);

module.exports = router;