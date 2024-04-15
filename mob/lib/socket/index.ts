import { io } from 'socket.io-client'
export const socket = io('https://xvhfmgqp-4000.euw.devtunnels.ms/', {
	reconnectionDelay: 1000,
	reconnection: true,
	reconnectionAttempts: 10,
	transports: ['websocket'],
	agent: false,
	upgrade: false,
	rejectUnauthorized: false,
})
