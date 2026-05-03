const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    title: String,
    message: String,
    type: {
      type: String,
      enum: ["ORDER", "SYSTEM"],
      default: "ORDER"
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

module.exports = mongoose.model("Notification", notificationSchema);
