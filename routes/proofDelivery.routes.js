
const express = require("express");
const router = express.Router();

const proofDeliveryController = require("../controller/proofDelivery.controller");
const auth = require("../middleware/authMiddleware");

// All POD List
router.get(
  "/list",
  auth,
  proofDeliveryController.getProofDeliveries
);

// Single POD by OrderId
router.get(
  "/:orderId",
  auth,
  proofDeliveryController.getProofDeliveryByOrder
);

module.exports = router;
