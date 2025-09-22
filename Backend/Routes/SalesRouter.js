// salesRoute.js (Revised)
const express = require('express');
const router = express.Router();
const salesController = require('../controllers/SalesController');
const { submitQuotation, updateStaffFields, getQuotations, getQuotationById } = require('../controllers/QuotationController');
const auth = require('../Middleware/auth');

// Sales Routes
router.get('/stats', salesController.getSalesStats);
router.get('/orders', salesController.getOrders);
router.put('/orders/:orderId/status', salesController.updateOrderStatus);

// These routes are now public for the SalesManager dashboard
router.get('/monthly-sales', salesController.getMonthlySalesData);
router.get('/top-spices', salesController.getTopSellingSpices);
router.get('/order-type-counts', salesController.getOrderTypeCounts);
router.get('/order-status-counts', salesController.getOrderStatusCounts);
router.get('/customers', salesController.getCustomers);

// Quotation Routes (merged from QuotationRouter.js)
router.post('/quotations', auth, submitQuotation);
router.put('/quotations/:id/update-staff-fields', updateStaffFields);
router.get('/quotations', getQuotations);
router.get('/quotations/:id', getQuotationById);

module.exports = router;