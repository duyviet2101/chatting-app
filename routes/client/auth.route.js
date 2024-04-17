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

module.exports = router;