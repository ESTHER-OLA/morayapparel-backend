const express = require("express");
const {
  addToCart,
  getCart,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");
const { authMiddlewares } = require("../middlewares/authMiddlewares");

const router = express.Router();

router.post("/add", authMiddlewares, addToCart); // Add product to cart
router.get("/", authMiddlewares, getCart); // Get user cart
router.post("/remove", authMiddlewares, removeFromCart); // Remove product from cart
router.delete("/clear", authMiddlewares, clearCart); // Clear cart

module.exports = router;
