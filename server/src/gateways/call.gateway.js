const { CallService } = require('../services/call.service')

async function CallGateway(socket) {
  console.log(`[socket]: New connection ${socket.id}`)

  socket.on('call-create', async (data) => {
    const call = await CallService.create(data)
    socket.join(call._id)
    socket.to(call._id).emit('call-created', call)
  })

  socket.on('call-join', async (data) => {
    socket.join(data.callId)
  })

  socket.on('set-answer', (data) => {
    CallService.setAnswer(data)
    socket.broadcast.emit('answer-set', data)
  })
  socket.on('set-offer', (data) => {
    CallService.addOffer(data)
    //TODO: emit after offer
    socket.broadcast.emit('offer', data)
  })
  socket.on('disconnect', () => {
    console.log(`[socket]: ${socket.id} disconnected`)
  })
}
module.exports = { CallGateway }
