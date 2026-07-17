const express = require("express");
const router = express.Router();

const {
  step1,
  step2,
  payment,
  orderlist,
  getSingleOrder,
  updateOrderStatus,
} = require("../controller/order.controller");

const auth = require("../middleware/authMiddleware");

router.post("/step1", auth, step1);

router.put("/step2/:id", auth, step2);

router.put("/payment/:id", auth, payment);

router.get("/my/all", auth, orderlist);

router.get("/:id", auth, getSingleOrder);

router.put("/status/:id", auth, updateOrderStatus);

module.exports = router;
