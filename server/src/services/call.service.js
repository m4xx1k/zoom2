const { Call } = require('../models/Call.model')

const findAll = async () => {
  return await Call.find({}).lean()
}

const create = async ({ from, to }) => {
  const callIndex = await Call.countDocuments()
  return await Call.create({ from, to, callIndex })
}

async function addOffer({ callId, offer }) {
  return await Call.findByIdAndUpdate(callId, { offer })
}
async function findById(callId) {
  return await Call.findById(callId)
}
async function callJoin({ callIndex, to }) {
  return await Call.findOneAndUpdate({ callIndex }, { to })
}
async function setAnswer({ callId, answer }) {
  return await Call.findByIdAndUpdate(callId, { answer })
}
async function addAnswer({ callId, answer }) {
  return await Call.findByIdAndUpdate(callId, {
    answerCandidates: {
      $push: answer
    }
  })
}
async function updateByIndex({ index, data }) {
  try {
    return await Call.findOneAndUpdate({ callIndex: index }, data)
  } catch (e) {
    console.log('error on updating, ', index)
  }
}

async function findLatestCall({ to }) {
  return await Call.findOne({ to, status: 'pending' }).sort({ createdAt: -1 })
}

const CallService = {
  findAll,
  addOffer,
  create,
  findById,
  setAnswer,
  addAnswer,
  callJoin,
  updateByIndex,
  findLatestCall
}
module.exports = {
  CallService
}
