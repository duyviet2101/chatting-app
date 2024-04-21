const express = require('express');
const router = express.Router();

const contactsController = require('../../controllers/contacts.controller.js');
const asyncHandler = require('../../helpers/handleError.js');

router.get('/', asyncHandler(contactsController.index));

router.get('/profile/:username', asyncHandler(contactsController.profile));

router.get('/contactList/search', asyncHandler(contactsController.searchContactList));

module.exports = router;