const RoomChat = require('../models/room-chat.model')
const Chat = require('../models/chat.model')

const contactsSocket = require('../sockets/client/contacts.socket.js')
const messagesSocket = require('../sockets/client/messages.socket.js')

// [GET] /messages
module.exports.index = async (req, res, next) => {

  contactsSocket(req, res);

  res.render('client/pages/messages/index', {
    pageTitle: 'Messages',
    activeTab: 'messages'
  })
}

// [GET] /messages/:roomChatId
module.exports.show = async (req, res, next) => {
  const userId = req.user._id;
  const fullName = req.user.fullName;
  const roomChatId = req.params.roomChatId;

  contactsSocket(req, res);
  
  const roomChat = await RoomChat.findOne({
    _id: roomChatId,
    users: {
      $elemMatch: {
        user: userId
      }
    }
  })

  if (!roomChat) {
    req.flash('errors', 'Room chat not found');
    return res.redirect('/messages')
  }

  messagesSocket(req, res);

  const chats = await Chat.find({
    room_chat_id: roomChatId
  }).sort({
    createdAt: 'asc'
  })

  res.render('client/pages/messages/index', {
    pageTitle: 'Messages',
    activeTab: 'messages',
    roomChat: roomChat,
    chats: chats
  })
}