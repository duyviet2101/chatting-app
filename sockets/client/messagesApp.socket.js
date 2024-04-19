const User = require('../../models/user.model');
const Chat = require('../../models/chat.model');
const RoomChat = require('../../models/room-chat.model');

module.exports = async (req, res, socket) => {
  const user = await User.findOne({
    _id: res.locals.user._id
  }).select('fullName username contactList').lean();

  const roomsChat = await RoomChat.find({
    users: {
      $elemMatch: {
        user: user._id
      }
    }
  }).lean();

  socket.on('CLIENT_SEND_TYPING', async (data) => {
    const isTyping = data.isTyping;
    const userId = data.userId;
    const roomChatId = data.roomChatId;

    socket.broadcast.emit('SERVER_RETURN_TYPING_ASIDE', {
      userId,
      isTyping: isTyping,
      roomChatId
    });
  });
};