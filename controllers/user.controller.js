const User = require('../models/user.model');

// [GET] /user/profile
module.exports.profile = async (req, res, next) => {
  const user = await User.findById(req.user._id)
    .populate('contactList.user')
    .lean();
  
  res.render('client/pages/user/profile', {
    pageTitle: 'Profile',
    activeTab: 'profile',
    user: user
  });
}

// [PATCH] /user/profile/edit
module.exports.postEditProfile = async (req, res, next) => {
  // return res.json(req.body);
  const {
    fullName,
    email,
    phone,
    bio,
    gender,
    avatar,
    cover
  } = req.body;

  if (!fullName.trim() || !email.trim()) {
    req.flash('error', 'Please fill all fields that required!');
    return res.redirect('/user/profile');
  }

  const user = await User.findById(req.user._id);

  user.fullName = fullName;
  user.email = email;
  user.phone = phone;
  user.bio = bio;
  user.gender = gender;

  if (avatar) {
    user.avatar = avatar;
  }

  if (cover) {
    user.cover = cover;
  }

  await user.save();

  req.flash('success', 'Update profile successfully!');
  res.redirect('/user/profile');
}