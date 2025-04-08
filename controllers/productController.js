const Product = require("../models/Product");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const User = require("../models/User");

require("dotenv").config();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload and save product
const uploadProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      sizes,
      color,
      productDescription,
      productAttributes,
      productStatus,
      genderCategory,
      subCategory,
      shipping,
    } = req.body;

    if (!Array.isArray(productAttributes)) {
      return res
        .status(400)
        .json({ message: "productAttributes must be an array" });
    }

    if (!["available", "available-on-request"].includes(productStatus)) {
      return res.status(400).json({ message: "Invalid product status" });
    }

    if (!["men-outfit", "female-outfit"].includes(genderCategory)) {
      return res.status(400).json({ message: "Invalid gender category" });
    }

    const validSubCategories = [
      "classic",
      "casual",
      "business",
      "joggers",
      "sport",
      "elegant",
      "formal",
    ];
    if (!validSubCategories.includes(subCategory)) {
      return res.status(400).json({ message: "Invalid subcategory" });
    }

    if (shipping !== "free" && !Number.isFinite(Number(shipping))) {
      return res.status(400).json({ message: "Invalid shipping value" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Please upload an image" });
    }

    // Upload image to Cloudinary from buffer
    const cloudUpload = () => {
      return new Promise((resolve, reject) => {
        // Create a stream to handle buffer
        const stream = cloudinary.uploader.upload_stream(
          // Optional: add folder or other upload options:
          // { folder: "morayApparel" },
          (error, result) => {
            if (error) {
              return reject(error);
            }
            resolve(result);
          }
        );

        // Pipe the buffer into the upload stream
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    const result = await cloudUpload();

    const product = new Product({
      name,
      price,
      sizes,
      color,
      productDescription,
      productAttributes,
      productStatus,
      genderCategory,
      subCategory,
      shipping: shipping === "free" ? "free" : parseFloat(shipping),
      imageUrl: result.secure_url, // Save Cloudinary URL
    });

    await product.save();
    res.status(201).json({ message: "Product uploaded successfully", product });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Fetch products by gender category and subcategory
const getProductsByCategory = async (req, res) => {
  try {
    const { genderCategory, subCategory } = req.params;
    const products = await Product.find({ genderCategory, subCategory });

    if (!products.length) {
      return res
        .status(404)
        .json({ message: "No products found in this category" });
    }

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Fetch all products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Add a review to a product
const addReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { comment, rating } = req.body;
    const userId = req.user.id;

    if (!comment || !rating) {
      return res
        .status(400)
        .json({ message: "Comment and rating are required" });
    }

    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.reviews.push({ user: userId, comment, rating });
    await product.save();

    res.status(201).json({ message: "Review added successfully", product });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get reviews for a product
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId).populate({
      path: "reviews.user",
      select: "firstName lastName email",
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ reviews: product.reviews });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Exporting all functions properly
module.exports = {
  uploadProduct,
  getProductsByCategory,
  getAllProducts,
  addReview,
  getProductReviews,
};
