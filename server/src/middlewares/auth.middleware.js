const { JwtService } = require('../services/jwt.service')

const withAuth = (req, res, next) => {
  const authHeader = req.get('Authorization')
  console.log(authHeader)
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) return res.status(401).send({ error: 'Unauthorized: No Token' })

  const userData = JwtService.verifyToken(token)
  if (!userData) return res.status(403).send({ error: 'Unauthorized: Invalid Token' }) // Added return statement here
  req['user'] = userData
  return next()
}
module.exports = { withAuth }
