import { defineStore } from 'pinia'
import api from '../services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token:      localStorage.getItem('token')                        || null,
    user:       JSON.parse(localStorage.getItem('user') || 'null')  || null,
    activeRole: localStorage.getItem('activeRole')                   || null,
  }),

  getters: {
    isLoggedIn:  (state) => !!state.token,
    userName:    (state) => state.user?.nama || '',
    currentRole: (state) => state.activeRole,
  },

  actions: {
    async login(email, password) {
      const response = await api.post('/login', { email, password })
      const { token, user } = response.data

      // Default role = role pertama yang dimiliki user
      const defaultRole = user.roles?.[0]?.name || null

      this.token      = token
      this.user       = user
      this.activeRole = defaultRole

      localStorage.setItem('token',      token)
      localStorage.setItem('user',       JSON.stringify(user))
      localStorage.setItem('activeRole', defaultRole || '')

      return user
    },

    setActiveRole(roleName) {
      this.activeRole = roleName
      localStorage.setItem('activeRole', roleName)
    },

    // Refresh data user dari /me (dipanggil setelah update profil)
    async refreshUser() {
      try {
        const res = await api.get('/me')
        const user = res.data.user
        this.user = user
        localStorage.setItem('user', JSON.stringify(user))
      } catch {}
    },

    logout() {
      this.token      = null
      this.user       = null
      this.activeRole = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('activeRole')
    }
  }
})