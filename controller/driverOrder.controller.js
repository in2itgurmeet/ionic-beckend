const Order = require("../models/order.model");
const User = require("../models/user");
const LorryReceipt = require("../models/lorryReceipt.model");
const ProofDelivery = require("../models/proofDelivery.model");

const getNumber = (val) => {
  if (!val) return 0;
  return parseInt(val.toString().replace(/[^0-9]/g, "")) || 0;
};

exports.getDriverOrders = async (req, res) => {
  try {
    const driverId = req.user.id;
    const driver = await User.findById(driverId);
    if (!driver || driver.role !== "driver") {
      return res.status(403).json({
        success: false,
        message: "Only driver can access",
      });
    }

    const driverType = driver.driver?.vehicleType?.toLowerCase();

    const driverCapacity = getNumber(driver.driver?.vehicleCapacity);

    const orders = await Order.find({
      status: "Booked",
    });

    const filteredOrders = orders.filter((order) => {
      // Exclude orders rejected by this driver
      if (order.rejectedBy && order.rejectedBy.some((id) => id.toString() === driverId)) {
        return false;
      }
      /* OLD + NEW BOTH SUPPORT */
      const vehicles =
        order.selectedVehicle?.length > 0
          ? order.selectedVehicle
          : order.vehicle
            ? [order.vehicle]
            : [];

      return vehicles.some((vehicle) => {
        const orderType = vehicle?.name?.toLowerCase();

        const orderCapacity = getNumber(vehicle?.capacity);

        const typeMatch = orderType === driverType;

        const capacityMatch = orderCapacity <= driverCapacity;

        return typeMatch && capacityMatch;
      });
    }).map((order) => {
      const o = order.toObject();
      o.rejected = o.rejectedBy && o.rejectedBy.some((id) => id.toString() === driverId);
      return o;
    });

    return res.status(200).json({
      success: true,
      count: filteredOrders.length,
      data: filteredOrders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===================================================
   ACCEPT ORDER
=================================================== */
exports.acceptOrder = async (req, res) => {
  try {
    const driverId = req.user.id;
    const { orderId } = req.params;

    const driver = await User.findById(driverId);

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.status !== "Booked") {
      return res.status(400).json({
        success: false,
        message: "Order already assigned",
      });
    }

    order.driverId = driverId;

    order.driver = {
      name: driver.name,
      mobile: driver.phone,
    };

    order.vehicle = {
      name: driver.driver?.vehicleType,
      number: driver.driver?.vehicleNumber,
      capacity: driver.driver?.vehicleCapacity,
      dimension: driver.driver?.vehicleDimension,
    };

    order.status = "Assigned";
    order.acceptedAt = new Date();

    await order.save();

    await LorryReceipt.findOneAndUpdate(
      { orderId: order._id },
      {
        vehicle: {
          number: driver.driver?.vehicleNumber || "",
          type: driver.driver?.vehicleType || "",
          rtoNo: ""
        },
        driver: {
          name: driver.name || "",
          mobile: driver.phone || "",
          licenseNo: driver.driver?.licenseNumber || ""
        }
      }
    );

    global.io.emit("orderAccepted", {
      orderId: order.orderId,
      driverId,
    });

    return res.status(200).json({
      success: true,
      message: "Order Accepted",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===================================================
   REJECT ORDER
=================================================== */
exports.rejectOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    order.driverId = null;
    order.driver = null;
    order.status = "Booked";
    
    const driverId = req.user.id;
    if (!order.rejectedBy) order.rejectedBy = [];
    if (!order.rejectedBy.includes(driverId)) {
      order.rejectedBy.push(driverId);
    }

    await order.save();

    global.io.emit("orderRejected", {
      orderId: order.orderId,
    });

    return res.status(200).json({
      success: true,
      message: "Order Rejected",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getDriverHistory = async (req, res) => {
  try {
    const driverId = req.user.id;

    const {
      status,
      search = "",
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    if (!status) {
      query.$or = [
        {
          driverId: driverId,
          status: {
            $in: [
              "Assigned",
              "Pickup Started",
              "In-Transit",
              "Delivered",
              "Cancelled"
            ]
          }
        },
        {
          rejectedBy: driverId
        }
      ];
    } else if (status === 'Rejected') {
      query.rejectedBy = driverId;
    } else {
      query.driverId = driverId;
      query.status = status;
    }

    /* SEARCH FILTER */
    if (search) {
      query.$or = [
        {
          orderId: {
            $regex: search,
            $options: "i"
          }
        },
        {
          tripNo: {
            $regex: search,
            $options: "i"
          }
        },
        {
          "pickup.location": {
            $regex: search,
            $options: "i"
          }
        },
        {
          "delivery.location": {
            $regex: search,
            $options: "i"
          }
        },
        {
          "pickup.person": {
            $regex: search,
            $options: "i"
          }
        },
        {
          "delivery.person": {
            $regex: search,
            $options: "i"
          }
        }
      ];
    }

    const currentPage = parseInt(page);
    const perPage = parseInt(limit);

    const skip = (currentPage - 1) * perPage;

    const total = await Order.countDocuments(query);

    const orders = await Order.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(perPage);

    const finalData = orders.map((item, index) => ({
      id: skip + index + 1,
      _id: item._id,
      orderId: item.orderId,
      tripNo: item.tripNo,

      status: (item.rejectedBy && item.rejectedBy.some(id => id.toString() === driverId)) ? "Rejected" : item.status,
      bookingType: item.bookingType,

      pickup: {
        location: item.pickup?.location,
        person: item.pickup?.person,
        phone: item.pickup?.phone
      },

      delivery: {
        location: item.delivery?.location,
        person: item.delivery?.person,
        phone: item.delivery?.phone
      },

      weight: item.weight,
      quantity: item.quantity,

      vehicle: item.vehicle?.name,
      capacity: item.vehicle?.capacity,

      amount: item.amount,
      paymentType: item.paymentType
    }));

    return res.status(200).json({
      success: true,
      total,
      page: currentPage,
      limit: perPage,
      totalPages: Math.ceil(total / perPage),
      data: finalData
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ===================================================
   UPDATE ORDER STATUS (DRIVER ACTIONS)
=================================================== */
exports.updateDriverOrderStatus = async (req, res) => {
  try {
    const driverId = req.user.id;
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ["Draft", "Booked", "Assigned", "Pickup Started", "In-Transit", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.driverId?.toString() !== driverId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this order status",
      });
    }

    order.status = status;
    if (status === "Pickup Started") {
      order.pickupStartedAt = new Date();
    } else if (status === "In-Transit") {
      // Transit start
    } else if (status === "Delivered") {
      order.deliveredAt = new Date();
    }

    await order.save();

    // Trigger socket notifications
    global.io.emit("orderStatusUpdated", {
      orderId: order.orderId,
      status: order.status,
    });

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===================================================
   UPLOAD DRIVER POD (DELIVER TRIP)
=================================================== */
const { uploadToCloudinary } = require('../utils/cloudinary');

exports.uploadDriverPOD = async (req, res) => {
  try {
    const driverId = req.user.id;
    const { orderId } = req.params;
    let { signatureImage, deliveryPhoto, remarks, receiverName, receiverMobile } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.driverId?.toString() !== driverId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to upload POD for this order",
      });
    }
    
    // Upload base64 strings to Cloudinary
    if (signatureImage && signatureImage.startsWith('data:')) {
      signatureImage = await uploadToCloudinary(signatureImage, 'pod_signatures');
    }
    if (deliveryPhoto && deliveryPhoto.startsWith('data:')) {
      deliveryPhoto = await uploadToCloudinary(deliveryPhoto, 'pod_photos');
    }

    // Update order status to Delivered
    order.status = "Delivered";
    order.deliveredAt = new Date();
    await order.save();

    // Create or update ProofDelivery record
    const updatedPOD = await ProofDelivery.findOneAndUpdate(
      { orderId: order._id },
      {
        deliveredAt: new Date().toLocaleString(),
        status: "Delivered",
        signatureImage: signatureImage || "assets/icon/logo.jpg",
        deliveryPhoto: deliveryPhoto || "",
        remarks: remarks || "Goods delivered successfully",
        receiver: {
          name: receiverName || order.delivery?.person || "",
          mobile: receiverMobile || order.delivery?.phone || ""
        }
      },
      { new: true, upsert: true }
    );

    // Emit updates
    global.io.emit("orderStatusUpdated", {
      orderId: order.orderId,
      status: order.status,
    });

    return res.status(200).json({
      success: true,
      message: "Proof of Delivery uploaded successfully",
      data: updatedPOD,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===================================================
   GET DRIVER STATISTICS (TILES INFO)
=================================================== */
exports.getDriverStats = async (req, res) => {
  try {
    const driverId = req.user.id;

    // Find all delivered/completed orders for this driver
    const completedOrders = await Order.find({
      driverId,
      status: "Delivered"
    });

    const totalCompleted = completedOrders.length;
    
    let totalEarnings = 0;
    let totalKm = 0;

    completedOrders.forEach(order => {
      totalEarnings += order.amount || 0;
      if (order.distance) {
        // Parse numerical distance from string (e.g. "293 km" or "1200 km")
        const kmVal = parseInt(order.distance.toString().replace(/[^0-9]/g, "")) || 0;
        totalKm += kmVal;
      }
    });

    // Tips feature not implemented yet, so setting it to 0 instead of fake data
    const totalTips = 0;

    return res.status(200).json({
      success: true,
      data: {
        totalCompleted,
        totalEarnings,
        totalTips,
        totalKm
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
// routes/driver.routes.js
