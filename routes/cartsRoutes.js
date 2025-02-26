const express = require("express");
const {
  addToCart,
  getCart,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/add", authMiddleware, addToCart); // Add product to cart
router.get("/", authMiddleware, getCart); // Get user cart
router.post("/remove", authMiddleware, removeFromCart); // Remove product from cart
router.delete("/clear", authMiddleware, clearCart); // Clear cart

module.exports = router;
