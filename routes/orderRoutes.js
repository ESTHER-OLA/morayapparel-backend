const express = require("express");
const {
  placeOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  getNotifications,
} = require("../controllers/OrderController");
const { authMiddlewares } = require("../middlewares/authMiddlewares");
const adminAuth = require("../middlewares/adminAuth");

const router = express.Router();

// User routes
router.post("/place", authMiddlewares, placeOrder);
router.get("/user-orders", authMiddlewares, getUserOrders);

// Admin routes
router.get("/all-orders", adminAuth, getAllOrders); // Get all orders
router.put("/update/:orderId", adminAuth, updateOrderStatus); // Update order status
router.get("/notifications", adminAuth, getNotifications); // Get new order notifications

module.exports = router;
