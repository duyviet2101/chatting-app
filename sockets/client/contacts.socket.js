const {
  uploadCloudinaryByURL,
  uploadMultipleCloudinaryByBuffer,
  uploadSingleCloudinaryByBuffer
} = require('../../helpers/uploadCloudinary.js');

const User = require('../../models/user.model.js');

module.exports = async (res) => {
  _io.once('connection',  async (socket) => {
    console.log('contacts.socket.js');
  });
}