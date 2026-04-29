
const ProofDelivery = require("../models/proofDelivery.model");

exports.getProofDeliveries = async (req, res) => {
  try {
    const userId = req.user.id;

    const data = await ProofDelivery.find({ userId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Proof Of Delivery List Fetched Successfully",
      data
    });

  } catch (error) {
    res.status(500).json({
      message: "Proof Delivery Failed",
      error: error.message
    });
  }
};

exports.getProofDeliveryByOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;

    const data = await ProofDelivery.findOne({
      userId,
      orderId
    });

    res.status(200).json({
      message: "Proof Of Delivery Fetched Successfully",
      data
    });

  } catch (error) {
    res.status(500).json({
      message: "Proof Delivery Failed",
      error: error.message
    });
  }
};
