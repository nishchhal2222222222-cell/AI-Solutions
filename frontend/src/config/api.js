import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
})

const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null
if (token) {
  API.defaults.headers.common.Authorization = `Bearer ${token}`
}

export default API
