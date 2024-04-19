const contactsSocket = require('./contacts.socket');
const messagesRoomChatSocket = require('./messagesRoomChat.socket');
const messagesAppSocket = require('./messagesApp.socket');

module.exports = async (req, res) => {
  _io.once('connection', (socket) => {
    console.log('a user connected:::', socket.id);
    console.log('userId:::', res.locals.user._id);

    contactsSocket(req, res, socket);

    if (req.params.roomChatId)
      messagesRoomChatSocket(req, res, socket);

    messagesAppSocket(req, res, socket);
  });
}