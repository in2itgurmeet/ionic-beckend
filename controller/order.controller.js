const express = require("express");
const router = express.Router();
const Order = require("../models/order.model");
const auth = require("../middleware/authMiddleware");

const generateNumber = (prefix) => {
  return prefix + Date.now() + Math.floor(Math.random() * 1000);
};

router.post("/step1", auth, async (req, res) => {
  try {
    const newOrder = await Order.create({
      userId: req.user.id,
      orderId: generateNumber("ORD"),
      trackingId: generateNumber("TRK"),
      tripNo: generateNumber("LR"),
      bookingType: req.body.bookingType,
      pickup: {
        location: req.body.pickup,
      },
      delivery: {
        location: req.body.delivery,
      },
      status: "Pending",
    });

    res.status(201).json({
      message: "Step 1 Saved",
      data: newOrder,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed Step 1",
      error: error.message,
    });
  }
});

router.put("/step2/:id", auth, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        pickup: {
          ...req.body.pickup,
        },
        delivery: {
          ...req.body.delivery,
        },
        weight: req.body.weight,
        quantity: req.body.quantity,
        vehicle: req.body.vehicle,
        capacity: req.body.capacity,
      },
      { new: true },
    );

    res.status(200).json({
      message: "Step 2 Saved",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed Step 2",
      error: error.message,
    });
  }
});

router.put("/payment/:id", auth, async (req, res) => {
  try {
    const { paymentType, amount, transactionId } = req.body;
    if (!paymentType || !amount) {
      return res.status(400).json({
        message: "PaymentType and Amount are required",
      });
    }
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }
    order.paymentType = paymentType;
    order.amount = amount;
    order.status = "Booked";
    order.paymentStatus = "Success";
    order.transactionId = transactionId || null;
    order.paidAt = new Date();
    await order.save();
    res.status(200).json({
      message: "Payment Successful & Order Booked",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Payment Failed",
      error: error.message,
    });
  }
});


router.get("/:id", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({
      message: "Order not found",
    });
  }
});

router.get("/orderlist", auth, async (req, res) => {
  try {
    const orders = await Order.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch orders",
    });
  }
});

module.exports = router;
