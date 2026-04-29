
const express = require("express");
const router = express.Router();

const invoiceController = require("../controller/invoice.controller");
const auth = require("../middleware/authMiddleware");

router.get(
    "/list",
    auth,
    invoiceController.getInvoiceList
);

router.get(
    "/:invoiceNo",
    auth,
    invoiceController.getInvoiceByNo
);

module.exports = router;
