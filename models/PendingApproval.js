const mongoose = require("mongoose");

const pendingApprovalSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  action: { type: String, enum: ["signup", "login"] },
  createdAt: { type: Date, default: Date.now, expires: 3600 } // auto-delete after 1 hour
});

module.exports = mongoose.model("PendingApproval", pendingApprovalSchema);
