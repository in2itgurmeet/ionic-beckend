const mongoose = require("mongoose");

const proofDeliverySchema = new mongoose.Schema(
{
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "orders",
    required: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  receiver: {
    name: String,
    mobile: String
  },

  deliveredAt: String,

  signatureImage: String,
  deliveryPhoto: String,

  remarks: String,

  status: {
    type: String,
    default: "Delivered"
  }
},
{
  timestamps: true,
  versionKey: false
}
);

module.exports = mongoose.model(
  "ProofDelivery",
  proofDeliverySchema
);
