import api from '@/services/api.js'

export default {
  data() {
    return {
      loadingProfile: true,
      savingProfile: false,
      savingPassword: false,
      showPasswordBaru: false,
      showKonfirmasi: false,

      profile: { nama: '', email: '', role: '' },
      formProfile: { nama: '', email: '' },
      formPassword: { password_baru: '', konfirmasi: '' },

      errors: {},

      toasts: [],
      toastCounter: 0,
    }
  },

  async mounted() {
    await this.loadProfile()
  },

  methods: {
    // ==========================================
    // LOAD PROFIL
    // ==========================================
    async loadProfile() {
      this.loadingProfile = true
      try {
        const res = await api.get('/me')
        // Normalisasi response: bisa langsung object user atau di dalam data/user
        const userData = res.data?.user || res.data?.data || res.data
        this.profile = userData
        this.formProfile.nama  = userData.nama  || ''
        this.formProfile.email = userData.email || ''
      } catch {
        this.showToast('Gagal memuat data profil.', 'error')
      } finally {
        this.loadingProfile = false
      }
    },

    // ==========================================
    // UPDATE PROFIL
    // ==========================================
    async updateProfile() {
      this.errors = {}

      if (!this.formProfile.nama?.trim()) {
        this.errors.nama = ['Nama lengkap wajib diisi.']
        return
      }
      if (!this.formProfile.email?.trim()) {
        this.errors.email = ['Email wajib diisi.']
        return
      }

      this.savingProfile = true
      try {
        const payload = {
          nama:  this.formProfile.nama.trim(),
          email: this.formProfile.email.trim(),
        }
        const res = await api.patch('/me/update-profile', payload)

        // Update state dengan data terbaru
        const updated = res.data?.user || res.data?.data || res.data
        if (updated?.nama)  this.profile.nama  = updated.nama
        if (updated?.email) this.profile.email = updated.email
        if (!updated?.nama && !updated?.email) {
          this.profile.nama  = this.formProfile.nama
          this.profile.email = this.formProfile.email
        }

        // Update localStorage agar sidebar & topbar ikut berubah
        const stored = JSON.parse(localStorage.getItem('user') || '{}')
        stored.nama  = this.profile.nama
        stored.email = this.profile.email
        localStorage.setItem('user', JSON.stringify(stored))

        this.showToast('Profil berhasil diperbarui.', 'success')
      } catch (err) {
        if (err.response?.status === 422) {
          this.errors = err.response.data.errors || {}
          this.showToast('Periksa kembali data yang diisi.', 'error')
        } else if (err.response?.status === 401) {
          this.showToast('Sesi berakhir. Silakan login kembali.', 'error')
        } else {
          const msg = err.response?.data?.message || 'Gagal memperbarui profil. Coba lagi.'
          this.showToast(msg, 'error')
        }
      } finally {
        this.savingProfile = false
      }
    },

    // ==========================================
    // UPDATE PASSWORD
    // ==========================================
    async updatePassword() {
      this.errors = {}

      // Validasi client-side
      if (!this.formPassword.password_baru) {
        this.errors.password_baru = ['Password baru wajib diisi.']
        return
      }
      if (this.formPassword.password_baru.length < 8) {
        this.errors.password_baru = ['Password minimal 8 karakter.']
        return
      }
      if (this.formPassword.password_baru !== this.formPassword.konfirmasi) {
        this.errors.konfirmasi = ['Konfirmasi password tidak cocok.']
        return
      }

      this.savingPassword = true
      try {
        const payload = {
          password:              this.formPassword.password_baru,
          password_confirmation: this.formPassword.konfirmasi,
        }
        await api.patch('/me/update-password', payload)

        // Reset form setelah berhasil
        this.formPassword.password_baru = ''
        this.formPassword.konfirmasi    = ''
        this.showPasswordBaru = false
        this.showKonfirmasi   = false

        this.showToast('Password berhasil diubah.', 'success')
      } catch (err) {
        if (err.response?.status === 422) {
          this.errors = err.response.data.errors || {}
          this.showToast('Periksa kembali data yang diisi.', 'error')
        } else if (err.response?.status === 401) {
          this.showToast('Sesi berakhir. Silakan login kembali.', 'error')
        } else {
          const msg = err.response?.data?.message || 'Gagal mengubah password. Coba lagi.'
          this.showToast(msg, 'error')
        }
      } finally {
        this.savingPassword = false
      }
    },

    // ==========================================
    // HELPER TOAST
    // ==========================================
    showToast(message, type = 'info') {
      const id = ++this.toastCounter
      this.toasts.push({ id, message, type })
      setTimeout(() => {
        this.toasts = this.toasts.filter(t => t.id !== id)
      }, 3500)
    },

    toastIcon(type) {
      const map = {
        success: 'bi-check-circle-fill',
        error:   'bi-x-circle-fill',
        info:    'bi-info-circle-fill',
      }
      return map[type] || 'bi-info-circle-fill'
    },
  },
}