const express = require('express');
const router = express.Router();
const {requiredAuth} = require('../middlewares/client/auth.middleware.js');

//! public routes
router.use('/auth', require('./auth.route.js'));

//! private routes

router.use('/messages', requiredAuth, require('./messages.route.js'));


module.exports = router;