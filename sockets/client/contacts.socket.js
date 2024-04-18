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
      const userA = await User.findOne({ // current User
        _id: req.user._id,
        deleted: false,
        statusAccount: 'active'
      });

      const userB = await User.findOne({ // user recive request
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

      userA.contactRequestsSent.push(userB._id);
      userB.contactRequestsReceived.push(userA._id);

      await userA.save();
      await userB.save();

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
      const userA = await User.findOne({ // current User
        _id: req.user._id,
        deleted: false,
        statusAccount: 'active'
      });

      const userB = await User.findOne({ // user recive request
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

      userA.contactRequestsSent = userA.contactRequestsSent.filter(contact => contact.toString() !== userB._id.toString());
      userB.contactRequestsReceived = userB.contactRequestsReceived.filter(contact => contact.toString() !== userA._id.toString());

      await userA.save();
      await userB.save();

      //? emit updated length contactRequestsReceived to userB
      const lengthContactRequestsReceived = userB.contactRequestsReceived.length;
      socket.broadcast.emit('SERVER_RETURN_LENGTH_REQUESTS_RECEIVED_CANCEL', {
        userId: userB._id,
        lengthContactRequestsReceived
      });

      //? emit info user A to user B
      socket.broadcast.emit('SERVER_RETURN_INFO_CANCEL_REQUEST', {
        userId: userB._id,
        username: userA.username
      });

      //? emit updated length contactRequestsSent to userA
      const lengthContactRequestsSent = userA.contactRequestsSent.length;
      socket.emit('SERVER_RETURN_LENGTH_REQUESTS_SENT', {
        userId: userA._id,
        lengthContactRequestsSent
      });
    });
    //! end user cancel request contact
  });
}