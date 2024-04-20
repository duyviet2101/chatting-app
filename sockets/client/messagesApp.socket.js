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

  roomsChat.forEach(room => {
    socket.join(room._id.toString());
  });

};