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
      name: { type: String, default: "PLC Logistic Pvt Ltd" },
      logo: { type: String, default: "assets/icon/logo.jpg" }
    },
    origin: {
      address: { type: String, default: "" }
    },
    destination: {
      address: { type: String, default: "" }
    },
    shipment: {
      date: { type: String, default: "" },
      weight: { type: String, default: "0kg" },
      totalPackages: { type: Number, default: 1 },
      currentPackage: { type: Number, default: 1 }
    },
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice"
    },
    invoice: {
      invoiceNo: { type: String, default: "" }
    },
    returnToOrigin: {
      type: Boolean,
      default: true
    },
    barcode: {
      value: { type: String, default: "" },
      imageUrl: { type: String, default: "https://www.shutterstock.com/image-vector/horizontal-black-barcode-on-white-600nw-1221838477.jpg" }
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

module.exports = mongoose.model("ShippingLabel", shippingLabelSchema);
