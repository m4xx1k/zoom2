const mongoose = require('mongoose')

const schema = new mongoose.Schema(
  {
    index: {
      type: Number,
      required: true
    },
    login: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    password: {
      type: String,
      required: true
    },
    expoPushToken: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
)
const User = mongoose.model('User', schema)
module.exports = { User }
