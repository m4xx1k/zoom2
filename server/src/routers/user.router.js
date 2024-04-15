const { Router } = require('express')
const { UserController } = require('../controllers/user.controller')
const { withAuth } = require('../middlewares/auth.middleware')
const router = Router()
router.post('/sign-in', UserController.signIn)
router.post('/sign-up', UserController.signUp)
router.get('/me', withAuth, UserController.getUserFromToken)
module.exports = { UserRouter: router }
