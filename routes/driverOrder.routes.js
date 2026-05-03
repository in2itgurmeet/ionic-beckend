const express = require("express");
const router = express.Router();

const driverController = require("../controller/driverOrder.controller");
const auth = require("../middleware/authMiddleware");

router.get("/orders", auth, driverController.getDriverOrders);
router.post("/accept/:orderId", auth, driverController.acceptOrder);
router.post("/reject/:orderId", auth, driverController.rejectOrder);

module.exports = router;
