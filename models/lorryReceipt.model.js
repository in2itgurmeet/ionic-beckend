const mongoose = require("mongoose");
const lorryReceiptSchema = new mongoose.Schema(
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

  lrNo: {
    type: String,
    required: true,
    unique: true
  },

  consignor: {
    name: String,
    mobile: String,
    address: String
  },

  consignee: {
    name: String,
    mobile: String,
    address: String
  },

  vehicle: {
    vehicleNo: String,
    vehicleType: String,
    driverName: String,
    driverMobile: String
  },

  goods: {
    description: String,
    weight: Number,
    quantity: Number
  },

  freight: {
    type: Number,
    default: 0
  }
},
{
  timestamps: true,
  versionKey: false
}
);

module.exports = mongoose.model(
  "LorryReceipt",
  lorryReceiptSchema
);
