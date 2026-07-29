const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    capacity: {
      type: String,
      required: true,
      trim: true,
    },
    dimensions: {
      type: String,
      required: true,
      trim: true,
    },
    img: {
      type: String,
      default: "https://via.placeholder.com/150",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);
