const mongoose = require('mongoose')

const roomChatSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  avatar: {
    type: String,
    default: "https://avatar.iran.liara.run/public"
  },
  typeRoom: {
    type: String,
    enum: ['single', 'group'],
    default: 'single'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  users: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      role: {
        type: String,
        enum: ['admin', 'member'],
        default: 'member'
      }
    }
  ],
  deleted: {
    type: Boolean,
    default: false
  },
}, {
  timestamps: true
})

const roomChat = mongoose.model("roomChat", roomChatSchema, "rooms-chat")

module.exports = roomChat