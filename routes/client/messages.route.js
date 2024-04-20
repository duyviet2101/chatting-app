const express = require('express');
const router = express.Router();

const controller = require('../../controllers/messages.controller.js');
const asyncHandler = require('../../helpers/handleError.js');

router.get('/', asyncHandler(controller.index));

router.get('/:roomChatId', asyncHandler(controller.show));

router.delete('/:roomChatId/delete', asyncHandler(controller.deleteChats));

module.exports = router;