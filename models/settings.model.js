const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    company: {
      name: { type: String, default: "PLC Logistic Pvt Ltd" },
      logo: { type: String, default: "assets/icon/logo.jpg" },
      address: { type: String, default: "Plot 21, Sector 18, Gurugram, Haryana - 122015" },
      mobile: { type: String, default: "+91 9812345678" },
      email: { type: String, default: "support@plclogistics.com" },
      website: { type: String, default: "www.plclogistics.com" },
      gstNo: { type: String, default: "06AABCU9603R1ZV" }
    },
    taxes: {
      sgstPercent: { type: Number, default: 9 },
      cgstPercent: { type: Number, default: 9 }
    },
    terms: {
      type: [String],
      default: [
        "Goods once sold will not be accepted.",
        "Transporter not responsible for damage after dispatch."
      ]
    },
    charges: {
      transportationPercent: { type: Number, default: 75 },
      loadingUnloadingPercent: { type: Number, default: 25 }
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Settings", settingsSchema);
