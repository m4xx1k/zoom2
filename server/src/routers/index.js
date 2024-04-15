const { Router } = require('express')

const { UserRouter } = require('./user.router')
const { CallRouter } = require('./call.router')
const router = Router()
router.use('/user', UserRouter)
router.use('/call', CallRouter)
module.exports = { ApiRouter: router }
