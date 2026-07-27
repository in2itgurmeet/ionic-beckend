const express = require("express");
const router = express.Router();

const driverController = require("../controller/driverOrder.controller");
const auth = require("../middleware/authMiddleware");

router.get("/orders", auth, driverController.getDriverOrders);
router.post("/accept/:orderId", auth, driverController.acceptOrder);
router.post("/reject/:orderId", auth, driverController.rejectOrder);
router.get("/history", auth, driverController.getDriverHistory);
router.get("/stats", auth, driverController.getDriverStats);
router.put("/status/:orderId", auth, driverController.updateDriverOrderStatus);
router.post("/pod/:orderId", auth, driverController.uploadDriverPOD);

module.exports = router;
