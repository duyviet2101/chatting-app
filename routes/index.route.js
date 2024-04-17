const express = require('express');
const router = express.Router();

router.use('/messages', require('./messages.route.js'));

router.use('/auth', require('./auth.route.js'));

module.exports = router;