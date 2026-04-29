const express = require("express");
const router = express.Router();

const dashboardController = require("../controller/dashboard.controller");
const auth = require("../middleware/authMiddleware");

/**
 * @description Get Dashboard Summary Data
 * Fetch total orders, pending, booked, in transit,
 * completed, cancelled, total revenue and latest transit order
 * @route GET /dashboard
 * @access Private
 * @author Gurmeet Kumar
 */
router.get("/dashboard", auth, dashboardController.getDashboard);

module.exports = router;
