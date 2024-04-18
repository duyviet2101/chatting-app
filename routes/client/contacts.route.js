const express = require('express');
const router = express.Router();

const contactsController = require('../../controllers/contacts.controller.js');

router.get('/', contactsController.index);

router.get('/profile/:username', contactsController.profile);

module.exports = router;