const User = require('../models/user.model')
const ForgotPasswordOTP = require('../models/forgot-password-otp.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const systemConfig = require('../config/system.config');

const {sendMail} = require('../helpers/sendMail');
const generateOTP = require('../helpers/generateOTP');
const {cookieParser} = require('../helpers/cookieFunctions.js')

// [GET] /auth/login
module.exports.login = async (req, res, next) => {
  res.render('client/pages/auth/login', {
    pageTitle: 'Login',
    activeTab: 'login'
  });
}

// [GET] /auth/register
module.exports.register = async (req, res, next) => {
  res.render('client/pages/auth/register', {
    pageTitle: 'Register',
    activeTab: 'register'
  });
}

// [POST] /auth/register
module.exports.postRegister = async (req, res, next) => {
  const { fullName, email, password } = req.body;
  
  if (!email || !password || !fullName) {
    req.flash("error", "Fill in all fields!");
    return res.redirect("back");
  }

  const user = await User.findOne({
    email: email,
  });

  if (user) {
    req.flash("error", "Email exists!");
    return res.redirect("back");
  }

  const hasedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    fullName: fullName,
    email: email,
    password: hasedPassword,
    avatar: `https://avatar.iran.liara.run/username?username=${fullName.split(' ')[0] + '+' + fullName.split(' ')[fullName.split(' ').length - 1]}`,
  });

  await newUser.save();

  req.flash("success", "Register successed!");
  res.redirect("/auth/login");
}

// [POST] /auth/login
module.exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ 
    email: email,
    deleted: false ,
    statusAccount: 'active'
  });
  
  if (!user) {
    req.flash('error', "Email does's exist or locked!");
    return res.redirect("back");
  }

  const checkPassword = await bcrypt.compare(password, user.password);
  if (!checkPassword) {
    req.flash('error', 'Wrong password!');
    return res.redirect("back");
  }

  const accessToken = jwt.sign({ 
    id: user._id,
    email: user.email
  }, systemConfig.secretKeyAccessToken, {
    algorithm: 'HS256',
    expiresIn: systemConfig.accessTokenLife
    // expiresIn: "30s"
  });

  let refreshToken = jwt.sign({
    id: user._id,
    email: user.email
  }, systemConfig.secretKeyRefreshToken, {
    algorithm: 'HS256',
    expiresIn: systemConfig.refreshTokenLife
    // expiresIn: "1m"
  });

  if (!user.refreshToken) { 
    user.refreshToken = refreshToken;
    await user.save();
  } else {
    try {
      jwt.verify(user.refreshToken, systemConfig.secretKeyRefreshToken);
    } catch (error) {
      user.refreshToken = refreshToken;
      await user.save();
    }
    refreshToken = user.refreshToken;
  }

  res.cookie('accessTokenUser', accessToken, {
    maxAge: 24 * 60 * 60 * 1000,
    // httpOnly: true
  });

  res.cookie('refreshTokenUser', refreshToken, {
    maxAge: 7 * 24 * 60 * 60 * 1000 ,
    // maxAge: 60 * 60 * 1000,
    // httpOnly: true
  });

  res.redirect(`/messages`);
}

// [GET] /auth/logout
module.exports.logout = async (req, res, next) => {
  res.clearCookie('accessTokenUser');
  res.clearCookie('refreshTokenUser');
  res.redirect('/auth/login');
}

// [PATCH] /auth/change-password
module.exports.changePassword = async (req, res, next) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const user = await User.findById(req.user._id);

  if (!oldPassword || !newPassword || !confirmPassword) {
    req.flash('error', 'Fill in all fields!');
    return res.redirect('back');
  }

  const checkPassword = await bcrypt.compare(oldPassword, user.password);
  if (!checkPassword) {
    req.flash('error', 'Old password is wrong!');
    return res.redirect('back');
  }

  if (newPassword !== confirmPassword) {
    req.flash('error', 'New password and confirm password are not the same!');
    return res.redirect('back');
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  req.flash('success', 'Change password successfully!');
  res.redirect('back');
}

// [GET] /auth/forgot-password
module.exports.forgotPassword = async (req, res, next) => {
  res.render('client/pages/auth/forgot-password', {
    pageTitle: 'Forgot password',
    activeTab: 'forgot-password'
  });
}

// [POST] /auth/forgot-password
module.exports.postForgotPassword = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({
    email: email,
    deleted: false,
    statusAccount: 'active'
  });
  
  if (!user) {
    req.flash('error', 'Email does not exist!');
    return res.redirect('back');
  }

  const otpExists = await ForgotPasswordOTP.findOne({
    email: email,
    expiredAt: { $gt: new Date() }
  });

  if (otpExists) {
    req.flash('error', 'Please wait 5 minutes to request a new OTP!');
    return res.redirect('/auth/forgot-password/verify-otp?email=' + email);
  }

  //! create OTP
  const otp = generateOTP(6);
  const expiredAt = new Date();
  expiredAt.setMinutes(expiredAt.getMinutes() + 5);

  const newOTP = new ForgotPasswordOTP({
    email: email,
    otp: otp,
    expiredAt: expiredAt
  });

  await newOTP.save();

  //! send mail
  const subject = 'Reset your password by OTP';
  const html = `
    <h1>Reset your password by OTP</h1>
    <p>Your OTP: ${otp}</p>
    <p>Expired in 5 minutes</p>
  `;
  sendMail(email, subject, html);

  req.flash('success', 'Sent OTP to your email!');
  res.redirect(`/auth/forgot-password/verify-otp?email=${email}`);
}

// [GET] /auth/forgot-password/verify-otp
module.exports.verifyOTP = async (req, res, next) => {
  const { email } = req.query;

  if (!email) return res.redirect('/auth/forgot-password');

  res.render('client/pages/auth/verify-otp', {
    pageTitle: 'Verify OTP',
    activeTab: 'forgot-password',
    email: email
  });
}

// [POST] /auth/forgot-password/verify-otp
module.exports.postVerifyOTP = async (req, res, next) => {
  const { email, otp } = req.body;
  const otpData = await ForgotPasswordOTP.findOne({
    email: email,
    otp: otp,
    expiredAt: { $gt: new Date() }
  });

  if (!otpData) {
    req.flash('error', 'OTP is wrong or expired!');
    return res.redirect('back');
  }

  const user = await User.findOne({
    email: email,
    deleted: false,
    statusAccount: 'active'
  });

  const accessTokenForgot = jwt.sign({
    email: email,
    id: user._id
  }, systemConfig.secretKeyAccessToken, {
    algorithm: 'HS256',
    expiresIn: '5m'
  });

  res.cookie('accessTokenForgot', accessTokenForgot, {
    maxAge:  5 * 60 * 1000,
    httpOnly: true
  });

  res.redirect(`/auth/reset-password?token=${accessTokenForgot}`);
}

// [GET] /auth/reset-password
module.exports.resetPassword = async (req, res, next) => {
  const token = req.query.token;

  if (!token) return res.redirect('/auth/forgot-password');

  let email = '';
  try {
    const data = jwt.verify(token, systemConfig.secretKeyAccessToken);
    email = data.email;
  } catch (error) {
    req.flash('error', 'Something went wrong, try again!');
    return res.redirect('/auth/forgot-password');
  }

  res.render('client/pages/auth/reset-password', {
    pageTitle: 'Reset password',
    activeTab: 'forgot-password',
    email: email
  });
}

// [POST] /auth/reset-password
module.exports.postResetPassword = async (req, res, next) => {
  const { email, password, confirmPassword } = req.body;

  if (!email || !password || !confirmPassword) {
    req.flash('error', 'Fill in all fields!');
    return res.redirect('back');
  }

  if (password !== confirmPassword) {
    req.flash('error', 'Password and confirm password are not the same!');
    return res.redirect('back');
  }

  const user = await User.findOne({
    email: email,
    deleted: false,
    statusAccount: 'active'
  });

  if (!user) {
    req.flash('error', 'Email does not exist!');
    return res.redirect('back');
  }

  user.password = await bcrypt.hash(password, 10);
  await user.save();

  req.flash('success', 'Reset password successfully!');
  res.redirect('/auth/login');
}