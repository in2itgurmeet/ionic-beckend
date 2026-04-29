const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
{
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  orderId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },

  tripNo: {
    type: String,
    default: null,
    trim: true,
  },

  trackingId: {
    type: String,
    default: null,
    trim: true,
  },
  lrNo: {
    type: String,
    default: null,
    trim: true,
  },

  // Docket Number
  docketNo: {
    type: String,
    default: null,
    trim: true,
  },

  status: {
    type: String,
    enum: [
      "Pending",
      "Booked",
      "In-Transit",
      "Delivered",
      "Cancelled",
    ],
    default: "Pending",
  },

  bookingType: {
    type: String,
    enum: ["FTL", "PTL"],
    required: true,
  },

  pickup: {
    location: {
      type: String,
      required: true,
      trim: true,
    },
    person: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    date: String,
    time: String,
  },

  delivery: {
    location: {
      type: String,
      required: true,
      trim: true,
    },
    person: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    date: String,
    time: String,
  },

  weight: {
    type: String,
    trim: true,
    default: "0kg",
  },

  quantity: {
    type: Number,
    default: 0,
    min: 0,
  },

  vehicle: {
    name: String,
    number: String,
    capacity: String,
    dimension: String,
  },

  driver: {
    name: String,
    mobile: String,
  },

  cargo: {
    goodsDescription: String,
    quantity: Number,
    weight: Number,
    dimension: String,
  },

  amount: {
    type: Number,
    default: 0,
    min: 0,
  },

  paymentType: {
    type: String,
    enum: ["Prepaid", "COD", "TO_PAY"],
    default: "Prepaid",
  },
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Invoice",
    default: null,
  },

  shippingLabelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ShippingLabel",
    default: null,
  },

  lorryReceiptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LorryReceipt",
    default: null,
  },

  proofDeliveryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProofDelivery",
    default: null,
  },

},
{
  timestamps: true,
  versionKey: false,
}
);

module.exports = mongoose.model("orders", orderSchema);
