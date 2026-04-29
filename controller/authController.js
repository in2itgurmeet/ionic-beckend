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
      { expiresIn: "1d" }
    );
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      // user: {
      //   id: user._id,
      //   name: user.name,
      //   role: user.role
      // }
    });


  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, phone, company, password } = req.body;
    if (!name || !email || !phone || !company || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
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
    console.error(err);
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
    console.error(err);
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
