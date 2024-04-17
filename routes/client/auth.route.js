const express = require('express');
const router = express.Router();
const passport = require('passport');

const controller = require('../../controllers/auth.controller.js');
const asyncHandler = require('../../helpers/handleError.js');

const {
  requiredAuth
} = require('../../middlewares/client/auth.middleware.js');

router.get('/login', asyncHandler(controller.login));

router.get('/register', asyncHandler(controller.register));

router.post('/register', asyncHandler(controller.postRegister));

router.post('/login', asyncHandler(controller.postLogin));

router.get('/logout', asyncHandler(controller.logout));

router.patch('/change-password', requiredAuth, asyncHandler(controller.changePassword));

router.get('/facebook', passport.authenticate('facebook', {
  scope: ['email']
}));

router.get('/facebook/callback', passport.authenticate('facebook', {
  failureRedirect: '/auth/login'
}), controller.facebookLogin);

router.get('/google', passport.authenticate('google', {
  scope: ['email']
}));

router.get('/google/callback', passport.authenticate('google', {
  failureRedirect: '/auth/login'
}), controller.googleLogin);

module.exports = router;