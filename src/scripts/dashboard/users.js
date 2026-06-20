import api from '@/services/api.js'

export default {
  name: 'ManajemenUser',

  data() {
    return {
      loading: true,
      users: [],
      availableRoles: [],

      currentPage: 1,
      totalPages: 1,
      perPage: 10,
      searchQuery: '',
      filterRole: '',
      searchTimer: null,

      showModal: false,
      editMode: false,
      savingModal: false,
      showPwModal: false,
      formModal: { id: null, nama: '', email: '', roles: [''], password: '' },
      formErrors: {},

      showDeleteModal: false,
      deleteTarget: null,
      deleting: false,

      toasts: [],
      toastCounter: 0,
    }
  },

  async mounted() {
    await this.fetchAvailableRoles()
    await this.fetchUsers()
  },

  methods: {
    async fetchAvailableRoles() {
      try {
        const res = await api.get('/roles')
        this.availableRoles = res.data.data
      } catch {
        this.showToast('Gagal memuat daftar role.', 'error')
      }
    },

    async fetchUsers(page = 1) {
      this.loading = true
      try {
        const params = { page, per_page: this.perPage }
        if (this.searchQuery) params.search = this.searchQuery
        if (this.filterRole)  params.role   = this.filterRole
        const res = await api.get('/users', { params })
        this.users       = res.data.data
        this.currentPage = res.data.current_page
        this.totalPages  = res.data.last_page
      } catch {
        this.showToast('Gagal memuat data user.', 'error')
      } finally {
        this.loading = false
      }
    },

    getRoleBadgeClass(roleName) {
      const map = {
        'Administrator':       'us-role-admin',
        'Fasilitator':         'us-role-fasil',
        'Pimpinan':            'us-role-pimpinan',
        'Developer Eksternal': 'us-role-dev',
      }
      return map[roleName] ?? 'us-role-custom'
    },

    isRoleDisabled(roleName, currentIndex) {
      return this.formModal.roles.some((r, idx) => idx !== currentIndex && r === roleName)
    },

    onSearch() {
      clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => { this.fetchUsers(1) }, 400)
    },

    clearSearch() {
      this.searchQuery = ''
      this.fetchUsers(1)
    },

    goToPage(page) {
      if (page < 1 || page > this.totalPages) return
      this.fetchUsers(page)
    },

    addRoleField() {
      this.formModal.roles.push('')
    },

    removeRoleField(index) {
      this.formModal.roles.splice(index, 1)
    },

    openAddModal() {
      this.editMode  = false
      this.formModal = { id: null, nama: '', email: '', roles: [''], password: '' }
      this.formErrors = {}
      this.showPwModal = false
      this.showModal  = true
    },

    openEditModal(user) {
      this.editMode = true
      const userRoles = user.roles?.length > 0
        ? user.roles.map(r => r.name || r)
        : [user.role_utama || '']
      this.formModal   = { id: user.id, nama: user.nama, email: user.email, roles: [...userRoles], password: '' }
      this.formErrors  = {}
      this.showPwModal = false
      this.showModal   = true
    },

    closeModal() {
      this.showModal = false
    },

    async submitModal() {
      this.formErrors = {}
      let selectedRoles = [...new Set(this.formModal.roles.filter(r => r?.trim()))]
      if (selectedRoles.length === 0) {
        this.formErrors.roles = ['Pilih minimal satu role untuk user ini.']
        return
      }
      this.savingModal = true
      try {
        if (this.editMode) {
          if (this.formModal.password && this.formModal.password.length < 8) {
            this.formErrors.password = ['Password baru minimal 8 karakter.']
            return
          }
          await api.put(`/users/${this.formModal.id}`, {
            nama:     this.formModal.nama,
            email:    this.formModal.email,
            roles:    selectedRoles,
            password: this.formModal.password || null,
          })
          this.showToast('Data & Role user berhasil diperbarui.', 'success')
        } else {
          await api.post('/users', {
            nama:     this.formModal.nama,
            email:    this.formModal.email,
            roles:    selectedRoles,
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

    confirmDelete(user) {
      this.deleteTarget    = user
      this.showDeleteModal = true
    },

    async deleteUser() {
      if (!this.deleteTarget) return
      this.deleting = true
      try {
        await api.delete(`/users/${this.deleteTarget.id}`)
        this.showToast('Akun user berhasil dihapus.', 'success')
        this.showDeleteModal = false
        this.deleteTarget    = null
        if (this.users.length === 1 && this.currentPage > 1) this.currentPage--
        await this.fetchUsers(this.currentPage)
      } catch {
        this.showToast('Gagal menghapus user.', 'error')
      } finally {
        this.deleting = false
      }
    },

    showToast(message, type = 'success') {
      const id = ++this.toastCounter
      this.toasts.push({ id, message, type })
      setTimeout(() => { this.toasts = this.toasts.filter(t => t.id !== id) }, 3500)
    },
  },
}