const {
  uploadCloudinaryByURL,
  uploadMultipleCloudinaryByBuffer,
  uploadSingleCloudinaryByBuffer
} = require('../../helpers/uploadCloudinary.js');

const User = require('../../models/user.model.js');

module.exports = async (req, res) => {

  _io.once('connection',  async (socket) => {
    console.log('a user connected:::', socket.id);
    socket.on('disconnect', () => {
      console.log('user disconnected:::', socket.id);
    });
    
    //! user send request contact
    socket.on('CLIENT_SEND_REQUEST_CONTACT', async (username) => {
      console.log('CLIENT_SEND_REQUEST_CONTACT::: ', username);
    });
    //! end user send request contact

  });
}