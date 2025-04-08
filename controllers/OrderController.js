const Order = require("../models/Order");
const Notification = require("../models/Notification");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Function to calculate delivery date
const calculateDeliveryDate = (address, products) => {
  let maxDays = 0;
  products.forEach((item) => {
    if (address.state.toLowerCase() === "lagos") {
      maxDays = Math.max(maxDays, item.productStatus === "available" ? 3 : 5);
    } else if (address.country.toLowerCase() === "nigeria") {
      maxDays = Math.max(maxDays, item.productStatus === "available" ? 5 : 8);
    } else {
      maxDays = 14;
    }
  });

  const today = new Date();
  return new Date(today.setDate(today.getDate() + maxDays));
};

// Place Order
exports.placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { deliveryAddress, useSavedAddress, saveNewAddress } = req.body;

    let cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let finalAddress = req.user.address;
    if (!useSavedAddress) {
      finalAddress = deliveryAddress;
      if (saveNewAddress) {
        req.user.address = deliveryAddress;
        await req.user.save();
      }
    }

    const deliveryDate = calculateDeliveryDate(finalAddress, cart.items);
    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.product.price,
      0
    );

    const order = new Order({
      user: userId,
      items: cart.items,
      deliveryAddress: finalAddress,
      deliveryDate,
      totalAmount,
      orderStatus: "Order Placed",
    });

    await order.save();
    await Cart.findOneAndDelete({ user: userId });

    // Create a new order notification for the admin
    const notification = new Notification({
      message: `New order placed by user ${userId}`,
      orderId: order._id,
      status: "unread",
    });

    await notification.save();

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get User Orders
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ user: userId }).populate("items.product");
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Admin: Get All Orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user items.product");
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Admin: Update Order Status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.orderStatus = orderStatus;
    await order.save();

    res.status(200).json({ message: "Order status updated", order });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Admin: Get Notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ status: "unread" });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
