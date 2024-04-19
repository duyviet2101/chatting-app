const User = require('../../models/user.model');
const Chat = require('../../models/chat.model');
const RoomChat = require('../../models/room-chat.model');

module.exports = async (req, res, socket) => {
  const userId = res.locals.user._id;
  const fullName = res.locals.user.fullName;
  const roomChatId = req.params.roomChatId;
  const avatar = res.locals.user.avatar;

  socket.join(roomChatId);
  console.log('A user connected to room chat: ' + roomChatId);

  //! CLIENT_SEND_MESSAGE
  socket.on('CLIENT_SEND_MESSAGE', async (data) => {
    const content = data.content;
    const sender = data.userId;

    if (sender != userId) {
      return;
    }
    
    const message = new Chat({
      user: userId,
      room_chat_id: roomChatId,
      content: content
    });

    await message.save();

    //? return data to client
    _io.to(roomChatId).emit('SERVER_RETURN_SEND_MESSAGE', {
      userId: userId,
      fullName: fullName,
      content: content,
      avatar: avatar,
      createdAt: message.createdAt
    });

    //? end typing
    _io.to(roomChatId).emit('SERVER_RETURN_TYPING', {
      userId: userId,
      fullName: fullName,
      avatar: avatar,
      isTyping: false
    });
  });
  //! CLIENT_SEND_MESSAGE

  //! CLIENT_SEND_TYPING
  socket.on('CLIENT_SEND_TYPING', async (data) => {
    const isTyping = data.isTyping;
    const sender = data.userId;

    if (sender != userId) {
      return;
    }

    _io.to(roomChatId).emit('SERVER_RETURN_TYPING', {
      userId: userId,
      fullName: fullName,
      avatar: avatar,
      isTyping: isTyping
    });
  });
  //! end CLIENT_SEND_TYPING
};