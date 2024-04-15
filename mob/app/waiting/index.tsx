import { useRouter } from 'expo-router'
import React, { useEffect } from 'react'
import {
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'
import { api } from '../../lib/api'
import { socket } from '../../lib/socket'
import { useUserStore } from '../../store/user.store'

const NewCall = () => {
	const [calleeIndex, setCalleeIndex] = React.useState('')
	const { user } = useUserStore()
	const router = useRouter()
	const handleCreateCall = async () => {
		// await initLocalStreams()
		socket.emit('call-create', { from: user._id, to: calleeIndex })
		router.push('/logined/' + 'caller')
	}
	useEffect(() => {
		if (!socket.connected) {
			socket.connect()
		}
		const timeout = setInterval(() => {
			api.get('/call/latest-call/' + user._id).then(res => {
				if (res.data) {
					router.push('/request-call/' + res.data.callIndex)
				}
			})
		}, 5000)
		return () => clearInterval(timeout)
	}, [])
	return (
		<View style={styles.container}>
			<Text style={styles.title}>Wait for new incoming call</Text>
			<Text style={styles.subtitle}>Yours callee index: {user.index}</Text>
			<Text style={styles.or_text}>OR</Text>
			<Text style={styles.title}>Create new call</Text>
			<View style={styles.callee_form}>
				<TextInput
					style={styles.input}
					value={calleeIndex}
					onChangeText={setCalleeIndex}
					placeholder='Enter callee index'
				/>
				<TouchableOpacity style={styles.button} onPress={handleCreateCall}>
					<Text style={styles.btn_text}>Call</Text>
				</TouchableOpacity>
			</View>
		</View>
	)
}
const styles = StyleSheet.create({
	title: {
		marginBottom: 16,
		fontSize: 28,
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
	},
	text: {
		marginBottom: 10,
		fontSize: 16,
	},
	callee_form: {
		flexDirection: 'row',
		gap: 4,
		height: 60,
	},
	input: {
		width: '70%',
		height: 60,
		borderColor: 'gray',
		borderWidth: 1,
		marginBottom: 10,
		paddingHorizontal: 10,
		fontSize: 20,
	},
	button: {
		backgroundColor: 'blue',
		borderRadius: 5,
		alignItems: 'center',
		justifyContent: 'center',
		width: '30%',
	},
	btn_text: {
		color: 'white',
		fontSize: 32,
		textAlign: 'center',
		fontWeight: '700',
		letterSpacing: 1,
	},
})
export default NewCall
