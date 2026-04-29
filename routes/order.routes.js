const express = require("express");
const router = express.Router();

const orderController = require("../controller/order.controller");
const auth = require("../middleware/authMiddleware");

/**
 * @description Create Order (Step 1)
 * Creates initial order with booking type, pickup & delivery location, and schedule date/time
 * @access Private
 * @author Gurmeet Kumar
 */
router.post("/step1", auth, orderController.step1);

/**
 * @description Update Order (Step 2)
 * Updates sender, receiver, cargo details and vehicle selection
 * @access Private
 * @author Gurmeet Kumar
 */
router.put("/step2/:id", auth, orderController.step2);

/**
 * @description Payment & Finalize Order
 * Updates payment details and marks order as booked
 * @access Private
 * @author Gurmeet Kumar
 */
router.put("/payment/:id", auth, orderController.payment);

/**
 * @description Get All Orders of Logged-in User
 * Returns list of all orders created by the authenticated user
 * @access Private
 * @author Gurmeet Kumar
 */
router.get("/my/all", auth, orderController.myOrders);

/**
 * @description Get Single Order Details
 * Fetch complete details of a specific order by ID
 * @access Private
 * @author Gurmeet Kumar
 */
router.get("/:id", auth, orderController.getSingleOrder);

module.exports = router;
