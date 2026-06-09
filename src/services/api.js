// FILE: src/services/api.js

import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Interceptor REQUEST - otomatis tambahkan token di setiap request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Interceptor RESPONSE - tangani error global
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status

    if (status === 401) {
      // Token expired atau tidak valid — paksa logout
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }

    if (status === 403) {
      // Tidak punya akses — arahkan ke halaman utama
      // Tidak logout karena token masih valid, hanya haknya tidak cukup
      window.location.href = '/'
    }

    return Promise.reject(error)
  }
)

export default api