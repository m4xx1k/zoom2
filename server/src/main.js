const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const morgan = require('morgan')
const { Server } = require('socket.io')
const cors = require('cors')
const { ApiRouter } = require('./routers/index')
const { createServer } = require('http')
const { CallService } = require('./services/call.service')
const { UserService } = require('./services/user.service')
dotenv.config()
const axios = require('axios')
async function bootstrap() {
  await connectDB()
  const app = express()

  const httpServer = createServer()
  const io = new Server(httpServer, {
    cors: {
      origin: '*'
    }
  })

  httpServer.listen(4000)
  io.on('connection', (socket) => {
    log(`[socket]: New connection ${socket.id}`)
    function leaveAllRooms(socket) {
      socket.rooms.forEach((room) => socket.leave(room))
    }

    socket.on('call-create', async ({ from, to: toIndex }) => {
      log('[socket]: call-create')
      leaveAllRooms(socket)
      const callee = await UserService.findOne({ index: toIndex })
      log('callee', callee._id.toString(), callee.expoPushToken)
      sendPushNotification(callee.expoPushToken).catch(onAxiosError)
      const call = await CallService.create({ from, to: callee._id })
      const callId = call._id.toString()
      await socket.join(callId)
      await socket.join(from)
      io.to(from).emit('call-created', call)
    })

    socket.on('call-join', async (data) => {
      log('[socket]: call-join')
      leaveAllRooms(socket)
      const call = await CallService.callJoin(data)
      const callId = call._id.toString()
      const fromId = call.from.toString()
      await socket.join(callId)
      await socket.join(data.to)
      io.to(fromId).emit('call-joined', call)
    })

    socket.on('set-answer', async (data) => {
      log('[socket]: set-answer')
      const call = await CallService.setAnswer({ ...data, answer: JSON.stringify(data.answer) })
      const fromId = call.from.toString()
      io.to(fromId).emit('answer-set', data)
    })

    socket.on('set-offer', async (data) => {
      log('[socket]: set-offer')
      const call = await CallService.addOffer({ ...data, offer: JSON.stringify(data.offer) })
      const toId = call.to.toString()
      //TODO: emit after offer
      io.to(toId).emit('offer-set', data)
    })

    socket.on('ice-candidate-to-callee', async (data) => {
      log('[socket]: ice-candidate-to-callee')
      const call = await CallService.findById(data.callId)
      const toId = call.to.toString()
      io.to(toId).emit('ice-candidate', data.candidate)
    })

    socket.on('ice-candidate-to-caller', async (data) => {
      log('[socket]: ice-candidate-to-caller')
      const call = await CallService.findById(data.callId)
      const fromId = call.from.toString()
      io.to(fromId).emit('ice-candidate', data.candidate)
    })

    socket.on('call-reject', async ({ index }) => {
      log('[socket]: call-reject', index)

      const call = await CallService.updateByIndex({ index: Number(index), data: { status: 'rejected' } })
      const fromId = call.from.toString()
      io.to(fromId).emit('call-rejected', call)
    })

    socket.on('call-accept', async ({ index }) => {
      log('[socket]: call-accept')
      await CallService.updateByIndex({ index: Number(index), data: { status: 'accepted' } })
    })

    socket.on('disconnect', () => {
      console.log(`[socket]: ${socket.id} disconnected`)
    })
  })
  app.use(morgan('dev'))
  app.use(
    cors({
      origin: '*'
    })
  )
  app.use(express.json())
  app.use('/api', ApiRouter)

  const port = 5000
  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`)
  })
}
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      autoIndex: true
    })
    console.log('[db]: Connected to the database')
  } catch (err) {
    console.log('[db]: Database connection failed', err)
  }
}
async function sendPushNotification(expoPushToken) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'Incoming Call',
    body: 'Someone wants talk to you!',
    data: { someData: 'goes here' }
  }
  await axios.post('https://exp.host/--/api/v2/push/send', message, {
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json'
    }
  })
}
const log = (...messages) => console.log(`${new Date().toISOString().split('T')[1].split('.')[0]}`, ...messages)
bootstrap()
function onAxiosError(error) {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.log(error.response.data)
    console.log(error.response.status)
    console.log(error.response.headers)
  } else if (error.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    console.log(error.request)
  } else {
    // Something happened in setting up the request that triggered an Error
    console.log('Error', error.message)
  }
  console.log(error.config)
}
