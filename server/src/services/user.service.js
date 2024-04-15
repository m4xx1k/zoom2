const { User } = require('../models/User.model')

const findAll = async () => {
  return await User.find({}).lean()
}
const findOne = async (filter) => {
  return await User.findOne(filter).lean()
}
const isUserExist = async ({ login }) => {
  const user = await User.countDocuments({ login })
  return user > 0
}

const create = async ({ login, password, expoPushToken }) => {
  const index = await User.countDocuments()
  return await User.create({ login, password, expoPushToken, index })
}
const findUserById = async (userId) => {
  return await User.findById(userId).lean()
}
const findUserByLogin = async ({ login }) => {
  return await User.findOne({ login }).lean()
}
const updateUser = async (userId, data) => {
  return await User.findByIdAndUpdate(userId, data)
}
const UserService = {
  findAll,
  isUserExist,
  create,
  findUserByLogin,
  findUserById,
  findOne,
  updateUser
}
module.exports = {
  UserService
}
