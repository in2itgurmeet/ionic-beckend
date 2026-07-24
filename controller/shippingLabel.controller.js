const mongoose = require("mongoose");
const ShippingLabel = require("../models/shippingLabel.model");

exports.getShippingLabels = async (req, res) => {
  try {
    const userId = req.user.id;

    const data = await ShippingLabel.find({ userId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Shipping Labels Fetched Successfully",
      data
    });

  } catch (error) {
    res.status(500).json({
      message: "Shipping Labels Failed",
      error: error.message
    });
  }
};

exports.getShippingLabelByDocket = async (req, res) => {
  try {
    const userId = req.user.id;
    const { docketNo } = req.params;

    let query = { userId };
    if (mongoose.Types.ObjectId.isValid(docketNo)) {
      query.$or = [{ orderId: docketNo }, { docketNo }];
    } else {
      query.docketNo = docketNo;
    }

    const data = await ShippingLabel.findOne(query);

    res.status(200).json({
      message: "Shipping Label Fetched Successfully",
      data
    });

  } catch (error) {
    res.status(500).json({
      message: "Shipping Label Failed",
      error: error.message
    });
  }
};
