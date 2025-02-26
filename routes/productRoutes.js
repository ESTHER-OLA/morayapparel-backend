const express = require("express");
const multer = require("multer");
const {
  uploadProduct,
  getProductsByCategory,
  getAllProducts,
  addReview, getProductReviews
} = require("../controllers/productController");

const router = express.Router();

// Multer middleware for handling file uploads
const upload = multer({ dest: "uploads/" }); // Temporary storage before Cloudinary

// Routes for product
router.post("/upload", upload.single("image"), uploadProduct);
router.get("/:genderCategory/:subCategory", getProductsByCategory);
router.get("/all", getAllProducts);

router.post("/:productId/reviews", authMiddleware, addReview); // Add review
router.get("/:productId/reviews", getProductReviews); // Get reviews

module.exports = router;
