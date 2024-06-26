const User = require('../../models/user.model.js');
const RoomChat = require('../../models/room-chat.model.js');

module.exports = async (req, res, socket) => {

  //! user send request contact
  socket.on('CLIENT_SEND_REQUEST_CONTACT', async (username) => {
    let userA = await User.findOne({ // current User
      _id: req.user._id,
      deleted: false,
      statusAccount: 'active'
    });

    let userB = await User.findOne({ // user recive request
      username: username,
      deleted: false,
      statusAccount: 'active',
      contactBlocked: {
        $ne: userA._id
      }
    });

    if (!userA || !userB) {
      return;
    }

    if (userA.contactRequestsSent.includes(userB._id) || userB.contactRequestsReceived.includes(userA._id)) {
      return;
    }

    // userA.contactRequestsSent.push(userB._id);
    // userB.contactRequestsReceived.push(userA._id);
    userA = await User.findOneAndUpdate({
      _id: userA._id
    }, {
      $push: {
        contactRequestsSent: userB._id
      }
    }, {
      new: true
    });

    userB = await User.findOneAndUpdate({
      _id: userB._id
    }, {
      $push: {
        contactRequestsReceived: userA._id
      }
    }, {
      new: true
    });

    //? emit updated length contactRequestsReceived to userB
    const lengthContactRequestsReceived = userB.contactRequestsReceived.length;
    socket.broadcast.emit('SERVER_RETURN_LENGTH_REQUESTS_RECEIVED', {
      userId: userB._id,
      lengthContactRequestsReceived
    });

    //? emit info user A to user B
    const infoUserA = {
      _id: userA._id,
      username: userA.username,
      fullName: userA.fullName,
      avatar: userA.avatar
    };
    socket.broadcast.emit('SERVER_RETURN_INFO_REQUEST_RECEIVED', {
      userId: userB._id,
      infoUserA
    });

    //? emit updated length contactRequestsSent to userA
    const lengthContactRequestsSent = userA.contactRequestsSent.length;
    socket.emit('SERVER_RETURN_LENGTH_REQUESTS_SENT', {
      userId: userA._id,
      lengthContactRequestsSent
    });
    //? emit info user B to user A
    const infoUserB = {
      _id: userB._id,
      username: userB.username,
      fullName: userB.fullName,
      avatar: userB.avatar
    };
    socket.emit('SERVER_RETURN_INFO_REQUEST_SENT', {
      userId: userA._id,
      infoUserB
    });
  });
  //! end user send request contact

  //! user cancel request contact
  socket.on('CLIENT_CANCEL_REQUEST_CONTACT', async (username) => {
    let userA = await User.findOne({ // current User
      _id: req.user._id,
      deleted: false,
      statusAccount: 'active'
    });

    let userB = await User.findOne({ // user recive request
      username: username,
      deleted: false,
      statusAccount: 'active',
    });

    if (!userA || !userB) {
      return;
    }

    if (!userA.contactRequestsSent.includes(userB._id) || !userB.contactRequestsReceived.includes(userA._id)) {
      return;
    }

    // userA.contactRequestsSent = userA.contactRequestsSent.filter(contact => contact.toString() !== userB._id.toString());
    // userB.contactRequestsReceived = userB.contactRequestsReceived.filter(contact => contact.toString() !== userA._id.toString());
    userA = await User.findOneAndUpdate({
      _id: userA._id
    }, {
      $pull: {
        contactRequestsSent: userB._id
      }
    }, {
      new: true
    });

    userB = await User.findOneAndUpdate({
      _id: userB._id
    }, {
      $pull: {
        contactRequestsReceived: userA._id
      }
    }, {
      new: true
    });

    //? emit updated length contactRequestsReceived to userB
    const lengthContactRequestsReceived = userB.contactRequestsReceived.length;
    socket.broadcast.emit('SERVER_RETURN_LENGTH_REQUESTS_RECEIVED_CANCEL', {
      userId: userB._id,
      lengthContactRequestsReceived
    });

    //? emit info user A to user B
    socket.broadcast.emit('SERVER_RETURN_INFO_CANCEL_REQUEST', {
      userId: userB._id, // user that receive request
      username: userA.username // user that send request
    });

    socket.emit('SERVER_RETURN_INFO_CANCEL_REQUEST', {
      userId: userA._id, // user that send request
      username: userB.username // user that receive request
    });

    //? emit updated length contactRequestsSent to userA
    const lengthContactRequestsSent = userA.contactRequestsSent.length;
    socket.emit('SERVER_RETURN_LENGTH_REQUESTS_SENT', {
      userId: userA._id,
      lengthContactRequestsSent
    });
  });
  //! end user cancel request contact

  //! user accept request contact
  socket.on('CLIENT_ACCEPT_REQUEST_CONTACT', async (username) => {

    let userA = await User.findOne({ // user accept request
      _id: req.user._id,
      deleted: false,
      statusAccount: 'active'
    });

    let userB = await User.findOne({ // user send request
      username: username,
      deleted: false,
      statusAccount: 'active',
    });

    if (!userA || !userB) {
      return;
    }

    if (!userA.contactRequestsReceived.includes(userB._id) || !userB.contactRequestsSent.includes(userA._id)) {
      return;
    }

    if (userA.contactList.some(contact => contact.user.toString() === userB._id.toString()) || userB.contactList.some(contact => contact.user.toString() === userA._id.toString())) {
      return;
    }

    // userA.contactRequestsReceived = userA.contactRequestsReceived.filter(contact => contact.toString() !== userB._id.toString());
    userA = await User.findOneAndUpdate({
      _id: userA._id
    }, {
      $pull: {
        contactRequestsReceived: userB._id
      }
    }, {
      new: true
    });
    // userB.contactRequestsSent = userB.contactRequestsSent.filter(contact => contact.toString() !== userA._id.toString());
    userB = await User.findOneAndUpdate({
      _id: userB._id
    }, {
      $pull: {
        contactRequestsSent: userA._id
      }
    }, {
      new: true
    });

    //? create room
    let room = null;
    const existedRoom = await RoomChat.findOne({
      "users.user": {
        $all: [userA._id, userB._id]
      },
      typeRoom: 'single'
    });

    if (existedRoom) {
      room = existedRoom;
    } else {
      room = new RoomChat({
        users: [{
          user: userA._id,
          role: 'admin'
        }, {
          user: userB._id,
          role: 'admin'
        }],
        typeRoom: 'single'
      });
      await room.save();
    }

    //! join room
    socket.join(room._id.toString());

    userA = await User.findOneAndUpdate({
      _id: userA._id
    }, {
      $push: {
        contactList: {
          user: userB._id,
          room_chat_id: room._id,
          addedAt: new Date()
        }
      }
    }, {
      new: true
    });

    userB = await User.findOneAndUpdate({
      _id: userB._id
    }, {
      $push: {
        contactList: {
          user: userA._id,
          room_chat_id: room._id,
          addedAt: new Date()
        }
      }
    }, {
      new: true
    });
    //? end create room

    //? emit updated length contactRequestsReceived to userA
    const lengthContactRequestsReceived = userA.contactRequestsReceived.length;
    socket.emit('SERVER_RETURN_LENGTH_REQUESTS_RECEIVED_CANCEL', {
      userId: userA._id,
      lengthContactRequestsReceived
    });

    //? emit updated length contactRequestsSent to userB
    const lengthContactRequestsSent = userB.contactRequestsSent.length;
    socket.broadcast.emit('SERVER_RETURN_LENGTH_REQUESTS_SENT', {
      userId: userB._id,
      lengthContactRequestsSent
    });

    //? emit length contactList to userA
    const lengthContactListA = userA.contactList.length;
    socket.emit('SERVER_RETURN_LENGTH_CONTACT_LIST', {
      userId: userA._id,
      lengthContactList: lengthContactListA
    });

    //? emit length contactList to userB
    const lengthContactListB = userB.contactList.length;
    socket.broadcast.emit('SERVER_RETURN_LENGTH_CONTACT_LIST', {
      userId: userB._id,
      lengthContactList: lengthContactListB
    });

    //? emit info user A to user B
    const infoUserA = {
      _id: userA._id,
      username: userA.username,
      fullName: userA.fullName,
      avatar: userA.avatar,
      room_chat_id: room._id,
      statusOnline: userA.statusOnline
    };
    socket.broadcast.emit('SERVER_RETURN_INFO_ACCEPT_REQUEST', {
      userId: userB._id,
      infoUser: infoUserA
    });

    //? emit info user B to user A
    const infoUserB = {
      _id: userB._id,
      username: userB.username,
      fullName: userB.fullName,
      avatar: userB.avatar,
      room_chat_id: room._id,
      statusOnline: userB.statusOnline
    };
    socket.emit('SERVER_RETURN_INFO_ACCEPT_REQUEST', {
      userId: userA._id,
      infoUser: infoUserB
    });

    //? emit remove request received A
    socket.emit('SERVER_RETURN_INFO_CANCEL_REQUEST', {
      userId: userA._id,
      username: userB.username
    });
  });
  //! end user accept request contact

  //! user remove contact
  socket.on('CLIENT_REMOVE_CONTACT', async (username) => {
    let userA = await User.findOne({ // User want to remove contact
      _id: req.user._id,
      deleted: false,
      statusAccount: 'active'
    });

    let userB = await User.findOne({ // user removed
      username: username,
      deleted: false,
      statusAccount: 'active',
    });

    if (!userA || !userB) {
      return;
    }

    if (!userA.contactList.some(contact => contact.user.toString() === userB._id.toString()) || !userB.contactList.some(contact => contact.user.toString() === userA._id.toString())) {
      return;
    }

    // userA.contactList = userA.contactList.filter(contact => contact.user.toString() !== userB._id.toString());
    // userB.contactList = userB.contactList.filter(contact => contact.user.toString() !== userA._id.toString());
    userA = await User.findOneAndUpdate({
      _id: userA._id
    }, {
      $pull: {
        contactList: {
          user: userB._id
        }
      }
    }, {
      new: true
    });

    userB = await User.findOneAndUpdate({
      _id: userB._id
    }, {
      $pull: {
        contactList: {
          user: userA._id
        }
      }
    }, {
      new: true
    });

    //? emit length contactList to userA
    const lengthContactListA = userA.contactList.length;
    socket.emit('SERVER_RETURN_LENGTH_CONTACT_LIST', {
      userId: userA._id,
      lengthContactList: lengthContactListA
    });

    //? emit length contactList to userB
    const lengthContactListB = userB.contactList.length;
    socket.broadcast.emit('SERVER_RETURN_LENGTH_CONTACT_LIST', {
      userId: userB._id,
      lengthContactList: lengthContactListB
    });

    //? emit remove contact to userA
    socket.emit('SERVER_RETURN_REMOVE_CONTACT', {
      userId: userA._id,
      username: userB.username
    });

    //? emit remove contact to userB
    socket.broadcast.emit('SERVER_RETURN_REMOVE_CONTACT', {
      userId: userB._id,
      username: userA.username
    });
  });
  //! end user remove contact

  //! user reject request contact
  socket.on('CLIENT_REJECT_REQUEST_CONTACT', async (username) => {
    let user = await User.findOne({ // user reject request
      _id: req.user._id,
      deleted: false,
      statusAccount: 'active'
    });

    let userB = await User.findOne({ // user send request
      username: username,
      deleted: false,
      statusAccount: 'active',
    });

    if (!user || !userB) {
      return;
    }

    if (!user.contactRequestsReceived.includes(userB._id) || !userB.contactRequestsSent.includes(user._id)) {
      return;
    }

    // user.contactRequestsReceived = user.contactRequestsReceived.filter(contact => contact.toString() !== userB._id.toString());
    // userB.contactRequestsSent = userB.contactRequestsSent.filter(contact => contact.toString() !== user._id.toString());
    user = await User.findOneAndUpdate({
      _id: user._id
    }, {
      $pull: {
        contactRequestsReceived: userB._id
      }
    }, {
      new: true
    });

    userB = await User.findOneAndUpdate({
      _id: userB._id
    }, {
      $pull: {
        contactRequestsSent: user._id
      }
    }, {
      new: true
    });

    //? emit updated length contactRequestsSent to userB
    const lengthContactRequestsSent = userB.contactRequestsSent.length;
    socket.broadcast.emit('SERVER_RETURN_LENGTH_REQUESTS_SENT', {
      userId: userB._id,
      lengthContactRequestsSent
    });

    //? emit info user A to user B
    socket.broadcast.emit('SERVER_RETURN_INFO_CANCEL_REQUEST', {
      userId: userB._id,
      username: user.username
    });

    //? emit updated length contactRequestsReceived to userA
    const lengthContactRequestsReceived = user.contactRequestsReceived.length;
    socket.emit('SERVER_RETURN_LENGTH_REQUESTS_RECEIVED_CANCEL', {
      userId: user._id,
      lengthContactRequestsReceived
    });

    //? emit info user B to user A
    socket.emit('SERVER_RETURN_INFO_CANCEL_REQUEST', {
      userId: user._id,
      username: userB.username
    });
  });
  //! end user reject request contact

  //! user join room chat
  socket.on('JOIN', async (roomId) => {
    socket.join(roomId);
  });
}