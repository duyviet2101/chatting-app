const express = require('express');
const router = express.Router();

const homeController = require('../../controllers/home.controller.js');
const asyncHandler = require('../../helpers/handleError.js');

router.get('/', asyncHandler(homeController.index));

module.exports = router;