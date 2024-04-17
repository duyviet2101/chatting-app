const mongoose = require('mongoose');

const otpForgotPasswordSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiredAt: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true,
});

const OTP = mongoose.model('OTP_Forget_Password', otpForgotPasswordSchema, 'otps-forget-password');
module.exports = OTP;