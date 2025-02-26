// routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { verifyToken } = require("../middlewares/authMiddleware"); // adjust based on your implementation

// Endpoint to initiate payment using a credit card via Paystack
router.post("/initiate", verifyToken, paymentController.initiatePayment);

// Paystack webhook endpoint to handle payment status updates
router.post("/webhook", paymentController.paymentWebhook);

// Endpoint to get payment receipt after successful payment
router.get("/receipt/:paymentId", verifyToken, paymentController.getReceipt);

module.exports = router;
