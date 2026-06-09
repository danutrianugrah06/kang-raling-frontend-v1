import api from '@/services/api.js'

export default {
  data() {
    return {
      loading: true,
      users: [],
      
      // Pagination & Search
      currentPage: 1,
      totalPages: 1,
      perPage: 10,
      searchQuery: '',
      filterRole: '',
      searchTimer: null,

      // Modal Tambah/Edit
      showModal: false,
      editMode: false,
      savingModal: false,
      showPwModal: false,
      formModal: { id: null, nama: '', email: '', role: '', password: '' },
      formErrors: {},

      // Modal Delete
      showDeleteModal: false,
      deleteTarget: null,
      deleting: false,

      // Toast
      toasts: [],
      toastCounter: 0,
    }
  },

  async mounted() {
    await this.fetchUsers()
  },

  methods: {
    // ==========================================
    // FETCH DATA
    // ==========================================
    async fetchUsers(page = 1) {
      this.loading = true
      try {
        const params = { page, per_page: this.perPage }
        if (this.searchQuery) params.search = this.searchQuery
        if (this.filterRole) params.role = this.filterRole
        
        const res = await api.get('/users', { params })
        this.users = res.data.data
        this.currentPage = res.data.current_page
        this.totalPages = res.data.last_page
      } catch {
        this.showToast('Gagal memuat data user.', 'error')
      } finally {
        this.loading = false
      }
    },

    onSearch() {
      clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => {
        this.fetchUsers(1)
      }, 400)
    },

    clearSearch() {
      this.searchQuery = ''
      this.fetchUsers(1)
    },

    goToPage(page) {
      if (page < 1 || page > this.totalPages) return
      this.fetchUsers(page)
    },

    // ==========================================
    // TOGGLE STATUS AKTIF/NONAKTIF
    // ==========================================
    async toggleStatus(user) {
      try {
        await api.patch(`/users/${user.id}/toggle-active`)
        user.is_active = !user.is_active
        this.showToast(`Status user ${user.nama} berhasil diperbarui.`, 'success')
      } catch {
        this.showToast('Gagal memperbarui status user.', 'error')
        this.fetchUsers(this.currentPage)
      }
    },

    // ==========================================
    // MODAL FORM (TAMBAH / EDIT PASSWORD)
    // ==========================================
    openAddModal() {
      this.editMode = false
      this.formModal = { id: null, nama: '', email: '', role: '', password: '' }
      this.formErrors = {}
      this.showPwModal = false
      this.showModal = true
    },

    openEditModal(user) {
      this.editMode = true
      this.formModal = { id: user.id, nama: user.nama, email: user.email, role: user.role, password: '' }
      this.formErrors = {}
      this.showPwModal = false
      this.showModal = true
    },

    closeModal() {
      this.showModal = false
    },

    async submitModal() {
      this.formErrors = {}
      this.savingModal = true
      try {
        if (this.editMode) {
          if (!this.formModal.password || this.formModal.password.length < 8) {
            this.formErrors.password = ['Password baru minimal 8 karakter.']
            this.savingModal = false
            return
          }
          await api.put(`/users/${this.formModal.id}`, {
            nama: this.formModal.nama,
            email: this.formModal.email,
            role: this.formModal.role,
            password: this.formModal.password,
          })
          this.showToast('Password user berhasil diubah.', 'success')
        } else {
          await api.post('/users', {
            nama: this.formModal.nama,
            email: this.formModal.email,
            role: this.formModal.role,
            password: this.formModal.password,
          })
          this.showToast('User baru berhasil ditambahkan.', 'success')
        }
        this.closeModal()
        await this.fetchUsers(this.currentPage)
      } catch (err) {
        if (err.response?.status === 422) {
          this.formErrors = err.response.data.errors || {}
          this.showToast('Periksa kembali data yang diisi.', 'error')
        } else {
          this.showToast('Terjadi kesalahan. Coba lagi.', 'error')
        }
      } finally {
        this.savingModal = false
      }
    },

    // ==========================================
    // MODAL HAPUS
    // ==========================================
    confirmDelete(user) {
      this.deleteTarget = user
      this.showDeleteModal = true
    },

    async deleteUser() {
      if (!this.deleteTarget) return
      this.deleting = true
      try {
        await api.delete(`/users/${this.deleteTarget.id}`)
        this.showToast(`Akun user berhasil dihapus.`, 'success')
        this.showDeleteModal = false
        this.deleteTarget = null
        
        if (this.users.length === 1 && this.currentPage > 1) {
          this.currentPage--
        }
        await this.fetchUsers(this.currentPage)
      } catch {
        this.showToast('Gagal menghapus user.', 'error')
      } finally {
        this.deleting = false
      }
    },

    // ==========================================
    // TOAST HELPER
    // ==========================================
    showToast(message, type = 'success') {
      const id = ++this.toastCounter
      this.toasts.push({ id, message, type })
      setTimeout(() => {
        this.toasts = this.toasts.filter(t => t.id !== id)
      }, 3500)
    },
  },
}