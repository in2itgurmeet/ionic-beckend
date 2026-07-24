
const express = require("express");
const router = express.Router();

const lorryReceiptController = require("../controller/lorryReceipt.controller");
const auth = require("../middleware/authMiddleware");

// All LR List
router.get(
  "/list",
  auth,
  lorryReceiptController.getLorryReceipts
);

// Single LR
router.get(
  "/:lrNo",
  auth,
  lorryReceiptController.getLorryReceiptByNo
);

// Share LR via Email
router.post(
  "/share",
  auth,
  lorryReceiptController.shareLorryReceipt
);

module.exports = router;
