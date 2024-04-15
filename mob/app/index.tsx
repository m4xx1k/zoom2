import Constants from 'expo-constants'
import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import { useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import {
	Alert,
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'
import { api } from '../lib/api'
// import { socket } from '../lib/socket'
import { useUserStore } from '../store/user.store'
Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: false,
		shouldSetBadge: false,
	}),
})

export default function App() {
	const [expoPushToken, setExpoPushToken] = useState('')
	const router = useRouter()
	const notificationListener = useRef<Notifications.Subscription | undefined>()
	const responseListener = useRef<Notifications.Subscription | undefined>()

	useEffect(() => {
		registerForPushNotificationsAsync().then(token => setExpoPushToken(token))

		notificationListener.current =
			Notifications.addNotificationReceivedListener(notification => {
				console.log(notification)
			})

		responseListener.current =
			Notifications.addNotificationResponseReceivedListener(response => {
				console.log(response)
			})

		return () => {
			Notifications.removeNotificationSubscription(notificationListener.current)
			Notifications.removeNotificationSubscription(responseListener.current)
		}
	}, [])
	const [login, setLogin] = useState('')
	const [password, setPassword] = useState('')
	const { setUser } = useUserStore()

	const signIn = async () => {
		try {
			const res = await api.post('/user/sign-in', {
				login: login,
				password,
				expoPushToken,
			})
			setUser(res.data)
			router.push('/waiting')
		} catch (e) {
			console.log(e)
			Alert.alert('Error', 'Incorrect login or password')
		}
	}
	const signUp = async () => {
		try {
			console.log(login, password, expoPushToken)
			const res = await api.post('/user/sign-up', {
				login: login,
				password,
				expoPushToken,
			})
			setUser(res.data)
			router.push('/waiting')
		} catch (e) {
			console.log(e)
			Alert.alert('Error', 'Incorrect login or password')
		}
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Welcome</Text>
			<KeyboardAvoidingView style={styles.form} behavior='padding'>
				<TextInput
					value={login}
					onChangeText={setLogin}
					placeholder='Login'
					style={styles.input}
					autoCapitalize='none'
				/>
				<TextInput
					value={password}
					onChangeText={setPassword}
					placeholder='Password'
					style={styles.input}
					secureTextEntry={true}
					autoCapitalize='none'
				/>

				<View style={styles.authButtonsGroup}>
					<TouchableOpacity onPress={signIn}>
						<Text style={styles.button}>Sign In</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={signUp}>
						<Text style={styles.button}>Sign Up</Text>
					</TouchableOpacity>
				</View>
			</KeyboardAvoidingView>
		</View>
	)
}
const styles = StyleSheet.create({
	form: {
		flexDirection: 'column',
		gap: 8,
	},
	authButtonsGroup: {
		flexDirection: 'column',
		gap: 4,
	},
	container: {
		marginHorizontal: 32,
		flex: 1,
		justifyContent: 'center',
	},
	title: {
		fontSize: 32,
		fontWeight: 'bold',
		marginBottom: 24,
		textAlign: 'center',
	},
	input: {
		padding: 10,
		borderWidth: 1,
		borderColor: 'black',
		borderRadius: 5,
	},
	button: {
		backgroundColor: '#0ea5e9',
		color: '#fafafa',
		width: '100%',
		paddingVertical: 12,
		borderRadius: 8,
		fontSize: 20,
		textAlign: 'center',
	},
})
async function sendPushNotification(expoPushToken) {
	const message = {
		to: expoPushToken,
		sound: 'default',
		title: 'Original Title',
		body: 'And here is the body!',
		data: { someData: 'goes here' },
	}

	await fetch('https://exp.host/--/api/v2/push/send', {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Accept-encoding': 'gzip, deflate',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(message),
	})
}

async function registerForPushNotificationsAsync() {
	let token

	if (Platform.OS === 'android') {
		Notifications.setNotificationChannelAsync('default', {
			name: 'default',
			importance: Notifications.AndroidImportance.MAX,
			vibrationPattern: [0, 250, 250, 250],
			lightColor: '#FF231F7C',
		})
	}

	if (Device.isDevice) {
		const { status: existingStatus } = await Notifications.getPermissionsAsync()
		let finalStatus = existingStatus
		if (existingStatus !== 'granted') {
			const { status } = await Notifications.requestPermissionsAsync()
			finalStatus = status
		}
		if (finalStatus !== 'granted') {
			alert('Failed to get push token for push notification!')
			return
		}
		token = await Notifications.getExpoPushTokenAsync({
			projectId: Constants.expoConfig.extra.eas.projectId,
		})
		console.log(token)
	} else {
		alert('Must use physical device for Push Notifications')
	}

	return token.data
}
