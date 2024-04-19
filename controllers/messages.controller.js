const RoomChat = require('../models/room-chat.model')
const Chat = require('../models/chat.model')

const socket = require('../sockets/client/index.socket');

// [GET] /messages
module.exports.index = async (req, res, next) => {

  socket(req, res);

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
  
  //! check room
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
  //! end check room

  //! messagesRoomChatSocket
  socket(req, res);
  //! end messagesRoomChatSocket

  //! get aside list contact and messages
  let contacts = await RoomChat.find({
    users: {
      $elemMatch: {
        user: userId
      }
    }
  }).populate({
    path: 'users.user',
    select: 'fullName avatar username'
  }).lean();

  for (let i = 0; i < contacts.length; i++) {
    const lastMessage = await Chat.findOne
    ({
      room_chat_id: contacts[i]._id
    }).sort({
      createdAt: 'desc'
    }).select('-_id content images createdAt user').lean();

    contacts[i].lastMessage = lastMessage || null;
  };

  contacts = contacts.filter(contact => contact.lastMessage);

  contacts.sort((a, b) => {
    return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
  });

  contacts.forEach(contact => {
    contact.users = contact.users.filter(user => user.user._id != userId);
  });

  //! end get aside list contact and messages


  //! get messages
  const chats = await Chat.find({
    room_chat_id: roomChatId
  }).sort({
    createdAt: 'desc'
  }).populate({
    path: 'user',
    select: 'fullName avatar username'
  })
  .lean();

  const groupedChats = [];
  let currentGroup = null;

  for (let i = 0; i < chats.length; i++) {
    const chat = chats[i];
    const previousChat = chats[i - 1];

    if (!previousChat || chat.user._id.toString() !== previousChat.user._id.toString() || previousChat.createdAt - chat.createdAt > 60000) {
      if (previousChat && previousChat.createdAt - chat.createdAt > 60000 && chat.user._id.toString() === previousChat.user._id.toString())
        console.log(previousChat.createdAt - chat.createdAt);
      currentGroup = {
        user: chat.user,
        messages: [chat]
      };
      groupedChats.push(currentGroup);
    } else {
      currentGroup.messages.push(chat);
    }

    currentGroup.messages.sort((a, b) => {
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
  }

  // return res.json(groupedChats)

  // Now you can use groupedChats instead of chats in your template rendering
  res.render('client/pages/messages/index', {
    pageTitle: 'Messages',
    activeTab: 'messages',
    roomChat: roomChat,
    chats: groupedChats
  });
}