const express = require("express");
const router = express.Router();
const vehicleController = require("../controller/vehicle.controller");

router.get("/", vehicleController.getVehicles);

module.exports = router;
