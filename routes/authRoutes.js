const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
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

router.post("/login", login);
router.post("/register", register);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);
router.put("/profile-image", auth, upload.single("profileImage"), uploadProfileImage);

module.exports = router;
