const Order = require("../models/order.model");
const Notification = require("../models/notification.model");

const generateNumber = (prefix) => {
  return prefix + Date.now() + Math.floor(Math.random() * 1000);
};

exports.step1 = async (req, res) => {
  try {
    const { bookingType, pickup, delivery } = req.body;

    const newOrder = await Order.create({
      userId: req.user.id,
      orderId: generateNumber("ORD"),
      trackingId: generateNumber("TRK"),
      tripNo: generateNumber("LR"),
      bookingType,
      pickup,
      delivery,
      status: "Draft",
    });

    res.status(201).json({
      success: true,
      message: "Step 1 Saved Successfully",
      data: newOrder,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed Step 1",
      error: error.message,
    });
  }
};


exports.step2 = async (req, res) => {
  try {
    const {
      referenceNumber,
      consignorCompany,
      consigneeCompany,
      senderName,
      senderMobile,
      receiverName,
      receiverMobile,
      selectedVehicle,
      cargoItems,
      amount,
    } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.consignorCompany = consignorCompany;
    order.consigneeCompany = consigneeCompany;

    order.pickup.person = senderName;
    order.pickup.phone = senderMobile;

    order.delivery.person = receiverName;
    order.delivery.phone = receiverMobile;

    order.lrNo = referenceNumber;
    order.docketNo = referenceNumber;

    if (selectedVehicle?.length > 0) {
      order.vehicle = selectedVehicle[0];
    }

    if (cargoItems?.length > 0) {
      const firstCargo = cargoItems[0];

      order.cargo = {
        goodsDescription: firstCargo.goodsDescription,
        quantity: firstCargo.quantity,
        weight: firstCargo.weight,
        dimension: `${firstCargo.length} x ${firstCargo.width} x ${firstCargo.height}`,
      };

      order.quantity = firstCargo.quantity;
      order.weight = `${firstCargo.weight}kg`;
    }

    order.amount = amount || 0;

    await order.save();

    res.status(200).json({
      success: true,
      message: "Step 2 Saved Successfully",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed Step 2",
      error: error.message,
    });
  }
};



exports.payment = async (req, res) => {
  try {
    const { paymentType, amount, transactionId } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.paymentType = paymentType;
    order.amount = amount;
    order.transactionId = transactionId || null;
    order.paymentStatus = "Success";
    order.status = "Booked";
    order.paidAt = new Date();

    await order.save();

    const notification = await Notification.create({
      recipientId: order.driverId || order.userId,
      title: "New Order Booked",
      message: `Order ${order.orderId} is now booked`,
      type: "ORDER",
      isRead: false
    });

    global.io.emit("newOrder", {
      orderId: order.orderId,
      status: order.status,
    });

    if (order.driverId) {
      global.io.to(order.driverId.toString()).emit("notification", notification);
    }

    res.status(200).json({
      success: true,
      message: "Payment Successful",
      data: order,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Payment Failed",
      error: error.message,
    });
  }
};



exports.getSingleOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
};

exports.orderlist = async (req, res) => {
  try {
    const orders = await Order.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};
