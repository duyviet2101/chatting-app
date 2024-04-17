const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
mongoose.plugin(slug, {
  separator: '_',
  lang: 'en',
  truncate: 20
});

const UserSchema = mongoose.Schema({
  fullName: String,
  email: String,
  password: String,
  refreshToken: {
    type: String,
    default: null,
  },
  username: {
    type: String,
    unique: true,
    slug: 'fullName',
  },
  phone: String,
  avatar: {
    type: String,
    default: "https://avatar.iran.liara.run/public",
  },
  cover: {
    type: String,
    default: "",
  },
  bio: {
    type: String,
    default: '',
  },
  verified: {
    type: Boolean,
    default: false,
  },
  gender: {
    type: String
  },
  contactList: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      room_chat_id: String
    }
  ],
  contactRequestsReceived: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      room_chat_id: String
    }
  ],
  contactRequestsSent: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      room_chat_id: String
    }
  ],
  groups: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group'
    }
  ],
  statusOnline: String,
  statusAccount: {
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