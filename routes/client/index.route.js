const express = require('express');
const router = express.Router();
const {requiredAuth} = require('../../middlewares/client/auth.middleware.js');
const socket = require('../../sockets/client/index.socket');
//! public routes
router.use('/auth', require('./auth.route.js'));

//! private routes

router.use('/messages', requiredAuth, socket, require('./messages.route.js'));

router.use('/user', requiredAuth, socket, require('./user.route.js'));

router.use('/contacts', requiredAuth, socket, require('./contacts.route.js'));

router.use('/', require('./home.route.js'));

module.exports = router;