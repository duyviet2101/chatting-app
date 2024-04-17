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