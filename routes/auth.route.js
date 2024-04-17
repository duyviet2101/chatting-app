const express = require('express');
const router = express.Router();

const controller = require('../controllers/auth.controller.js');

router.get('/login', controller.login);

module.exports = router;