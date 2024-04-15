import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { socket } from '../../../lib/socket'

const index = () => {
	const { id } = useLocalSearchParams()
	const router = useRouter()
	const accept = async () => {
		socket.emit('call-accept', { index: id })
		router.push('/logined/' + id)
	}
	const reject = async () => {
		socket.emit('call-reject', { index: id })
		router.push('/waiting')
	}
	useEffect(() => {
		if (!socket.connected) {
			socket.connect()
		}
	}, [])
	return (
		<View style={styles.container}>
			<Text style={styles.title}>Incoming Call</Text>
			<TouchableOpacity style={styles.accept_btn} onPress={accept}>
				<Text style={styles.accept_text}>Accept</Text>
			</TouchableOpacity>
			<TouchableOpacity style={styles.reject_btn} onPress={reject}>
				<Text style={styles.reject_text}>Reject</Text>
			</TouchableOpacity>
		</View>
	)
}
const styles = StyleSheet.create({
	title: {
		marginBottom: 16,
		fontSize: 28,
		letterSpacing: 1,
		fontWeight: '600',
	},
	subtitle: {
		marginBottom: 10,
		fontSize: 24,
		fontWeight: '500',
	},
	or_text: {
		marginVertical: 40,
		fontSize: 36,
		fontWeight: '700',
		textDecorationLine: 'underline',
	},
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		padding: 20,
		textAlign: 'center',
		gap: 16,
	},

	accept_btn: {
		width: 200,
		height: 60,
		backgroundColor: 'green',
		paddingVertical: 8,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
	},
	reject_btn: {
		width: 200,
		height: 60,
		backgroundColor: 'red',
		paddingVertical: 8,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
	},
	accept_text: {
		fontSize: 32,
		fontWeight: '700',
		color: 'white',
	},
	reject_text: {
		fontSize: 32,
		fontWeight: '700',
		color: 'white',
	},
	btn_text: {
		color: 'white',
		fontSize: 32,
		textAlign: 'center',
		fontWeight: '700',
		letterSpacing: 1,
	},
})
export default index
