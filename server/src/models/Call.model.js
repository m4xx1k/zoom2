const mongoose = require('mongoose')

const schema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // required: true,
      index: true
    },
    offer: {
      type: mongoose.Schema.Types.String,
      maxLength: 6000
    },
    answer: {
      type: mongoose.Schema.Types.String,
      maxLength: 6000
    },
    answerCandidates: [
      {
        type: mongoose.Schema.Types.String
      }
    ],
    offerCandidates: [
      {
        type: mongoose.Schema.Types.String
      }
    ],
    callIndex: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
)
const Call = mongoose.model('Call', schema)
module.exports = { Call }
