const User = require('../models/user.model')
const bcrypt = require('bcrypt');

// [GET] /login
module.exports.login = async (req, res, next) => {
  res.render('client/pages/auth/login', {
    pageTitle: 'Login',
    activeTab: 'login'
  });
}

// [GET] /register
module.exports.register = async (req, res, next) => {
  res.render('client/pages/auth/register', {
    pageTitle: 'Register',
    activeTab: 'register'
  });
}

// [POST] /register
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