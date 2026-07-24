const mongoose = require("mongoose");
const Invoice = require("../models/invoice.model");

exports.getInvoiceList = async (req, res) => {
  try {
    const userId = req.user.id;

    const data = await Invoice.find({ userId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Invoice List Fetched Successfully",
      data
    });

  } catch (error) {
    res.status(500).json({
      message: "Invoice Fetch Failed",
      error: error.message
    });
  }
};

exports.getInvoiceByNo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { invoiceNo } = req.params;

    let query = { userId };
    if (mongoose.Types.ObjectId.isValid(invoiceNo)) {
      query.$or = [{ orderId: invoiceNo }, { invoiceNo }];
    } else {
      query.invoiceNo = invoiceNo;
    }

    const data = await Invoice.findOne(query);

    if (!data) {
      return res.status(404).json({
        message: "Invoice Not Found"
      });
    }

    res.status(200).json({
      message: "Invoice Details Fetched Successfully",
      data
    });

  } catch (error) {
    res.status(500).json({
      message: "Invoice Details Failed",
      error: error.message
    });
  }
};
