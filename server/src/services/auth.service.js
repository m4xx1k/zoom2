const bcryptjs = require('bcryptjs')
const { JwtService } = require('./jwt.service')
const { UserService } = require('./user.service')
const signIn = async (credentials) => {
  const user = await UserService.findUserByLogin(credentials)
  if (!user) throw new Error('User not exist')
  await UserService.updateUser(user._id, { expoPushToken: credentials.expoPushToken })
  const isPasswordValid = await bcryptjs.compare(credentials.password, user.password)
  if (!isPasswordValid) throw new Error('Password is invalid')
  const token = JwtService.createToken({ userId: user._id.toString() })
  return { ...user, token }
}
const signUp = async ({ login, password, expoPushToken }) => {
  const isUserExist = await UserService.isUserExist({ login })
  if (isUserExist) throw new Error('User already exist')
  const hashedPassword = await bcryptjs.hash(password, 10)
  const user = await UserService.create({ login, password: hashedPassword, expoPushToken })
  const token = JwtService.createToken({ userId: user._id.toString() })
  return { ...user.toObject(), token }
}

const AuthService = {
  signUp,
  signIn
}
module.exports = { AuthService }
