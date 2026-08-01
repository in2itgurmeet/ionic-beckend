const orderService = require("../services/order.service");

exports.step1 = async (req, res) => {
  try {
    const newOrder = await orderService.createOrderStep1(req.user.id, req.body);
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

exports.updateStep1 = async (req, res) => {
  try {
    const order = await orderService.updateOrderStep1(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: "Step 1 Updated Successfully",
      data: order,
    });
  } catch (error) {
    const statusCode = error.message === "Order not found" ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message === "Order not found" ? "Order not found" : "Failed to update Step 1",
      error: error.message,
    });
  }
};

exports.step2 = async (req, res) => {
  try {
    const order = await orderService.updateOrderStep2(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: "Step 2 Saved Successfully",
      data: order,
    });
  } catch (error) {
    const statusCode = error.message === "Order not found" ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message === "Order not found" ? "Order not found" : "Failed Step 2",
      error: error.message,
    });
  }
};

exports.payment = async (req, res) => {
  try {
    const order = await orderService.processPayment(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: "Payment Successful",
      data: order,
    });
  } catch (error) {
    const statusCode = error.message === "Order not found" ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message === "Order not found" ? "Order not found" : "Payment Failed",
      error: error.message,
    });
  }
};

exports.getSingleOrder = async (req, res) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    const orderData = order.toObject ? order.toObject() : { ...order };

    if (req.user && orderData.rejectedBy && orderData.rejectedBy.some(id => id.toString() === req.user.id)) {
      orderData.status = "Rejected";
    }

    res.status(200).json({
      success: true,
      data: orderData,
    });
  } catch (error) {
    const statusCode = error.message === "Order not found" ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message === "Order not found" ? "Order not found" : "Failed to fetch order",
    });
  }
};

exports.orderlist = async (req, res) => {
  try {
    const orders = await orderService.getOrdersByUser(req.user.id);
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

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
    res.status(200).json({
      success: true,
      message: `Order status updated to ${req.body.status}`,
      data: order,
    });
  } catch (error) {
    const statusCode = error.message === "Order not found" ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message === "Order not found" ? "Order not found" : "Failed to update order status",
      error: error.message,
    });
  }
};
