const jwt = require('jsonwebtoken')
const createToken = ({ userId }) => {
  return jwt.sign({ userId }, process.env.SECRET_KEY, {
    expiresIn: '24h'
  })
}
const verifyToken = (token) => {
  let data
  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) data = null
    data = user
  })
  return data
}
const JwtService = {
  createToken,
  verifyToken
}
module.exports = { JwtService }
