const express = require("express");
const router = express.Router();
const {
  login,
  register,
  forgotPassword,
  verifyOtp,
  resetPassword,
} = require("../controller/authController");

router.post("/login", login);
router.post("/register", register);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

module.exports = router;
