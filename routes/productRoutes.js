const express = require("express");
const multer = require("multer");
const productController = require("../controllers/productController");
const { authMiddlewares } = require("../middlewares/authMiddlewares");

const router = express.Router();

// Multer middleware for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Routes for product
router.post("/upload", upload.single("image"), productController.uploadProduct);
router.get(
  "/:genderCategory/:subCategory",
  productController.getProductsByCategory
);
router.get("/all", productController.getAllProducts);
router.post(
  "/:productId/reviews",
  authMiddlewares,
  productController.addReview
); // Add review
router.get("/:productId/reviews", productController.getProductReviews); // Get reviews

module.exports = router;
