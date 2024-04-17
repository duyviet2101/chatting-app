module.exports = (lengthOTP) => {
  const digits = '0123456789';
  let OTP = '';
  for (let i = 0; i < lengthOTP; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
}