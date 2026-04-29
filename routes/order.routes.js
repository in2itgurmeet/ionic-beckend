// routes/order.routes.js

const express = require("express");
const router = express.Router();

const orderController = require("../controller/order.controller");
const auth = require("../middleware/authMiddleware");

router.post("/create-order", auth, orderController.createOrder);

module.exports = router;
