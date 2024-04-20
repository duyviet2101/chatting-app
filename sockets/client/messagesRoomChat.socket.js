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
      createdAt: message.createdAt,
      roomChatId: roomChatId
    });

    //? end typing
    _io.to(roomChatId).emit('SERVER_RETURN_TYPING', {
      userId: userId,
      fullName: fullName,
      avatar: avatar,
      isTyping: false,
      roomChatId: roomChatId
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
      isTyping: isTyping,
      roomChatId: roomChatId
    });
  });
  //! end CLIENT_SEND_TYPING

  //! CLIENT_UPDATE_LAST_MESSAGE_SEEN
  socket.on('CLIENT_UPDATE_LAST_MESSAGE_SEEN', async (data) => {
    const userId = data.userId;
    
    const lastMessage = await Chat.findOne({
      room_chat_id: roomChatId
    }).sort({
      createdAt: "desc"
    }).lean();

    const res = await RoomChat.findOneAndUpdate({
      _id: roomChatId,
      'users.user': userId
    }, {
      $set: {
        'users.$.lastMessageSeen': lastMessage._id.toString()
      }
    }, {
      new: true
    })

    _io.to(roomChatId).emit('SERVER_RETURN_LAST_MESSAGE_SEEN', {
      userId,
      roomChatId,
      fullName
    });
  });
  //! end CLIENT_UPDATE_LAST_MESSAGE_SEEN
};