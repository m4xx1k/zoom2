import axios from 'axios'
export const BASE_URL = 'https://xvhfmgqp-5000.euw.devtunnels.ms/api'

export const api = axios.create({
	baseURL: BASE_URL,
})
