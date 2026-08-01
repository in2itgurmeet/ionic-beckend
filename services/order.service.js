const Order = require("../models/order.model");
const Notification = require("../models/notification.model");
const Invoice = require("../models/invoice.model");
const LorryReceipt = require("../models/lorryReceipt.model");
const ShippingLabel = require("../models/shippingLabel.model");
const ProofDelivery = require("../models/proofDelivery.model");
const User = require("../models/user");
const Settings = require("../models/settings.model");
const mapService = require("./map.service");
const barcodeUtils = require("../utils/barcode");

const generateNumber = (prefix) => {
  return prefix + Date.now() + Math.floor(Math.random() * 1000);
};

exports.createOrderStep1 = async (userId, data) => {
  const { bookingType, pickup, delivery } = data;

  let distanceStr = "0 km";
  let expectedTravelTime = "N/A";
  
  if (pickup?.location && delivery?.location) {
    const pickupCoords = await mapService.geocodeAddress(pickup.location);
    const deliveryCoords = await mapService.geocodeAddress(delivery.location);
    
    if (pickupCoords && deliveryCoords) {
      const routeData = await mapService.calculateRoute(pickupCoords, deliveryCoords);
      if (routeData) {
        distanceStr = `${routeData.distanceKm} km`;
        const expectedDays = Math.ceil(routeData.distanceKm / 400);
        expectedTravelTime = expectedDays > 0 ? `${expectedDays} Day${expectedDays > 1 ? 's' : ''}` : 'Same Day';
      }
    }
  }

  const newOrder = await Order.create({
    userId,
    orderId: generateNumber("ORD"),
    trackingId: generateNumber("TRK"),
    tripNo: generateNumber("LR"),
    bookingType,
    pickup,
    delivery,
    distance: distanceStr,
    expectedTravelTime,
    status: "Draft",
  });

  return newOrder;
};

exports.updateOrderStep1 = async (orderId, data) => {
  const { bookingType, pickup, delivery } = data;

  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error("Order not found");
  }

  let distanceStr = order.distance;
  let expectedTravelTime = order.expectedTravelTime;

  if (pickup?.location && delivery?.location) {
    const pickupCoords = await mapService.geocodeAddress(pickup.location);
    const deliveryCoords = await mapService.geocodeAddress(delivery.location);
    
    if (pickupCoords && deliveryCoords) {
      const routeData = await mapService.calculateRoute(pickupCoords, deliveryCoords);
      if (routeData) {
        distanceStr = `${routeData.distanceKm} km`;
        const expectedDays = Math.ceil(routeData.distanceKm / 400);
        expectedTravelTime = expectedDays > 0 ? `${expectedDays} Day${expectedDays > 1 ? 's' : ''}` : 'Same Day';
      }
    }
  }

  order.bookingType = bookingType;
  
  if (pickup) {
    if (!order.pickup) order.pickup = {};
    order.pickup.location = pickup.location;
    order.pickup.date = pickup.date;
    order.pickup.time = pickup.time;
  }

  if (delivery) {
    if (!order.delivery) order.delivery = {};
    order.delivery.location = delivery.location;
    order.delivery.date = delivery.date;
    order.delivery.time = delivery.time;
  }

  order.distance = distanceStr;
  order.expectedTravelTime = expectedTravelTime;

  await order.save();
  return order;
};

exports.updateOrderStep2 = async (orderId, data) => {
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
    freight,
    loadingCharge,
    unloadingCharge
  } = data;

  const order = await Order.findById(orderId);

  if (!order) {
    throw new Error("Order not found");
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
    const v = selectedVehicle[0];
    order.vehicle = {
      name: v.name,
      number: v.number || null,
      capacity: v.capacity,
      dimension: v.dimensions || v.dimension || null,
    };
  }

  if (cargoItems?.length > 0) {
    order.cargo = cargoItems.map(item => {
      let dimensionStr = "N/A";
      if (item.length != null && item.width != null && item.height != null) {
        dimensionStr = `${item.length} x ${item.width} x ${item.height}`;
      } else if (item.dimensionCM) {
        dimensionStr = `${item.dimensionCM} CM³`;
      }
      return {
        goodsDescription: item.goodsDescription,
        quantity: item.quantity,
        weight: item.weight,
        dimension: dimensionStr,
      };
    });

    order.quantity = cargoItems.reduce((acc, item) => acc + (item.quantity || 0), 0);
    order.weight = `${cargoItems.reduce((acc, item) => acc + (item.weight || 0), 0)}kg`;
  }

  order.amount = amount || 0;
  
  order.charges = {
    freight: freight || amount || 0,
    loading: loadingCharge || 0,
    unloading: unloadingCharge || 0,
  };

  await order.save();
  return order;
};

exports.processPayment = async (orderId, data) => {
  const { paymentType, amount, transactionId, upiId } = data;
  const order = await Order.findById(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  const user = await User.findById(order.userId);
  let driver = null;
  if (order.driverId) {
    driver = await User.findById(order.driverId);
  }

  // Fetch Settings
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});

  order.paymentType = paymentType;
  order.amount = amount;
  order.transactionId = transactionId || null;
  order.upiId = upiId || null;
  order.paymentStatus = "Success";
  order.status = "Booked";
  order.paidAt = new Date();

  await order.save();

  // Generate Invoice
  const invoiceId = generateNumber("INV");
  const invoiceNo = `INV/${new Date().getFullYear().toString().slice(-2)}-${(new Date().getFullYear() + 1).toString().slice(-2)}/${Math.floor(10000 + Math.random() * 90000)}`;

  const sgstPercent = settings.taxes.sgstPercent / 100;
  const cgstPercent = settings.taxes.cgstPercent / 100;
  
  const transportationCharge = order.charges?.freight || order.amount;
  const loadingUnloadingCharge = (order.charges?.loading || 0) + (order.charges?.unloading || 0);
  
  const subTotal = transportationCharge + loadingUnloadingCharge;
  const sgstAmount = subTotal * sgstPercent;
  const cgstAmount = subTotal * cgstPercent;
  const finalAmount = subTotal + sgstAmount + cgstAmount;

  const invoice = await Invoice.findOneAndUpdate(
    { orderId: order._id },
    {
      userId: order.userId,
      invoiceId,
      invoiceNo,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentType: "Prepaid",
      company: settings.company,
      customer: {
        name: order.consignorCompany || order.pickup?.person || user?.name || "Customer",
        mobile: order.pickup?.phone || user?.phone || "",
        email: user?.email || "",
        address: order.pickup?.location || user?.consigner?.address || ""
      },
      charges: {
        transportation: transportationCharge,
        loadingUnloading: loadingUnloadingCharge
      },
      tax: {
        sgstPercent: settings.taxes.sgstPercent,
        cgstPercent: settings.taxes.cgstPercent,
        sgstAmount: sgstAmount,
        cgstAmount: cgstAmount
      },
      total: {
        gross: subTotal,
        final: finalAmount,
        paid: finalAmount,
        outstanding: 0
      },
      payment: {
        status: "PAID",
        method: paymentType || "UPI",
        transactionId: transactionId || null
      },
      notes: settings.terms[0] || ""
    },
    { upsert: true, new: true }
  );

  // Generate LorryReceipt
  const lrNo = order.lrNo || order.tripNo || generateNumber("LR");
  const cnNo = "CN" + Date.now().toString().slice(-8);
  const tripDate = new Date().toISOString().split('T')[0];
  const ewayBillNo = "72" + Math.floor(1000000000 + Math.random() * 9000000000); // Optional: Integrate E-way bill API here
  const ewayBillExpiry = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const expiryDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const lorryReceipt = await LorryReceipt.findOneAndUpdate(
    { orderId: order._id },
    {
      userId: order.userId,
      lrNo,
      cnNo,
      gstNo: settings.company.gstNo,
      company: settings.company,
      tripDate,
      vehicle: {
        number: driver?.driver?.vehicleNumber || "",
        type: driver?.driver?.vehicleType || order.vehicle?.name || "",
        rtoNo: ""
      },
      driver: {
        name: driver?.name || "",
        mobile: driver?.phone || "",
        licenseNo: driver?.driver?.licenseNumber || ""
      },
      consignor: {
        name: order.consignorCompany || order.pickup?.person || user?.name || "",
        address: order.pickup?.location || user?.consigner?.address || "",
        pincode: user?.consigner?.pincode || "",
        mobile: order.pickup?.phone || user?.phone || "",
        gstin: user?.consigner?.gstNumber || ""
      },
      consignee: {
        name: order.consigneeCompany || order.delivery?.person || "",
        address: order.delivery?.location || "",
        pincode: "",
        mobile: order.delivery?.phone || "",
        gstin: ""
      },
      invoice: {
        invoiceNo,
        referenceNo: order.orderId,
        ewayBillNo,
        ewayBillExpiry,
        doNo: "",
        gstPaidBy: "Consignor",
        containerNo: "",
        lcNo: "",
        expiryDate
      },
      service: {
        type: order.bookingType === "FTL" ? "Full Truck Load" : "Part Truck Load",
        containerSize: order.vehicle?.dimension || "",
        date: tripDate
      },
      items: Array.isArray(order.cargo) && order.cargo.length > 0
        ? order.cargo.map(c => ({
            description: c.goodsDescription || "Goods Description",
            unit: "Box",
            weightKg: c.weight || 0,
            quantity: c.quantity || 1,
            amount: (order.amount / order.cargo.length).toLocaleString(), // roughly divide amount or keep 0
            dimension: c.dimension || ""
          }))
        : [
            {
              description: order.cargo?.goodsDescription || "Goods Description",
              unit: "Box",
              weightKg: order.cargo?.weight || 0,
              quantity: order.cargo?.quantity || 1,
              amount: (order.amount || 0).toLocaleString(),
              dimension: order.cargo?.dimension || ""
            }
          ],
      terms: settings.terms,
      receiver: {
        name: order.delivery?.person || "",
        mobile: order.delivery?.phone || "",
        signature: "",
        receivedAt: "",
        remarks: ""
      },
      goods: {
        description: order.cargo?.goodsDescription || "Goods description",
        weight: order.cargo?.weight || parseFloat(order.weight) || 0,
        quantity: order.cargo?.quantity || order.quantity || 1
      },
      freight: order.amount
    },
    { upsert: true, new: true }
  );

  // Generate Barcode dynamically
  let barcodeImage = "";
  try {
    const barcodeValue = order.orderId || generateNumber("BAR");
    barcodeImage = await barcodeUtils.generateBarcode(barcodeValue);
  } catch (err) {
    console.error("Barcode generation failed:", err);
  }

  // Generate ShippingLabel
  const shippingLabel = await ShippingLabel.findOneAndUpdate(
    { orderId: order._id },
    {
      userId: order.userId,
      docketNo: order.docketNo || order.orderId || generateNumber("DKT"),
      company: settings.company,
      origin: {
        address: order.pickup?.location || ""
      },
      destination: {
        address: order.delivery?.location || ""
      },
      shipment: {
        date: new Date().toISOString().split('T')[0],
        weight: `${order.cargo?.weight || order.weight || 0}kg`,
        totalPackages: order.cargo?.quantity || order.quantity || 1,
        currentPackage: 1
      },
      invoiceId: invoice._id,
      invoice: {
        invoiceNo
      },
      returnToOrigin: true,
      barcode: {
        value: order.orderId || generateNumber("BAR"),
        imageUrl: barcodeImage
      }
    },
    { upsert: true, new: true }
  );

  // Generate ProofDelivery
  const proofDelivery = await ProofDelivery.findOneAndUpdate(
    { orderId: order._id },
    {
      userId: order.userId,
      receiver: {
        name: order.delivery?.person || "",
        mobile: order.delivery?.phone || ""
      },
      deliveredAt: "",
      signatureImage: "",
      deliveryPhoto: "",
      remarks: "",
      status: "Pending"
    },
    { upsert: true, new: true }
  );

  let recipientIds = [];
  if (order.driverId) {
    recipientIds.push(order.driverId);
  } else if (order.vehicle && order.vehicle.name) {
    const drivers = await User.find({ 
      role: "driver", 
      status: "active",
      "driver.vehicleType": order.vehicle.name
    }).select("_id");
    
    if (drivers.length > 0) {
      recipientIds.push(...drivers.map(d => d._id));
    } else {
      // Fallback: Notify all drivers if no exact vehicle match is found
      const allDrivers = await User.find({ role: "driver", status: "active" }).select("_id");
      recipientIds.push(...allDrivers.map(d => d._id));
    }
  } else {
    const allDrivers = await User.find({ role: "driver", status: "active" }).select("_id");
    recipientIds.push(...allDrivers.map(d => d._id));
  }

  // Always also notify the consignor
  recipientIds.push(order.userId);

  // Remove duplicates just in case
  recipientIds = [...new Set(recipientIds.map(id => id.toString()))];

  const notifications = [];
  const { sendPushNotification } = require("./firebase.service");

  for (const recipientId of recipientIds) {
    const notification = await Notification.create({
      recipientId: recipientId,
      title: "New Order Booked",
      message: `Order ${order.orderId} is now booked`,
      type: "ORDER",
      isRead: false
    });
    notifications.push(notification);

    if (global.io) {
      global.io.to(recipientId.toString()).emit("notification", notification);
    }

    // Try to send native push notification
    const recipientUser = await User.findById(recipientId).select("driver.fcmToken");
    if (recipientUser && recipientUser.driver && recipientUser.driver.fcmToken) {
      await sendPushNotification(
        recipientUser.driver.fcmToken,
        notification.title,
        notification.message,
        { orderId: order.orderId }
      );
    }
  }

  if (global.io) {
    global.io.emit("newOrder", {
      orderId: order.orderId,
      status: order.status,
    });
  }

  return order;
};

exports.getOrderById = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found");
  return order;
};

exports.getOrdersByUser = async (userId) => {
  return await Order.find({ userId }).sort({ createdAt: -1 });
};

exports.updateOrderStatus = async (orderId, status) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found");

  order.status = status;
  await order.save();

  if (status === "Delivered") {
    await ProofDelivery.findOneAndUpdate(
      { orderId: order._id },
      {
        deliveredAt: new Date().toLocaleString(),
        status: "Delivered",
        signatureImage: "assets/icon/logo.jpg",
        remarks: "Goods received in good condition"
      },
      { new: true, upsert: true }
    );
  }

  return order;
};
