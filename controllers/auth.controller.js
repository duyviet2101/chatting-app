const User = require('../models/user.model')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const systemConfig = require('../config/system.config');

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
    req.flash("error", "Vui lòng điền đầy đủ thông tin!");
    return res.redirect("back");
  }

  const user = await User.findOne({
    email: email,
  });

  if (user) {
    req.flash("error", "Email đã tồn tại!");
    return res.redirect("back");
  }

  const hasedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    fullName: fullName,
    email: email,
    password: hasedPassword,
  });

  await newUser.save();

  req.flash("success", "Đăng ký thành công!");
  res.redirect("/auth/login");
}

// [POST] /auth/login
module.exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ 
    email: email,
    deleted: false ,
    status: 'active'
  });
  
  if (!user) {
    req.flash('error', 'Email không tồn tại hoặc tài khoản đã bị khóa!');
    return res.redirect("back");
  }

  const checkPassword = await bcrypt.compare(password, user.password);
  if (!checkPassword) {
    req.flash('error', 'Mật khẩu không đúng!');
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
    httpOnly: true
  });

  res.cookie('refreshTokenUser', refreshToken, {
    maxAge: 7 * 24 * 60 * 60 * 1000 ,
    // maxAge: 60 * 60 * 1000,
    httpOnly: true
  });

  res.redirect(`/messages`);
}

// [GET] /auth/logout
module.exports.logout = async (req, res, next) => {
  res.clearCookie('accessTokenUser');
  res.clearCookie('refreshTokenUser');
  res.redirect('/auth/login');
}