// controllers/paymentController.js
const axios = require("axios");
const Payment = require("../models/payment");
const Order = require("../models/Order");
const Notification = require("../models/Notification");

// Use your Paystack secret key from environment variables
const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

// Initiate Payment: Called from frontend to get the Paystack authorization URL
exports.initiatePayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.body; // order for which payment is made

    // Fetch the order to get amount details
    const order = await Order.findById(orderId);
    if (!order)
      return res.status(404).json({ message: "Order not found" });

    // Calculate amount in kobo (if amount is in NGN)
    const amount = order.totalAmount * 100;

    // Initialize transaction with Paystack
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: req.user.email,
        amount,
        reference: `order_${orderId}_${Date.now()}` // custom unique reference
      },
      {
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          "Content-Type": "application/json"
        }
      }
    );

    if (response.data && response.data.status) {
      const { reference, authorization_url } = response.data.data;

      // Create Payment record in database
      const payment = new Payment({
        user: userId,
        order: orderId,
        amount: order.totalAmount,
        transactionRef: reference,
        status: "pending"
      });
      await payment.save();

      // Return the authorization URL to the frontend
      return res.status(200).json({ 
        authorization_url, 
        paymentId: payment._id 
      });
    } else {
      return res.status(500).json({ message: "Failed to initialize payment" });
    }
  } catch (error) {
    console.error("Payment initiation error:", error.message);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Payment Webhook: Called by Paystack to notify about payment success or failure
exports.paymentWebhook = async (req, res) => {
  try {
    const event = req.body;

    // (Optional) Verify the webhook signature using req.headers["x-paystack-signature"]

    if (event.event === "charge.success") {
      const reference = event.data.reference;
      const payment = await Payment.findOne({ transactionRef: reference });
      if (payment) {
        payment.status = "success";
        payment.paymentDetails = event.data;
        await payment.save();

        // Send notification (pseudo-code for email; implement as needed)
        // sendEmail(req.user.email, "Payment Successful", "Your payment was successful");

        // Create in-app notification
        const notification = new Notification({
          user: payment.user,
          message: "Your payment was successful",
          status: "unread",
          paymentId: payment._id
        });
        await notification.save();
      }
    } else if (event.event === "charge.failed") {
      const reference = event.data.reference;
      const payment = await Payment.findOne({ transactionRef: reference });
      if (payment) {
        payment.status = "failed";
        payment.paymentDetails = event.data;
        await payment.save();

        // Create in-app notification for failure
        const notification = new Notification({
          user: payment.user,
          message: "Your payment was declined",
          status: "unread",
          paymentId: payment._id
        });
        await notification.save();
      }
    }

    // Acknowledge receipt of the webhook event
    res.sendStatus(200);
  } catch (error) {
    console.error("Webhook error:", error.message);
    res.sendStatus(500);
  }
};

// Get Receipt: Returns a receipt object after payment has been made
exports.getReceipt = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId)
      .populate("order")
      .populate("user");
      
    if (!payment)
      return res.status(404).json({ message: "Payment not found" });

    // Construct receipt details
    const receipt = {
      receiptNumber: payment.transactionRef,
      date: payment.createdAt,
      amount: payment.amount,
      status: payment.status,
      orderDetails: payment.order,
      user: payment.user,
      paymentDetails: payment.paymentDetails
    };

    res.status(200).json({ receipt });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
