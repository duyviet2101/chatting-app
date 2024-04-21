const contactsSocket = require('./contacts.socket');
const messagesRoomChatSocket = require('./messagesRoomChat.socket');
const messagesAppSocket = require('./messagesApp.socket');
const User = require('../../models/user.model');

module.exports = async (req, res, next) => {
  _io.once('connection', async (socket) => {
    console.log('a user connected:::', socket.id);

    //? SERVER_RETURN_STATUS_ONLINE_USER
    const userId = req.user._id;

    await User.findOneAndUpdate({
      _id: userId
    }, {
      statusOnline: 'online',
      // socketId: socket.id
    });

    socket.broadcast.emit('SERVER_RETURN_STATUS_ONLINE_USER', {
      userId: userId,
      statusOnline: 'online'
    });
    //? end SERVER_RETURN_STATUS_ONLINE_USER

    //? SERVER_RETURN_STATUS_ONLINE_USER
    socket.on('disconnect', async () => {
      await User.findOneAndUpdate({
        _id: userId
      }, {
        statusOnline: 'offline',
        // socketId: ''
      });

      socket.broadcast.emit('SERVER_RETURN_STATUS_ONLINE_USER', {
        userId: userId,
        statusOnline: 'offline'
      });
    });

    contactsSocket(req, res, socket);

    messagesAppSocket(req, res, socket);

    if (req.params.roomChatId)
      messagesRoomChatSocket(req, res, socket);

  });

  next();
}