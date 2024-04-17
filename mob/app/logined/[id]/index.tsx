import { useLocalSearchParams } from 'expo-router'
import React, { useEffect } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { RTCView } from 'react-native-webrtc'
import { useWebRtcCall } from '../../../components/web-rtc/use-web-rtc'
import { socket } from '../../../lib/socket'
const call = () => {
	const { id } = useLocalSearchParams()

	const { state, streams, handlers } = useWebRtcCall(id as string)
	useEffect(() => {
		if (!socket.connected) {
			socket.connect()
		}
		return () => {
			handlers.hangUp()
		}
	}, [])

	return (
		<SafeAreaView style={styles.container}>
			{streams.remote && state.isConnected && (
				<RTCView
					style={styles.remoteStream}
					streamURL={streams.remote.toURL()}
					objectFit={'cover'}
				/>
			)}
			{!state.isConnected && (
				<View
					style={{
						...styles.remoteStream,
						alignItems: 'center',
						justifyContent: 'center',
						backgroundColor: 'lightgray',
					}}
				>
					<Text style={styles.status}>
						{state.status === 'connecting' && '🔄 Connecting '}
						{state.status === 'calling' && '⌛ Calling '}
						...
					</Text>
				</View>
			)}
			{streams.local && (
				<RTCView
					style={styles.remoteStream}
					streamURL={streams.local.toURL()}
					objectFit={'cover'}
					mirror
				/>
			)}

			<View style={styles.control}>
				<TouchableOpacity style={styles.button} onPress={handlers.toggleMute}>
					<Text style={styles.btn_text}>Mic {state.isMuted ? '⛔' : '🟢'}</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.button} onPress={handlers.switchCamera}>
					<Text style={styles.btn_text}>Cam 🔄</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.button} onPress={handlers.toggleCamera}>
					<Text style={styles.btn_text}>
						Cam {state.isOffCam ? '⛔' : '🟢'}
					</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.button} onPress={handlers.hangUp}>
					<Text style={styles.btn_text}>❌</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	)
}
const styles = StyleSheet.create({
	status: {
		fontSize: 20,
		fontWeight: '500',
	},
	control: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		marginTop: 8,
	},
	remoteStream: {
		height: '40%',
		width: '100%',
		marginTop: 8,
	},
	localStream: {
		position: 'absolute',
		width: 32 * 4,
		height: 36 * 4,
		right: 24,
		bottom: 80,
	},
	container: {
		flex: 1,
		justifyContent: 'center',
		paddingHorizontal: 10,
	},
	button: {
		width: 60,
		height: 60,
		fontSize: 20,
		textAlign: 'center',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#555',
		borderRadius: 50,
	},
	btn_text: {
		fontSize: 20,
		textAlign: 'center',
		justifyContent: 'center',
		fontWeight: 'bold',
		color: 'white',
	},
})

export default call
