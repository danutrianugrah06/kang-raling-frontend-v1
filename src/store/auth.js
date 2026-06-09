import { defineStore } from 'pinia'
import api from '../services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'administrator',
    isFasilitator: (state) => state.user?.role === 'fasilitator',
    userName: (state) => state.user?.name || ''
  },

  actions: {
    async login(email, password) {
      const response = await api.post('/login', { email, password })
      const { token, user } = response.data

      // Simpan ke state
      this.token = token
      this.user = user

      // Simpan ke localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      return user
    },

    async logout() {
      try {
        await api.post('/logout')
      } catch (e) {
        // Tetap logout meski request gagal
      } finally {
        this.token = null
        this.user = null
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
  }
})