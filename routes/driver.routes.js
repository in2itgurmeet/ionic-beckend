const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const {
  driverRegister,
  driverLogin,driverForgotPassword,
  driverVerifyOtp,
  driverResetPassword,
  uploadDriverProfileImage,
  getDriverProfile,
  updateDriverOnlineStatus,
  getDriverProfileImage,
  updateDriverProfile
} = require('../controller/driver.controller');

router.post('/driver/register', driverRegister);
router.post('/driver/login', driverLogin);
router.post('/driver/forgot-password', driverForgotPassword);
router.post('/driver/forgot-password', driverVerifyOtp);
router.post('/driver/forgot-password', driverResetPassword);
router.put("/driver/profile-image", auth,upload.single("profileImage"), uploadDriverProfileImage);
router.get("/driver/profile", auth, getDriverProfile);
router.put("/driver/profile", auth, updateDriverProfile);
router.get("/driver/profile-image", auth, getDriverProfileImage);

router.put("/driver/online-status", auth, updateDriverOnlineStatus);



module.exports = router;
