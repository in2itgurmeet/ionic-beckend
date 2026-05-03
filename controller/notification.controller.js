const Notification = require("../models/notification.model");
const Order = require("../models/order.model");
const User = require("../models/user");

exports.sendNotification = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    const notification = await Notification.create({
      recipientId: order.driverId || order.userId,

      title: `${order.consignorCompany} - New Order Booked`,

      message: `${order.pickup?.person} created a shipment for ${order.consigneeCompany}`,

      type: "ORDER",

      isRead: false,

      meta: {
        orderId: order.orderId,
        consignorCompany: order.consignorCompany,
        consigneeCompany: order.consigneeCompany,
        senderName: order.pickup?.person,
        receiverName: order.delivery?.person,
        cargo: order.cargo,
        quantity: order.quantity,
        weight: order.weight
      }
    });

    global.io.to(order.driverId?.toString()).emit("notification", notification);

    res.status(200).json({
      success: true,
      message: "Notification sent",
      data: notification
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};





exports.getNotifications = async (req, res) => {
  try {
    const driverId = req.user.id;

    const notifications = await Notification.find({
      recipientId: driverId
    }).sort({ createdAt: -1 });

    const unreadCount = await Notification.countDocuments({
      recipientId: driverId,
      isRead: false
    });

    res.status(200).json({
      success: true,
      data: notifications,
      unreadCount
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    notification.isRead = true;
    await notification.save();

    global.io.to(notification.recipientId.toString())
      .emit("notificationRead", { id });

    res.status(200).json({
      success: true,
      message: "Marked as read"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};





