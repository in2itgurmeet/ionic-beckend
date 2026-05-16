const Order = require("../models/order.model");
const User = require("../models/user");

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

    const query = {
      driverId: driverId
    };

    if (status) {
      query.status = status;
    } else {
      query.status = {
        $in: [
          "Assigned",
          "Pickup Started",
          "In-Transit",
          "Delivered",
          "Cancelled"
        ]
      };
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

      orderId: item.orderId,
      tripNo: item.tripNo,

      status: item.status,
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
// routes/driver.routes.js
