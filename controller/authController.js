const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendEmail = require("../utils/sendEmail");
const { otpTemplate } = require("../utils/emailTemplate");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    if (user.status !== "active") {
      return res.status(403).json({ message: "Account blocked" });
    }
    if (!user.isVerified) {
      return res.status(403).json({ message: "Verify your account first" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      "SECRET_KEY",
      { expiresIn: "30m" }
    );
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, phone, company, password } = req.body;
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ message: "Phone already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      phone,
      company,
      password: hashedPassword,

      role: "consigner",
      status: "active",
      isVerified: true
    });

    await newUser.save();
    res.status(201).json({
      message: "User registered successfully"
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    const otp = Math.floor(100000 + Math.random() * 900000);
    user.otp = otp.toString();
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
    await user.save();
    await sendEmail(
      user.email,
      "Password Reset OTP",
      otpTemplate(user.name, otp)
    );
    res.json({
      success: true,
      message: "OTP sent to your email"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.otp !== otp) {
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
    res.json({
      success: true,
      message: "OTP verified"
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();
    res.json({
      success: true,
      message: "Password reset successful"
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -otp -otpExpiry");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone, consigner, driver } = req.body;

    const updateData = { name, email, phone };

    if (consigner) {
      updateData.consigner = {
        companyName: consigner.companyName,
        gstNumber: consigner.gstNumber,
        address: consigner.address,
        city: consigner.city,
        state: consigner.state,
        pincode: consigner.pincode,
      };
    }

    if (driver) {
      if (driver.licenseNumber !== undefined) updateData['driver.licenseNumber'] = driver.licenseNumber;
      if (driver.vehicleNumber !== undefined) updateData['driver.vehicleNumber'] = driver.vehicleNumber;
      if (driver.vehicleType !== undefined) updateData['driver.vehicleType'] = driver.vehicleType;
      if (driver.vehicleCapacity !== undefined) updateData['driver.vehicleCapacity'] = driver.vehicleCapacity;
      if (driver.aadhaarNumber !== undefined) updateData['driver.aadhaarNumber'] = driver.aadhaarNumber;
      if (driver.address !== undefined) updateData['driver.address'] = driver.address;
      if (driver.city !== undefined) updateData['driver.city'] = driver.city;
      if (driver.state !== undefined) updateData['driver.state'] = driver.state;
      if (driver.pincode !== undefined) updateData['driver.pincode'] = driver.pincode;
      if (driver.isOnline !== undefined) updateData['driver.isOnline'] = driver.isOnline;
      if (driver.isAvailable !== undefined) updateData['driver.isAvailable'] = driver.isAvailable;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const { uploadToCloudinary } = require('../utils/cloudinary');

exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please upload an image" });
    }
    
    // Upload image to Cloudinary
    const imageUrl = await uploadToCloudinary(req.file.buffer, 'user_profiles');

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: imageUrl },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Profile image updated successfully",
      data: updatedUser.profileImage
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateFCMToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: "FCM Token is required" });
    }
    await User.findByIdAndUpdate(
      req.user.id,
      { "driver.fcmToken": token },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "FCM token updated successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
