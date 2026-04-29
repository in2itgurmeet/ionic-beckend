
const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
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

  invoiceId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  invoiceNo: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  date: String,
  dueDate: String,

  paymentType: {
    type: String,
    enum: ["Prepaid", "COD", "TO_PAY"],
    default: "TO_PAY"
  },

  company: {
    name: String,
    logo: String,
    address: String,
    mobile: String,
    email: String
  },

  customer: {
    name: String,
    mobile: String,
    email: String,
    address: String
  },

  charges: {
    transportation: {
      type: Number,
      default: 0
    },
    loadingUnloading: {
      type: Number,
      default: 0
    }
  },

  tax: {
    sgstPercent: {
      type: Number,
      default: 9
    },
    cgstPercent: {
      type: Number,
      default: 9
    },
    sgstAmount: {
      type: Number,
      default: 0
    },
    cgstAmount: {
      type: Number,
      default: 0
    }
  },

  total: {
    gross: {
      type: Number,
      default: 0
    },
    final: {
      type: Number,
      default: 0
    },
    paid: {
      type: Number,
      default: 0
    },
    outstanding: {
      type: Number,
      default: 0
    }
  },

  payment: {
    status: {
      type: String,
      enum: ["PAID", "PARTIAL", "UNPAID"],
      default: "UNPAID"
    },
    method: String,
    transactionId: String
  },

  notes: String
},
{
  timestamps: true,
  versionKey: false
}
);

module.exports = mongoose.model("Invoice", invoiceSchema);
