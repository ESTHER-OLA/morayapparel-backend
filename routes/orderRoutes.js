const express = require("express");
const {
  placeOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  getNotifications,
} = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

// User routes
router.post("/place", authMiddleware, placeOrder);
router.get("/user-orders", authMiddleware, getUserOrders);

// Admin routes
router.get("/all-orders", adminAuth, getAllOrders); // Get all orders
router.put("/update/:orderId", adminAuth, updateOrderStatus); // Update order status
router.get("/notifications", adminAuth, getNotifications); // Get new order notifications

module.exports = router;
