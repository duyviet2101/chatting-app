const express = require('express');
const router = express.Router();

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

router.get('/forgot-password', asyncHandler(controller.forgotPassword));

router.post('/forgot-password', asyncHandler(controller.postForgotPassword));

router.get('/forgot-password/verify-otp', asyncHandler(controller.verifyOTP));

router.post('/forgot-password/verify-otp', asyncHandler(controller.postVerifyOTP));

router.get('/reset-password', asyncHandler(controller.resetPassword));

router.post('/reset-password', asyncHandler(controller.postResetPassword));

module.exports = router;