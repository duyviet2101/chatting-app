const RoomChat = require('../models/room-chat.model');
const Chat = require('../models/chat.model');
const User = require('../models/user.model');

const socket = require('../sockets/client/index.socket');

// [GET] /messages
module.exports.index = async (req, res, next) => {
  const userId = req.user._id;

  socket(req, res);

  //! get aside list contact and messages
  let contactsAsideList = await RoomChat.find({
    users: {
      $elemMatch: {
        user: userId
      }
    }
  }).populate({
    path: 'users.user',
    select: 'fullName avatar username'
  }).lean();

  for (let i = 0; i < contactsAsideList.length; i++) {
    const lastMessage = await Chat.findOne
    ({
      room_chat_id: contactsAsideList[i]._id
    }).sort({
      createdAt: 'desc'
    }).select('-_id content images createdAt user').lean();

    contactsAsideList[i].lastMessage = lastMessage || null;
  };

  contactsAsideList = contactsAsideList.filter(contact => contact.lastMessage);

  contactsAsideList.sort((a, b) => {
    return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
  });

  contactsAsideList.forEach(contact => {
    contact.users = contact.users.filter(user => user.user._id.toString() != userId);
  });

  // return res.json(contactsAsideList);
  //! end get aside list contact and messages

  //! get contact list
  const user = await User.findOne({
    _id: userId
  })
  .select('contactList')
  .populate({
    path: 'contactList.user',
    select: 'fullName username avatar'
  })
  .lean();

  user.contactList.sort((a, b) => {
    return a.user.fullName.localeCompare(b.user.fullName)
  });
  // return res.json(user.contactList)
  //! end get contact list


  res.render('client/pages/messages/index', {
    pageTitle: 'Messages',
    activeTab: 'messages',
    contactsAsideList,
    contactList: user.contactList
  })
}

// [GET] /messages/:roomChatId
module.exports.show = async (req, res, next) => {
  const userId = req.user._id;
  const fullName = req.user.fullName;
  const roomChatId = req.params.roomChatId;
  
  //! check room
  let roomChat = await RoomChat.findOne({
    _id: roomChatId,
    users: {
      $elemMatch: {
        user: userId
      }
    },
    status: 'active'
  }).populate({
    path: 'users.user',
    select: 'fullName username email phone avatar cover bio contactList groups gender statusOnline'
  }).lean();

  if (!roomChat) {
    req.flash('errors', 'Room chat not found');
    return res.redirect('/messages')
  }
  roomChat.users = roomChat.users.filter(user => user.user._id.toString() != userId);

  // return res.json(roomChat)
  //! end check room

  //! update lastMessageSeen
  const lastMessage = await Chat.findOne({
    room_chat_id: roomChatId
  }).sort({
    createdAt: 'desc'
  }).select('content images createdAt user').lean();

  const newRoomChat = await RoomChat.findOneAndUpdate({
    _id: roomChatId,
    'users.user': userId
  }, {
    $set: {
      'users.$.lastMessageSeen': lastMessage._id
    }
  }, {
    new: true
  }).lean();
  //! end update lastMessageSeen

  //! messagesRoomChatSocket
  socket(req, res);
  //! end messagesRoomChatSocket

  //! get aside list contact and messages
  let contactsAsideList = await RoomChat.find({
    users: {
      $elemMatch: {
        user: userId
      }
    }
  }).populate({
    path: 'users.user',
    select: 'fullName avatar username'
  }).populate({
    path: 'users.lastMessageSeen',
    select: 'user room_chat_id'
  }).lean();

  for (let i = 0; i < contactsAsideList.length; i++) {
    const lastMessage = await Chat.findOne
    ({
      room_chat_id: contactsAsideList[i]._id
    }).sort({
      createdAt: 'desc'
    }).select('content images createdAt user').lean();

    contactsAsideList[i].lastMessage = lastMessage || null;
  };

  contactsAsideList = contactsAsideList.filter(contact => contact.lastMessage);

  contactsAsideList.sort((a, b) => {
    return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
  });

  contactsAsideList.forEach(contact => {
    contact.users.forEach(user => {
      if (user.user._id.toString() == userId) {
        if (user.lastMessageSeen && user.lastMessageSeen._id.toString() == contact.lastMessage._id.toString()) {
          contact.unread = false;
        } else {
          contact.unread = true;
        }
      } else {
        if (user.lastMessageSeen && user.lastMessageSeen._id.toString() == contact.lastMessage._id.toString()) {
          contact.seen = true;
        } else {
          contact.seen = false;
        }
      }
    })
    contact.users = contact.users.filter(user => user.user._id.toString() != userId);
  });

  // return res.json(contactsAsideList);
  //! end get aside list contact and messages

  //! get contact list
  const user = await User.findOne({
    _id: userId
  })
  .select('contactList')
  .populate({
    path: 'contactList.user',
    select: 'fullName username avatar'
  })
  .lean();

  user.contactList.sort((a, b) => {
    return a.user.fullName.localeCompare(b.user.fullName)
  });
  // return res.json(user.contactList)
  //! end get contact list

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

    if (!previousChat || previousChat.createdAt - chat.createdAt > 60000 || chat.user._id.toString() !== previousChat.user._id.toString()) {
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
  //! end get messages


  // Now you can use groupedChats instead of chats in your template rendering
  res.render('client/pages/messages/index', {
    pageTitle: 'Messages',
    activeTab: 'messages',
    roomChat: roomChat,
    chats: groupedChats,
    contactsAsideList,
    roomChatId,
    contactList: user.contactList
  });
}