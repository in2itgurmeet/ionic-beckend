const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendEmail = require("../utils/sendEmail");
const { otpTemplate } = require("../utils/emailTemplate");

exports.driverRegister = async (req, res) => {
  try {
    const { name, phone, email, password, driver } = req.body;

    const exist = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (exist) {
      return res.status(400).json({
        success: false,
        message: "Driver already exists"
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const newDriver = await User.create({
      name,
      phone,
      email,
      password: hash,
      role: "driver",
      status: "active",
      driver: {
        vehicleNumber: driver?.vehicleNumber,
        vehicleType: driver?.vehicleType,
        vehicleCapacity: driver?.vehicleCapacity,
        licenseNumber: driver?.licenseNumber,
        aadhaarNumber: driver?.aadhaarNumber,
        address: driver?.address,
        city: driver?.city,
        state: driver?.state,
        pincode: driver?.pincode,
        isAvailable: true
      },
      isVerified: true
    });

    res.status(201).json({
      success: true,
      message: "Driver Registered Successfully",
      data: newDriver
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.driverLogin = async (req, res) => {
  try {
    const { login, password } = req.body;

    const user = await User.findOne({
      role: "driver",
      $or: [{ email: login }, { phone: login }]
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Driver not found"
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({
        success: false,
        message: "Wrong password"
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      "SECRET_KEY",
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Driver Login Successful",
      token,
      user: {
        _id: user._id,
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.driverForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({
      email,
      role: "driver"
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Driver not found"
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;

    await user.save();

    await sendEmail(
      user.email,
      "Driver Password Reset OTP",
      otpTemplate(user.name, otp)
    );

    res.status(200).json({
      success: true,
      message: "OTP sent successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.driverVerifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({
      email,
      role: "driver"
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Driver not found"
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    if (user.otpExpiry < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired"
      });
    }

    res.status(200).json({
      success: true,
      message: "OTP verified successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.driverResetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({
      email,
      role: "driver"
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Driver not found"
      });
    }

    const hash = await bcrypt.hash(newPassword, 10);

    user.password = hash;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getDriverProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await User.findOne({
      _id: userId,
      role: "driver"
    }).select("-password -otp -otpExpiry");

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Driver not found"
      });
    }

    res.status(200).json({
      success: true,
      data: profile
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
// ==============================
// UPDATE FULL DRIVER PROFILE
// ==============================
exports.updateDriverProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      email,
      phone,
      profileImage,
      driver
    } = req.body;

    const updated = await User.findOneAndUpdate(
      {
        _id: userId,
        role: "driver"
      },
      {
        name,
        email,
        phone,
        profileImage,

        "driver.licenseNumber": driver?.licenseNumber,
        "driver.licenseExpiry": driver?.licenseExpiry,
        "driver.vehicleNumber": driver?.vehicleNumber,
        "driver.vehicleType": driver?.vehicleType,
        "driver.vehicleCapacity": driver?.vehicleCapacity,
        "driver.aadhaarNumber": driver?.aadhaarNumber,
        "driver.address": driver?.address,
        "driver.city": driver?.city,
        "driver.state": driver?.state,
        "driver.pincode": driver?.pincode
      },
      { new: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updated
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// get driver profile image
exports.getDriverProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;

    const driver = await User.findOne({
      _id: userId,
      role: "driver"
    }).select("profileImage");

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found"
      });
    }

    res.status(200).json({
      success: true,
      data: {
        profileImage: driver.profileImage
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
// UPDATE DRIVER PROFILE IMAGE ONLY
// PUT /driver/profile-image
exports.updateDriverProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;

    const { profileImage } = req.body;

    if (!profileImage) {
      return res.status(400).json({
        success: false,
        message: "Profile image is required"
      });
    }

    const updated = await User.findOneAndUpdate(
      {
        _id: userId,
        role: "driver"
      },
      {
        profileImage: profileImage
      },
      {
        new: true
      }
    ).select("name email phone profileImage role driver");

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Driver not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile image updated successfully",
      data: updated
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==============================
// UPDATE ONLINE STATUS
// ==============================
exports.updateDriverOnlineStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const { isOnline } = req.body;

    const updated = await User.findOneAndUpdate(
      {
        _id: userId,
        role: "driver"
      },
      {
        "driver.isOnline": isOnline
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Online status updated",
      isOnline: updated.driver.isOnline
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
