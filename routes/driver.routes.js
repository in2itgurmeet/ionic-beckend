const express = require('express');
const router = express.Router();

const {
  driverRegister,
  driverLogin,driverForgotPassword,
  driverVerifyOtp,
  driverResetPassword
} = require('../controller/driver.controller');

router.post('/driver/register', driverRegister);
router.post('/driver/login', driverLogin);
router.post('/driver/forgot-password', driverForgotPassword);
router.post('/driver/forgot-password', driverVerifyOtp);
router.post('/driver/forgot-password', driverResetPassword);

module.exports = router;
