const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  sizes: { type: String, required: true },
  color: { type: String, required: true },
  productDescription: { type: String, required: true },
  productAttributes: { type: [String], required: true },
  productStatus: {
    type: String,
    required: true,
    enum: ["available", "available-on-request"],
  },
  genderCategory: {
    type: String,
    required: true,
    enum: ["men-outfit", "female-outfit"], // Restrict values
  },
  subCategory: {
    type: String,
    required: true,
    enum: [
      "classic",
      "casual",
      "business",
      "joggers",
      "sport",
      "elegant",
      "formal",
    ],
  },
  shipping: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  imageUrl: { type: String, required: true }, // Store image URL from Cloudinary
  createdAt: { type: Date, default: Date.now },

   // Reviews array
   reviews: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      comment: { type: String, required: true },
      rating: { type: Number, required: true, min: 1, max: 5 },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("Product", ProductSchema);
