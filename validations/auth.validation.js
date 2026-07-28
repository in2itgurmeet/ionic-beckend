const Joi = require('joi');

const register = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
    'string.pattern.base': '"phone" must be a valid 10-digit number'
  }),
  company: Joi.string().required(),
  password: Joi.string().min(6).required()
});

const login = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const forgotPassword = Joi.object({
  email: Joi.string().email().required()
});

const verifyOtp = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().required()
});

const resetPassword = Joi.object({
  email: Joi.string().email().required(),
  newPassword: Joi.string().min(6).required()
});

module.exports = {
  register,
  login,
  forgotPassword,
  verifyOtp,
  resetPassword
};
