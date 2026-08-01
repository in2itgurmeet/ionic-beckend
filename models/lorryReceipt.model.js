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
    cnNo: {
      type: String,
      default: ""
    },
    gstNo: {
      type: String,
      default: "06AABCU9603R1ZV"
    },
    company: {
      name: { type: String, default: "PLC Logistic Pvt Ltd" },
      logo: { type: String, default: "assets/icon/logo.jpg" },
      address: { type: String, default: "Plot 21, Sector 18, Gurugram, Haryana - 122015" },
      mobile: { type: String, default: "+91 9812345678" },
      email: { type: String, default: "support@plclogistics.com" },
      website: { type: String, default: "www.plclogistics.com" }
    },
    tripDate: {
      type: String,
      default: ""
    },
    vehicle: {
      number: { type: String, default: "" },
      type: { type: String, default: "" },
      rtoNo: { type: String, default: "HR55" }
    },
    driver: {
      name: { type: String, default: "" },
      mobile: { type: String, default: "" },
      licenseNo: { type: String, default: "DL0420110012345" }
    },
    consignor: {
      name: { type: String, default: "" },
      address: { type: String, default: "" },
      pincode: { type: String, default: "201301" },
      mobile: { type: String, default: "" },
      gstin: { type: String, default: "09AAACS1234F1Z2" }
    },
    consignee: {
      name: { type: String, default: "" },
      address: { type: String, default: "" },
      pincode: { type: String, default: "421302" },
      mobile: { type: String, default: "" },
      gstin: { type: String, default: "27AACCA5678H1Z1" }
    },
    invoice: {
      invoiceNo: { type: String, default: "" },
      referenceNo: { type: String, default: "" },
      ewayBillNo: { type: String, default: "" },
      ewayBillExpiry: { type: String, default: "" },
      doNo: { type: String, default: "" },
      gstPaidBy: { type: String, default: "Consignor" },
      containerNo: { type: String, default: "CONT12345" },
      lcNo: { type: String, default: "LC998877" },
      expiryDate: { type: String, default: "" }
    },
    service: {
      type: { type: String, default: "Full Truck Load" },
      containerSize: { type: String, default: "20FT" },
      date: { type: String, default: "" }
    },
    items: [
      {
        description: { type: String, default: "" },
        unit: { type: String, default: "Box" },
        weightKg: { type: Number, default: 0 },
        quantity: { type: Number, default: 0 },
        amount: { type: String, default: "0" },
        dimension: { type: String, default: "" }
      }
    ],
    terms: {
      type: [String],
      default: [
        "Goods once sold will not be accepted.",
        "Transporter not responsible for damage after dispatch."
      ]
    },
    receiver: {
      name: { type: String, default: "" },
      mobile: { type: String, default: "" },
      signature: { type: String, default: "assets/icon/logo.jpg" },
      receivedAt: { type: String, default: "" },
      remarks: { type: String, default: "Goods received in good condition" }
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

module.exports = mongoose.model("LorryReceipt", lorryReceiptSchema);
