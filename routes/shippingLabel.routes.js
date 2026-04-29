
const express = require("express");
const router = express.Router();
const shippingLabelController = require("../controller/shippingLabel.controller");
const auth = require("../middleware/authMiddleware");

// All Labels
router.get(
  "/list",
  auth,
  shippingLabelController.getShippingLabels
);

// Single Label
router.get(
  "/:docketNo",
  auth,
  shippingLabelController.getShippingLabelByDocket
);

module.exports = router;
