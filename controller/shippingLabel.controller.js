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

    const data = await ShippingLabel.findOne({
      userId,
      docketNo
    });

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
