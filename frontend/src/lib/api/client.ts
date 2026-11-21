import axios from 'axios'

const apiBaseUrl = (process.env.NEXT_PUBLIC_TICKETIA_API_URL || 'http://127.0.0.1:8080').replace(/\/$/, '')

export const api = axios.create({ baseURL: apiBaseUrl })
