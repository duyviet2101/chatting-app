const express = require('express');
const router = express.Router();

const upload = require('multer')();
const {
  uploadMultipleCloudinaryByBuffer,
  uploadSingleCloudinaryByBuffer
} = require('../../helpers/uploadCloudinary.js');

const controller = require('../../controllers/user.controller.js');
const asyncHandler = require('../../helpers/handleError.js');

router.get('/profile', asyncHandler(controller.profile));

router.patch('/profile/edit',
  upload.fields([
    {name: 'avatar', maxCount: 1},
    {name: 'cover', maxCount: 1}
  ]),
  asyncHandler(async (req, res, next) => {
    if (req.files.avatar) {
      req.body.avatar = (await uploadMultipleCloudinaryByBuffer({files: req.files.avatar, folder: '/user/avatar'}))[0];
    }

    if (req.files.cover) {
      req.body.cover = (await uploadMultipleCloudinaryByBuffer({files: req.files.cover, folder: '/user/cover'}))[0];
    }

    next();
  }),
  asyncHandler(controller.postEditProfile)
);

module.exports = router;