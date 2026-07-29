const express = require("express");
const router = express.Router();
const vehicleController = require("../controller/vehicle.controller");

router.get("/", vehicleController.getVehicles);
router.post("/", vehicleController.addVehicle);
router.put("/:id", vehicleController.updateVehicle);
router.delete("/:id", vehicleController.deleteVehicle);

module.exports = router;
