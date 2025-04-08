// routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { authMiddlewares } = require("../middlewares/authMiddlewares");

// Endpoint to initiate payment using a credit card via Paystack
router.post("/initiate", authMiddlewares, paymentController.initiatePayment);

// Paystack webhook endpoint to handle payment status updates
router.post("/webhook", paymentController.paymentWebhook);

// Endpoint to get payment receipt after successful payment
router.get(
  "/receipt/:paymentId",
  authMiddlewares,
  paymentController.getReceipt
);

module.exports = router;
