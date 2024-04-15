const { CallService } = require('../services/call.service')

const create = async (req, res) => {
  try {
    const { from } = req.body
    const data = await CallService.create({ from })
    res.send(data)
  } catch (error) {
    console.log(error)
    res.status(500).send({ error: error.message })
  }
}
const findById = async (req, res) => {
  try {
    const { id } = req.params
    const data = await CallService.findById({ callId: id })
    res.send(data)
  } catch (error) {
    console.log(error)
    res.status(500).send({ error: error.message })
  }
}
const findLatestCall = async (req, res) => {
  try {
    const { id } = req.params
    const data = await CallService.findLatestCall({ to: id })
    res.send(data)
  } catch (error) {
    console.log(error)
    res.status(500).send({ error: error.message })
  }
}
const setAnswer = async (req, res) => {
  try {
    const { callId, answer } = req.params
    const data = await CallService.setAnswer({ callId, answer })
    res.send(data)
  } catch (error) {
    console.log(error)
    res.status(500).send({ error: error.message })
  }
}
const addAnswer = async (req, res) => {
  try {
    const { callId, answer } = req.params
    const data = await CallService.addAnswer({ callId, answer })
    res.send(data)
  } catch (error) {
    console.log(error)
    res.status(500).send({ error: error.message })
  }
}

const CallController = {
  create,
  findById,
  setAnswer,
  addAnswer,
  findLatestCall
}
module.exports = { CallController }
