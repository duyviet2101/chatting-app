const express = require('express');
const router = express.Router();

const controller = require('../controllers/auth.controller.js');

router.get('/login', controller.login);

router.get('/register', controller.register);

router.post('/register', controller.postRegister);

router.post('/login', controller.postLogin);

router.get('/logout', controller.logout);

module.exports = router;