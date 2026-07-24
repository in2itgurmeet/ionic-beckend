const Order = require("../models/order.model");
const Notification = require("../models/notification.model");
const Invoice = require("../models/invoice.model");
const LorryReceipt = require("../models/lorryReceipt.model");
const ShippingLabel = require("../models/shippingLabel.model");
const ProofDelivery = require("../models/proofDelivery.model");
const User = require("../models/user");

const generateNumber = (prefix) => {
  return prefix + Date.now() + Math.floor(Math.random() * 1000);
};

exports.step1 = async (req, res) => {
  try {
    const { bookingType, pickup, delivery } = req.body;

    const randomDistance = Math.floor(Math.random() * 1300) + 200;
    const expectedDays = Math.ceil(randomDistance / 400);
    const expectedTravelTime = `${expectedDays} Day${expectedDays > 1 ? 's' : ''}`;

    const newOrder = await Order.create({
      userId: req.user.id,
      orderId: generateNumber("ORD"),
      trackingId: generateNumber("TRK"),
      tripNo: generateNumber("LR"),
      bookingType,
      pickup,
      delivery,
      distance: `${randomDistance} km`,
      expectedTravelTime,
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
      const v = selectedVehicle[0];
      order.vehicle = {
        name: v.name,
        number: v.number || null,
        capacity: v.capacity,
        dimension: v.dimensions || v.dimension || null,
      };
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
    const { paymentType, amount, transactionId, upiId } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const user = await User.findById(order.userId);

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
    
    const transportationCharge = (order.amount * 0.75);
    const loadingUnloadingCharge = (order.amount * 0.25);
    const sgstAmount = order.amount * 0.09;
    const cgstAmount = order.amount * 0.09;
    const finalAmount = order.amount * 1.18;

    const invoice = await Invoice.create({
      orderId: order._id,
      userId: order.userId,
      invoiceId,
      invoiceNo,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentType: "Prepaid",
      company: {
        name: "PLC Logistic Pvt Ltd",
        logo: "assets/icon/logo.jpg",
        address: "Plot 21, Sector 18, Gurugram, Haryana - 122015",
        mobile: "+91 9812345678",
        email: "support@plclogistics.com"
      },
      customer: {
        name: order.consignorCompany || order.pickup?.person || "STL Group",
        mobile: order.pickup?.phone || "+91 9999999999",
        email: `${(order.pickup?.person || "customer").toLowerCase().replace(/\s+/g, '')}@gmail.com`,
        address: order.pickup?.location || "Noida Sector 63"
      },
      charges: {
        transportation: transportationCharge,
        loadingUnloading: loadingUnloadingCharge
      },
      tax: {
        sgstPercent: 9,
        cgstPercent: 9,
        sgstAmount: sgstAmount,
        cgstAmount: cgstAmount
      },
      total: {
        gross: order.amount,
        final: finalAmount,
        paid: finalAmount,
        outstanding: 0
      },
      payment: {
        status: "PAID",
        method: paymentType || "UPI",
        transactionId: transactionId || null
      },
      notes: "Thank you for doing business with us."
    });

    // Generate LorryReceipt
    const lrNo = order.lrNo || order.tripNo || generateNumber("LR");
    const cnNo = "CN" + Date.now().toString().slice(-8);
    const tripDate = new Date().toISOString().split('T')[0];
    const ewayBillNo = "72" + Math.floor(1000000000 + Math.random() * 9000000000);
    const ewayBillExpiry = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const expiryDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const lorryReceipt = await LorryReceipt.create({
      orderId: order._id,
      userId: order.userId,
      lrNo,
      cnNo,
      gstNo: "06AABCU9603R1ZV",
      company: {
        name: "PLC Logistic Pvt Ltd",
        logo: "assets/icon/logo.jpg",
        address: "Plot 21, Sector 18, Gurugram, Haryana - 122015",
        mobile: "+91 9812345678",
        email: "support@plclogistics.com",
        website: "www.plclogistics.com"
      },
      tripDate,
      vehicle: {
        number: order.vehicle?.number || "MH 04 AA 2025",
        type: order.vehicle?.name || "20FT Eicher",
        rtoNo: "HR55"
      },
      driver: {
        name: order.driver?.name || "Ravi Kumar",
        mobile: order.driver?.phone || "+91 9876543210",
        licenseNo: "DL0420110012345"
      },
      consignor: {
        name: order.consignorCompany || order.pickup?.person || user?.name || "STL Group",
        address: order.pickup?.location || user?.consigner?.address || "Sector 63, Noida, Uttar Pradesh",
        pincode: user?.consigner?.pincode || "201301",
        mobile: order.pickup?.phone || user?.phone || "+91 9123456780",
        gstin: user?.consigner?.gstNumber || "09AAACS1234F1Z2"
      },
      consignee: {
        name: order.consigneeCompany || order.delivery?.person || "ABC Pvt Ltd",
        address: order.delivery?.location || "Bhiwandi Industrial Area, Thane, Maharashtra",
        pincode: "421302",
        mobile: order.delivery?.phone || "+91 9988776655",
        gstin: "27AACCA5678H1Z1"
      },
      invoice: {
        invoiceNo,
        referenceNo: order.orderId,
        ewayBillNo,
        ewayBillExpiry,
        doNo: "",
        gstPaidBy: "Consignor",
        containerNo: "CONT12345",
        lcNo: "LC998877",
        expiryDate
      },
      service: {
        type: order.bookingType === "FTL" ? "Full Truck Load" : "Part Truck Load",
        containerSize: order.vehicle?.dimension || "20FT",
        date: tripDate
      },
      items: [
        {
          description: order.cargo?.goodsDescription || "Goods Description",
          unit: "Box",
          weightKg: order.cargo?.weight || 0,
          quantity: order.cargo?.quantity || 1,
          amount: order.amount.toLocaleString()
        }
      ],
      terms: [
        "Goods once sold will not be accepted.",
        "Transporter not responsible for damage after dispatch."
      ],
      receiver: {
        name: order.delivery?.person || "Amit Sharma",
        mobile: order.delivery?.phone || "+91 9876501234",
        signature: "assets/icon/logo.jpg",
        receivedAt: "",
        remarks: "Goods received in good condition"
      },
      goods: {
        description: order.cargo?.goodsDescription || "Goods description",
        weight: order.cargo?.weight || parseFloat(order.weight) || 0,
        quantity: order.cargo?.quantity || order.quantity || 1
      },
      freight: order.amount
    });

    // Generate ShippingLabel
    const shippingLabel = await ShippingLabel.create({
      orderId: order._id,
      userId: order.userId,
      docketNo: order.docketNo || order.orderId || generateNumber("DKT"),
      company: {
        name: "PLC Logistic Pvt Ltd",
        logo: "assets/icon/logo.jpg"
      },
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
        imageUrl: "https://www.shutterstock.com/image-vector/horizontal-black-barcode-on-white-600nw-1221838477.jpg"
      }
    });

    // Generate ProofDelivery
    const proofDelivery = await ProofDelivery.create({
      orderId: order._id,
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
    });

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

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.status = status;
    await order.save();

    if (status === "Delivered") {
      await ProofDelivery.findOneAndUpdate(
        { orderId: order._id },
        {
          deliveredAt: new Date().toLocaleString(),
          status: "Delivered",
          signatureImage: "assets/icon/logo.jpg", // default signature mockup
          remarks: "Goods received in good condition"
        },
        { new: true, upsert: true }
      );
    }

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message,
    });
  }
};
