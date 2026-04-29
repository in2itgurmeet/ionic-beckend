
const express = require("express");
const router = express.Router();

const lorryReceiptController = require("../controllers/lorryReceipt.controller");
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

module.exports = router;
