import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

export const useUserStore = create<
	State & Actions,
	[['zustand/persist', never], ['zustand/immer', never]]
>(
	persist(
		immer(set => ({
			user: null,
			setUser: data =>
				set(state => {
					state.user = data
				}),
		})),
		{
			name: 'user',
			storage: createJSONStorage(() => AsyncStorage),
		}
	)
)

type State = {
	user: User | null
}

type Actions = {
	setUser: (data: User | null) => void
}
type User = {
	_id: string
	login: string
	expoPushToken: string
	index: string
}
