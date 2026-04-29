const Order = require("../models/order.model");

const generateNumber = (prefix) => {
  return prefix + Date.now() + Math.floor(Math.random() * 1000);
};

exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    const orderId = generateNumber("ORD");
    const trackingId = generateNumber("TRK");
    const tripNo = generateNumber("LR/");

    const newOrder = new Order({
      userId,
      orderId,
      trackingId,
      tripNo,

      bookingType: req.body.bookingType,
      paymentType: req.body.paymentType,

      pickup: req.body.pickup,
      delivery: req.body.delivery,

      customer: req.body.customer,
      sender: req.body.sender,
      receiver: req.body.receiver,

      referenceNumber: req.body.referenceNumber,

      vehicle: req.body.vehicle,

      cargoItems: req.body.cargoItems,

      distanceKM: req.body.distanceKM,
      expectedTravelTime: req.body.expectedTravelTime,

      charges: req.body.charges,

      payment: req.body.payment,

      documents: req.body.documents,

      timeline: [
        {
          status: "Pending",
          message: "Order Created",
        },
      ],
    });

    await newOrder.save();

    res.status(201).json({
      success: true,
      message: "Order Created Successfully",
      data: newOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
};
