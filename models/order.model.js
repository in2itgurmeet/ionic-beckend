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
      type: String,
      trim: true,
    },

    capacity: {
      type: String,
      trim: true,
    },

    amount: {
      type: Number,
      default: 0,
      min: 0,
    },

    paymentType: {
      type: String,
      enum: ["Prepaid", "COD"],
      default: "Prepaid",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("orders", orderSchema);
