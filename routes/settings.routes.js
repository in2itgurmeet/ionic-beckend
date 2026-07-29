const express = require("express");
const router = express.Router();

const { getSettings, updateSettings } = require("../controller/settings.controller");
const auth = require("../middleware/authMiddleware");

// Should ideally be admin only, but applying generic auth for now.
router.get("/", auth, getSettings);
router.put("/", auth, updateSettings);

module.exports = router;
