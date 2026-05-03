const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
  name: String,
  email: String,
  phone: String,
  password: String,

  role: {
    type: String,
    enum: ["consigner", "driver", "admin"],
    default: "consigner"
  },

  status: {
    type: String,
    default: "active"
  },

  consigner: {
    companyName: String,
    gstNumber: String,
    address: String,
    city: String,
    state: String,
    pincode: String
  },

  driver: {
    licenseNumber: String,
    vehicleNumber: String,
    vehicleType: String,
    vehicleCapacity: String,
    aadhaarNumber: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    isAvailable: {
      type: Boolean,
      default: true
    }
  },

  isVerified: {
    type: Boolean,
    default: false
  },

  otp: String,
  otpExpiry: Date

},
{
  timestamps: true,
  versionKey: false
}
);

module.exports = mongoose.model("User", userSchema);
