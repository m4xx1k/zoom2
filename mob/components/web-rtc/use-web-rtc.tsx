import { useRouter } from 'expo-router'

import { useEffect, useRef, useState } from 'react'
import {
	MediaStream,
	RTCPeerConnection,
	mediaDevices,
	registerGlobals,
} from 'react-native-webrtc'
import { socket } from '../../lib/socket'
import { useUserStore } from '../../store/user.store'
import { Call } from '../../types/call'
export const useWebRtcCall = (id: string) => {
	const router = useRouter()
	const peerConnections = useRef<RTCPeerConnection | null>(null)
	const [localStream, setLocalStream] = useState<MediaStream>(new MediaStream())
	const [remoteStream, setRemoteStream] = useState<MediaStream>(
		new MediaStream()
	)
	const [status, setStatus] = useState<RTCPeerConnectionState | 'calling' | ''>(
		id.startsWith('caller') ? 'calling' : ''
	)
	const { user } = useUserStore()
	const [isConnected, setIsConnected] = useState(false)
	const [isMuted, setIsMuted] = useState(false)
	const [isOffCam, setIsOffCam] = useState(false)
	const [callId, setCallId] = useState('')

	const initLocalStreams = async () => {
		const devices = (await mediaDevices.enumerateDevices()) as MediaDeviceInfo[]
		const videoSourceId = devices.find(
			device => device.kind === 'videoinput'
		).deviceId
		const constraints = getConstraints(videoSourceId)
		const stream = await mediaDevices.getUserMedia(constraints)
		stream.getTracks().forEach(track => {
			if (peerConnections.current) {
				peerConnections.current.addTrack(track, stream)
			}
		})
		setLocalStream(stream)
	}

	const connectToSocket = () => {
		socket.disconnect()
		socket.connect()
	}
	;``
	const handleCreateCall = async () => {
		socket.emit('call-create', { from: user._id })
	}

	const handleJoinCall = async () => {
		// await initLocalStreams()
		socket.emit('call-join', { callIndex: id, to: user._id })
	}
	useEffect(() => {
		//caller
		socket.off('call-created').on('call-created', (call: Call) => {
			log(JSON.stringify(call))
		})
		// caller
		socket.off('call-joined').on('call-joined', async (call: Call) => {
			const peer = peerConnections.current
			const offerDescription = await peer.createOffer(sessionConstraints)
			await peer.setLocalDescription(offerDescription)
			const offer = {
				sdp: offerDescription.sdp,
				type: offerDescription.type,
			}

			log(`OFFER LEN ${JSON.stringify(offer).length}`)
			socket.emit('set-offer', {
				callId: call._id,
				offer,
			})
			peerConnections.current.addEventListener('icecandidate', event => {
				if (event.candidate) {
					socket.emit('ice-candidate-to-callee', {
						callId: call._id,
						candidate: event.candidate.toJSON(),
					})
				}
			})
		})

		//callee
		socket.off('offer-set').on('offer-set', async (call: any) => {
			log(`offer-set `)
			const peer = peerConnections.current
			const offer = call.offer
			await peer.setRemoteDescription(new RTCSessionDescription(offer))
			const answerDescription = await peer.createAnswer()
			await peer.setLocalDescription(
				new RTCSessionDescription(answerDescription)
			)

			const answer = {
				type: answerDescription.type,
				sdp: answerDescription.sdp,
			}
			socket.emit('set-answer', {
				callId: call.callId,
				answer,
			})
			peerConnections.current.addEventListener('icecandidate', event => {
				if (event.candidate) {
					socket.emit('ice-candidate-to-caller', {
						callId: call.callId,
						candidate: event.candidate.toJSON(),
					})
				}
			})
		})
		//caller
		socket.off('answer-set').on('answer-set', async (data: any) => {
			const peer = peerConnections.current
			const answer = data.answer
			await peer.setRemoteDescription(new RTCSessionDescription(answer))
		})
		//
		socket.off('ice-candidate').on('ice-candidate', async (candidate: any) => {
			await peerConnections.current.addIceCandidate(
				new RTCIceCandidate(candidate)
			)
		})
		socket.off('call-rejected').on('call-rejected', () => {
			router.push('/waiting')
		})

		return () => {
			socket.off('call-created')
			socket.off('call-joined')
			socket.off('offer-set')
			socket.off('answer-set')
			socket.off('ice-candidate')
			socket.disconnect()
		}
	}, [])

	const hangUp = () => {
		setIsConnected(false)

		log('HANG UP', `${isOffCam}`)
		if (localStream) {
			localStream.getTracks().forEach(track => {
				track.enabled = false
				track._enabled = false
			})
			localStream.getTracks().forEach(track => track.stop())
		}
		if (peerConnections.current) {
			const senders = peerConnections.current.getSenders()
			senders.forEach(sender => {
				peerConnections.current && peerConnections.current.removeTrack(sender)
			})
			peerConnections.current.getTransceivers().forEach(transceiver => {
				transceiver.stop()
			})
			peerConnections.current.close()
		}
		peerConnections.current = null
		setLocalStream(null)
		setRemoteStream(null)
		router.push('/waiting')
	}

	useEffect(() => {
		peerConnections.current &&
			peerConnections.current.addEventListener('track', event => {
				const newStream = new MediaStream()
				event.streams[0].getTracks().forEach(track => newStream.addTrack(track))
				setRemoteStream(newStream)
			})
	}, [peerConnections, remoteStream])

	useEffect(() => {
		const init = async () => {
			registerGlobals()
			const peer = new RTCPeerConnection(servers)
			peer.addEventListener('connectionstatechange', async () => {
				const state = peerConnections.current?.connectionState
				if (!state) return
				console.log(` [ ${state} ] `.toUpperCase())
				const isDisconnected = ['disconnected', 'failed', 'closed'].includes(
					state
				)
				setStatus(state)
				const isConnected = state === 'connected'
				if (isDisconnected) setIsConnected(null)
				if (isConnected) setIsConnected(true)
			})
			peerConnections.current = peer
			setRemoteStream(new MediaStream())
			await initLocalStreams()
			log('INIT WEB RTC', id)
			if (!id.startsWith('caller')) await handleJoinCall()
			// await answerCall()
		}
		init()
	}, [id])
	useEffect(() => {
		if (isConnected === null) {
			hangUp()
		}
	}, [isConnected])

	const switchCamera = () => {
		localStream &&
			localStream.getVideoTracks().forEach(track => track._switchCamera())
	}

	const toggleMute = () => {
		if (!localStream) return
		localStream.getAudioTracks().forEach(track => {
			track.enabled = !track.enabled
			setIsMuted(!track.enabled)
		})
	}

	const toggleCamera = () => {
		console.log(`'is local stream ${!!localStream}'`)
		if (!localStream) return
		localStream.getVideoTracks().forEach(track => {
			log('TOGGLE CAMERA', `${track.enabled}`)
			track.enabled = !track.enabled
			setIsOffCam(!isOffCam)
		})
	}
	useEffect(() => {
		return () => {
			hangUp()
		}
	}, [])
	return {
		handlers: {
			switchCamera,
			toggleMute,
			toggleCamera,
			hangUp,
			initLocalStreams,
			handleCreateCall,
			handleJoinCall,
			setCallId,
			connectToSocket,
		},
		streams: {
			local: localStream,
			remote: remoteStream,
		},
		state: {
			callId,
			isMuted,
			isOffCam,
			isConnected,
			status,
		},
	}
}
const log = (...messages: string[]) =>
	console.log(
		`${new Date().toISOString().split('T')[1].split('.')[0]}`,
		...messages
	)
const getConstraints = (videoSourceId: string) => ({
	video: true,
	audio: true,
	facingMode: 'user',
	optional: videoSourceId ? [{ sourceId: videoSourceId }] : [],
})
export const sessionConstraints = {
	mandatory: {
		OfferToReceiveAudio: true,
		OfferToReceiveVideo: true,
		VoiceActivityDetection: true,
	},
}
export const servers = {
	iceServers: [
		{
			urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'], // free stun server
		},
	],
	iceCandidatePoolSize: 10,
}
