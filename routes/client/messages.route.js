const express = require('express');
const router = express.Router();

const controller = require('../../controllers/messages.controller.js');
const asyncHandler = require('../../helpers/handleError.js');

router.get('/', asyncHandler(controller.index));

module.exports = router;