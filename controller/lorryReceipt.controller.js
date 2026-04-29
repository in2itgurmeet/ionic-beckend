const LorryReceipt = require("../models/lorryReceipt.model");

exports.getLorryReceipts = async (req, res) => {
  try {
    const userId = req.user.id;

    const data = await LorryReceipt.find({ userId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Lorry Receipts Fetched Successfully",
      data
    });

  } catch (error) {
    res.status(500).json({
      message: "Lorry Receipt Failed",
      error: error.message
    });
  }
};

exports.getLorryReceiptByNo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { lrNo } = req.params;

    const data = await LorryReceipt.findOne({
      userId,
      lrNo
    });

    res.status(200).json({
      message: "Lorry Receipt Fetched Successfully",
      data
    });

  } catch (error) {
    res.status(500).json({
      message: "Lorry Receipt Failed",
      error: error.message
    });
  }
};
