const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const validate = require("../middleware/validate.middleware");
const authValidation = require("../validations/auth.validation");

const {
  login,
  register,
  forgotPassword,
  verifyOtp,
  resetPassword,
  getProfile,
  updateProfile,
  uploadProfileImage
} = require("../controller/authController");

router.post("/login", validate(authValidation.login), login);
router.post("/register", validate(authValidation.register), register);
router.post("/forgot-password", validate(authValidation.forgotPassword), forgotPassword);
router.post("/verify-otp", validate(authValidation.verifyOtp), verifyOtp);
router.post("/reset-password", validate(authValidation.resetPassword), resetPassword);

router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);
router.put("/profile-image", auth, upload.single("profileImage"), uploadProfileImage);

module.exports = router;
