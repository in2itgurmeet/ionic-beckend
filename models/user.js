const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    phone: String,
    password: String,
    profileImage: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["consigner", "driver", "admin"],
      default: "consigner",
    },

    status: {
      type: String,
      default: "active",
    },

    consigner: {
      companyName: String,
      gstNumber: String,
      address: String,
      city: String,
      state: String,
      pincode: String,
    },

    driver: {
      licenseNumber: String,
      licenseExpiry: Date,
      vehicleNumber: String,
      vehicleType: String,
      vehicleCapacity: String,
      aadhaarNumber: String,
      address: String,
      city: String,
      state: String,
      pincode: String,
      fcmToken: {
        type: String,
        default: ""
      },
      isAvailable: {
        type: Boolean,
        default: true,
      },
      isOnline: {
        type: Boolean,
        default: false,
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: String,
    otpExpiry: Date,
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

module.exports = mongoose.model("User", userSchema);
