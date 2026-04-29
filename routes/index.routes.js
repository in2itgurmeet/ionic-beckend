const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const orderRoutes = require("./order.routes");
const dashboardRoutes = require("./dashboard.routes");

const invoiceRoutes = require("./invoice.routes");
const shippingLabelRoutes = require("./shippingLabel.routes");
const lorryReceiptRoutes = require("./lorryReceipt.routes");
const proofDeliveryRoutes = require("./proofDelivery.routes");


router.use("/auth", authRoutes);
router.use("/order", orderRoutes);
router.use("/dashboard", dashboardRoutes);


router.use("/invoice", invoiceRoutes);
router.use("/shipping-label", shippingLabelRoutes);
router.use("/lorry-receipt", lorryReceiptRoutes);
router.use("/proof-delivery", proofDeliveryRoutes);

module.exports = router;
