const mongoose = require("mongoose");
const shippingLabelSchema = new mongoose.Schema(
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
  docketNo: {
    type: String,
    required: true,
    unique: true
  },
  company: {
    name: String,
    logo: String
  },
  origin: {
    address: String
  },
  destination: {
    address: String
  },
  shipment: {
    date: String,
    weight: String,
    totalPackages: Number,
    currentPackage: Number
  },
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Invoice"
  },
  returnToOrigin: {
    type: Boolean,
    default: false
  },
  barcode: {
    value: String,
    imageUrl: String
  }
},
{
  timestamps: true,
  versionKey: false
}
);
module.exports = mongoose.model(
  "ShippingLabel",
  shippingLabelSchema
);
