const User = require('../../models/user.model.js');
const systemConfig = require('../../config/system.config.js');
const {cookieParser} = require('../../helpers/cookieFunctions.js');
const jwt = require('jsonwebtoken');

module.exports.requiredAuth = async (req, res, next) => {
  const {accessTokenUser, refreshTokenUser} = cookieParser(req);
  if (!accessTokenUser || !refreshTokenUser) {
    res.clearCookie('accessTokenUser');
    res.clearCookie('refreshTokenUser');
    req.flash('error', 'Login required!');
    return res.redirect('/auth/login');
  }

  try {
    const data = jwt.verify(accessTokenUser, systemConfig.secretKeyAccessToken);
    
    const user = await User.findOne({
      _id: data.id,
      refreshToken: refreshTokenUser,
      deleted: false,
      statusAccount: 'active'
    }).select('-password -refreshToken -deleted -createdAt -updatedAt -__v')
      .populate({
        path: 'contactRequestsReceived',
        select: 'fullName username avatar'
      })
      .lean();

    if (!user) {
      res.clearCookie('accessTokenUser');
      res.clearCookie('refreshTokenUser');
      req.flash('error', 'Login required!');
      return res.redirect('/auth/login');
    }

    req.user = user;
    res.locals.user = user;

    next();
  } catch (error) {
    try {
      const data = jwt.verify(accessTokenUser, systemConfig.secretKeyAccessToken, {
        ignoreExpiration: true
      });
      
      const user = await User.findOne
      ({
        _id: data.id,
        deleted: false,
        statusAccount: 'active'
      });

      if (!user) {
        res.clearCookie('accessTokenUser');
        res.clearCookie('refreshTokenUser');
        req.flash('error', 'Login required!');
        return res.redirect('/auth/login');
      }

      const dataRefreshToken = jwt.verify(refreshTokenUser, systemConfig.secretKeyRefreshToken);

      const newAccessTokenUser = jwt.sign({
        id: user._id,
        email: user.email
      }, systemConfig.secretKeyAccessToken, {
        algorithm: 'HS256',
        expiresIn: systemConfig.accessTokenLife
        // expiresIn: "30s"
      });

      req.user = user;
      res.locals.user = user;

      res.cookie('accessTokenUser', newAccessTokenUser, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        // httpOnly: true
      });

      next();
    } catch (error) {
      res.clearCookie('accessTokenUser');
      res.clearCookie('refreshTokenUser');
      req.flash('error', 'Login required!');
      res.redirect('/auth/login');
    }
  }

}