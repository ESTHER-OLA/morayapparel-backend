const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, required: true },
    },
  ],
  deliveryAddress: {
    firstName: String,
    lastName: String,
    country: String,
    state: String,
    city: String,
    phoneNumber: String,
    address: String,
  },
  orderDate: { type: Date, default: Date.now },
  deliveryDate: { type: Date },
  totalAmount: { type: Number, required: true },
  orderStatus: {
    type: String,
    enum: ["Order Placed", "In Progress", "Shipped", "Delivered"],
    default: "Order Placed",
  },
});

module.exports = mongoose.model("Order", OrderSchema);
