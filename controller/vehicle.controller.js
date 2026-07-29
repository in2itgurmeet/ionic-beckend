const Vehicle = require("../models/vehicle.model");


exports.getVehicles = async (req, res) => {
  try {
    let vehicles = await Vehicle.find({});
    res.status(200).json({
      success: true,
      data: vehicles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch vehicles list",
      error: error.message
    });
  }
};

// Add new vehicle (Admin API)
exports.addVehicle = async (req, res) => {
  try {
    const { name, capacity, dimensions, img } = req.body;
    const vehicle = await Vehicle.create({ name, capacity, dimensions, img });
    res.status(201).json({ success: true, data: vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update vehicle (Admin API)
exports.updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!vehicle) return res.status(404).json({ success: false, message: "Vehicle not found" });
    res.status(200).json({ success: true, data: vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete vehicle (Admin API)
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ success: false, message: "Vehicle not found" });
    res.status(200).json({ success: true, message: "Vehicle deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
