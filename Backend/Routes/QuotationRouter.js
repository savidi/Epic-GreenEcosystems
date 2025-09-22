// QuotationRouter.js (Corrected)
const express = require('express');
const router = express.Router();
const auth = require('../Middleware/auth');
const {
    submitQuotation,
    updateStaffFields,
    getQuotations,
    getQuotationById,
    getCustomerQuotations,
    approveQuotation,
    rejectQuotation,
    getQuotationPdf 
} = require('../controllers/QuotationController');

// All quotation-related endpoints under '/api/quotations'
router.post('/', auth, submitQuotation);
router.get('/staff', auth, getQuotations);
router.get('/customer', auth, getCustomerQuotations);

// This is the correct and only definition for this route.
router.get('/:id', auth, getQuotationById); 

router.put('/:id/update-staff-fields', updateStaffFields);
router.put('/:id/approve', auth, approveQuotation);
router.put('/:id/reject', auth, rejectQuotation);
router.get('/:id/pdf', auth, getQuotationPdf);

module.exports = router;