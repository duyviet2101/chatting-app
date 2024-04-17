const express = require('express');
const router = express.Router();

const controller = require('../controllers/user.controller.js');

router.get('/profile', controller.profile);

module.exports = router;