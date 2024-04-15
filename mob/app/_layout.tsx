import { Stack } from 'expo-router'
const StackLayout = () => {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
			}}
		/>
	)
}
export default function HomeLayout() {
	return <StackLayout />
}
