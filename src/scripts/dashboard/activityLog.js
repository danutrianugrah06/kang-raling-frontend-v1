import api from '@/services/api.js'

export default {
  data() {
    return {
      loading: true,
      logs: [],
      
      // Pagination & Search
      currentPage: 1,
      totalPages: 1,
      perPage: 15,
      searchQuery: '',
      searchTimer: null,

      // Toast
      toasts: [],
      toastCounter: 0,
    }
  },

  async mounted() {
    await this.fetchLogs()
  },

  methods: {
    // ==========================================
    // FETCH DATA
    // ==========================================
    async fetchLogs(page = 1) {
      this.loading = true
      try {
        const params = { page, per_page: this.perPage }
        if (this.searchQuery) params.search = this.searchQuery
        
        const res = await api.get('/activity-logs', { params })
        this.logs = res.data.data
        this.currentPage = res.data.current_page
        this.totalPages = res.data.last_page
      } catch {
        this.showToast('Gagal memuat log aktivitas.', 'error')
      } finally {
        this.loading = false
      }
    },

    onSearch() {
      clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => {
        this.fetchLogs(1)
      }, 400)
    },

    clearSearch() {
      this.searchQuery = ''
      this.fetchLogs(1)
    },

    goToPage(page) {
      if (page < 1 || page > this.totalPages) return
      this.fetchLogs(page)
    },

    // ==========================================
    // HELPERS
    // ==========================================
    formatDate(dateStr) {
      if (!dateStr) return '-'
      return new Date(dateStr).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    },

    // Mapping action dari database ke label yang ramah pengguna
    getActionLabel(action) {
      const map = {
        login: 'Login',
        logout: 'Logout',
        create_data_sampah: 'Tambah Data Sampah',
        update_data_sampah: 'Edit Data Sampah',
        delete_data_sampah: 'Hapus Data Sampah',
        verify_data_sampah: 'Verifikasi Data Sampah',
        reject_data_sampah: 'Tolak Data Sampah',
        create_pengelolaan: 'Tambah Pengelolaan',
        update_pengelolaan: 'Edit Pengelolaan',
        delete_pengelolaan: 'Hapus Pengelolaan',
      }
      return map[action] || action
    },

    showToast(message, type = 'info') {
      const id = ++this.toastCounter
      this.toasts.push({ id, message, type })
      setTimeout(() => {
        this.toasts = this.toasts.filter(t => t.id !== id)
      }, 3500)
    },
  },
}