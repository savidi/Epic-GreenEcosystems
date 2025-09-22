const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/PaymentController");

// Routes
router.post("/calculate", paymentController.calculatePayments);
router.get("/", paymentController.getPaymentsByMonth);   // must exist



module.exports = router;
