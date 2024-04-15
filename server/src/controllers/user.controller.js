const { AuthService } = require('../services/auth.service')
const { UserService } = require('../services/user.service')

const signIn = async (req, res) => {
  try {
    const { login, password, expoPushToken } = req.body
    console.log('expo token', expoPushToken)
    const data = await AuthService.signIn({ login, password, expoPushToken })
    res.send(data)
  } catch (error) {
    console.log(error)
    res.status(500).send({ error: error.message })
  }
}

const signUp = async (req, res) => {
  try {
    const { login, password, expoPushToken } = req.body
    console.log('expo token', expoPushToken)
    const data = await AuthService.signUp({ login, password, expoPushToken })
    res.send(data)
  } catch (error) {
    console.log(error)
    res.status(500).send({ error: error.message })
  }
}
const getUserFromToken = async (req, res) => {
  try {
    const user = req.user
    const data = await UserService.findUserById(user.userId)
    res.send(data)
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
}
const UserController = {
  signIn,
  signUp,
  getUserFromToken
}
module.exports = { UserController }
