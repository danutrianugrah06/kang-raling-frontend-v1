import api from '@/services/api.js'

export default {
  data() {
    return {
      // Data Utama
      dataList: [],
      dataFilter: [],
      loading: true,
      loadingSubmit: false,
      loadingHapus: false,
      
      // Search
      keyword: '',

      // Modal Form
      showModalForm: false,
      modeEdit: false,
      form: { id: null, nama: '', deskripsi: '' },
      errors: { nama: '' },

      // Modal Hapus
      showModalHapus: false,
      modalHapus: { id: null, nama: '' },

      // Toast
      toasts: [],
      toastCounter: 0,
    }
  },

  mounted() {
    this.fetchData()
  },

  methods: {
    // ==========================================
    // FETCH DATA
    // ==========================================
    async fetchData() {
      this.loading = true
      try {
        const res = await api.get('/jenis-sampah')
        this.dataList = res.data.data || res.data
        this.filterData()
      } catch {
        this.showToast('Gagal memuat data jenis sampah.', 'error')
      } finally {
        this.loading = false
      }
    },

    filterData() {
      const kw = this.keyword.toLowerCase().trim()
      if (!kw) {
        this.dataFilter = [...this.dataList]
      } else {
        this.dataFilter = this.dataList.filter(
          (item) =>
            item.nama.toLowerCase().includes(kw) ||
            (item.deskripsi && item.deskripsi.toLowerCase().includes(kw))
        )
      }
    },

    // ==========================================
    // MODAL FORM
    // ==========================================
    bukaModalTambah() {
      this.modeEdit = false
      this.form = { id: null, nama: '', deskripsi: '' }
      this.errors = { nama: '' }
      this.showModalForm = true
    },

    bukaModalEdit(item) {
      this.modeEdit = true
      this.form = { id: item.id, nama: item.nama, deskripsi: item.deskripsi || '' }
      this.errors = { nama: '' }
      this.showModalForm = true
    },

    tutupModalForm() {
      this.showModalForm = false
    },

    async simpanData() {
      this.errors = { nama: '' }

      if (!this.form.nama.trim()) {
        this.errors.nama = 'Nama jenis sampah wajib diisi.'
        return
      }

      this.loadingSubmit = true
      try {
        const payload = {
          nama: this.form.nama.trim(),
          deskripsi: this.form.deskripsi.trim(),
        }

        if (this.modeEdit) {
          await api.put(`/jenis-sampah/${this.form.id}`, payload)
          this.showToast('Jenis sampah berhasil diperbarui.', 'success')
        } else {
          await api.post('/jenis-sampah', payload)
          this.showToast('Jenis sampah berhasil ditambahkan.', 'success')
        }

        this.tutupModalForm()
        this.fetchData()
      } catch (err) {
        if (err.response?.status === 422) {
          const e = err.response.data.errors || {}
          this.errors = Object.fromEntries(Object.entries(e).map(([k, v]) => [k, v[0]]))
          this.showToast('Periksa kembali isian form.', 'error')
        } else {
          this.showToast('Terjadi kesalahan. Coba lagi.', 'error')
        }
      } finally {
        this.loadingSubmit = false
      }
    },

    // ==========================================
    // MODAL HAPUS
    // ==========================================
    konfirmasiHapus(item) {
      this.modalHapus = { id: item.id, nama: item.nama }
      this.showModalHapus = true
    },

    tutupModalHapus() {
      this.showModalHapus = false
      this.modalHapus = { id: null, nama: '' }
    },

    async hapusData() {
      this.loadingHapus = true
      try {
        await api.delete(`/jenis-sampah/${this.modalHapus.id}`)
        this.showToast('Jenis sampah berhasil dihapus.', 'success')
        this.tutupModalHapus()
        this.fetchData()
      } catch {
        this.showToast('Gagal menghapus data. Pastikan data ini tidak sedang digunakan.', 'error')
      } finally {
        this.loadingHapus = false
      }
    },

    // ==========================================
    // HELPER (TOAST)
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
    }
  },
}