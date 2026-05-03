const Order = require("../models/order.model");
const User = require("../models/user");


const getNumber = (val) => {
  if (!val) return 0;
  return parseInt(val.toString().replace(/[^0-9]/g, "")) || 0;
};

exports.getDriverOrders = async (req, res) => {
  try {
    const driverId = req.user.id;

    console.log("👉 DRIVER ID:", driverId);

    const driver = await User.findById(driverId);

    console.log("👉 DRIVER DATA:", driver);

    if (!driver || driver.role !== "driver") {
      console.log("❌ Invalid driver");
      return res.status(403).json({
        success: false,
        message: "Only driver can access"
      });
    }

    const orders = await Order.find({ status: "Booked" });

    console.log("👉 TOTAL ORDERS:", orders.length);
    console.log("👉 ORDERS LIST:", orders);

    const driverType = driver.driver?.vehicleType?.toLowerCase();
    const driverCapacity = getNumber(driver.driver?.vehicleCapacity);

    console.log("👉 DRIVER TYPE:", driverType);
    console.log("👉 DRIVER CAPACITY:", driverCapacity);

    const filteredOrders = orders.filter((order) => {

      const orderType = order.vehicle?.name?.toLowerCase();
      const orderCapacity = getNumber(order.vehicle?.capacity);

      console.log("-----------------------------");
      console.log("ORDER TYPE:", orderType);
      console.log("ORDER CAPACITY:", orderCapacity);

      const typeMatch = orderType === driverType;
      const capacityMatch = orderCapacity <= driverCapacity;

      console.log("TYPE MATCH:", typeMatch);
      console.log("CAPACITY MATCH:", capacityMatch);

      return typeMatch && capacityMatch;
    });

    console.log("👉 FILTERED ORDERS COUNT:", filteredOrders.length);
    console.log("👉 FILTERED ORDERS:", filteredOrders);

    return res.status(200).json({
      success: true,
      count: filteredOrders.length,
      data: filteredOrders
    });

  } catch (error) {
    console.log("❌ ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



exports.acceptOrder = async (req, res) => {
  try {
    const driverId = req.user.id;
    const { orderId } = req.params;

    const driver = await User.findById(driverId);

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    order.driverId = driverId;
    order.driver = {
      name: driver.name,
      mobile: driver.phone
    };

    order.status = "Assigned";
    order.acceptedAt = new Date();

    await order.save();

    global.io.emit("orderAccepted", {
      orderId: order.orderId,
      driverId
    });

    res.status(200).json({
      success: true,
      message: "Order Accepted",
      data: order
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.rejectOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    order.driverId = null;
    order.driver = null;
    order.status = "Booked";

    await order.save();

    global.io.emit("orderRejected", {
      orderId: order.orderId
    });

    res.status(200).json({
      success: true,
      message: "Order Rejected",
      data: order
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
