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

    docketNo: {
      type: String,
      default: null,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "Draft",
        "Booked",
        "Assigned",
        "Pickup Started",
        "In-Transit",
        "Delivered",
        "Cancelled",
      ],
      default: "Draft",
    },
    bookingType: {
      type: String,
      enum: ["FTL", "PTL"],
      required: true,
    },

    consignorCompany: {
      type: String,
      trim: true,
      default: null,
    },

    consigneeCompany: {
      type: String,
      trim: true,
      default: null,
    },

    pickup: {
      location: {
        type: String,
        required: true,
        trim: true,
      },
      person: String,
      phone: String,
      date: String,
      time: String,
    },

    delivery: {
      location: {
        type: String,
        required: true,
        trim: true,
      },
      person: String,
      phone: String,
      date: String,
      time: String,
    },

    weight: {
      type: String,
      default: "0kg",
    },

    quantity: {
      type: Number,
      default: 0,
    },

    vehicle: {
      name: String,
      number: String,
      capacity: String,
      dimension: String,
    },

    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    driver: {
      name: String,
      mobile: String,
    },

    acceptedAt: {
      type: Date,
      default: null,
    },

    pickupStartedAt: {
      type: Date,
      default: null,
    },

    deliveredAt: {
      type: Date,
      default: null,
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
    },

    paymentType: {
      type: String,
      enum: ["Prepaid", "COD", "TO_PAY", "UPI"],
      default: "Prepaid",
    },

    upiId: {
      type: String,
      default: null,
    },

    transactionId: {
      type: String,
      default: null,
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Success", "Failed"],
      default: "Pending",
    },

    paidAt: {
      type: Date,
      default: null,
    },

    distance: {
      type: String,
      default: null,
    },

    expectedTravelTime: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

module.exports = mongoose.model("orders", orderSchema);
