const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
  fullName: String,
  email: String,
  password: String,
  refreshToken: {
    type: String,
    default: null,
  },
  phone: String,
  avatar: {
    type: String,
    default: "https://avatar.iran.liara.run/public",
  },
  friendList: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      room_chat_id: String
    }
  ],
  acceptFriends: Array,
  requestFriends: Array,
  statusOnline: String,
  status: {
    type: String,
    default: 'active'
  },
  deleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: Date,
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema, 'users');