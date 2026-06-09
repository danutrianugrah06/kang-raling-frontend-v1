import api from '@/services/api.js'

export default {
  data() {
    return {
      isAdmin: false,
      dataList: [],
      desasList: [],
      jenisSampahList: [],
      
      loading: true,
      loadingSubmit: false,
      loadingHapus: false,
      
      currentPage: 1,
      lastPage: 1,
      total: 0,
      perPage: 10,
      searchQuery: '',
      searchTimeout: null,

      showModalForm: false,
      modeEdit: false,
      form: {
        id: null,
        desa_id: '',
        tanggal: '',
        status: '',
        catatan_penolakan: '',
        items: [
          { jenis_sampah_id: '', jumlah: '' },
          { jenis_sampah_id: '', jumlah: '' },
          { jenis_sampah_id: '', jumlah: '' }
        ]
      },
      errors: {},

      showModalVerifikasi: false,
      itemVerifikasi: null,
      formVerifikasi: {
        status: 'disetujui',
        catatan_penolakan: ''
      },

      panelDitolakTerbuka: true,
      showModalHapus: false,
      modalHapusId: null,

      toasts: [],
      toastCounter: 0,
    }
  },

  computed: {
    pageNumbers() {
      const pages = []
      const start = Math.max(1, this.currentPage - 2)
      const end   = Math.min(this.lastPage, this.currentPage + 2)
      for (let i = start; i <= end; i++) pages.push(i)
      return pages
    },
    filteredData() {
      if (!this.searchQuery.trim()) return this.dataList
      const q = this.searchQuery.toLowerCase()
      return this.dataList.filter(item => 
        (item.desa?.nama_desa || '').toLowerCase().includes(q) ||
        (item.jenis_sampah?.nama || '').toLowerCase().includes(q) ||
        (item.status || '').toLowerCase().includes(q)
      )
    }
  },

  mounted() {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    this.isAdmin = user.role === 'administrator'
    this.fetchData()
    this.fetchDesas()
    this.fetchJenisSampah()
  },

  methods: {
    // Fetch data sampah dari API (dengan pagination)
    async fetchData() {
      this.loading = true
      try {
        const res = await api.get('/data-sampah', {
          params: { page: this.currentPage, per_page: this.perPage }
        })
        const d = res.data
        this.dataList = d.data || []
        this.currentPage = d.current_page || 1
        this.lastPage = d.last_page || 1
        this.total = d.total || 0
      } catch {
        this.showToast('Gagal memuat data sampah.', 'error')
      } finally {
        this.loading = false
      }
    },

    async fetchDesas() {
      try {
        const res = await api.get('/desas')
        this.desasList = res.data.data || res.data
      } catch (e) {}
    },

    async fetchJenisSampah() {
      try {
        const res = await api.get('/jenis-sampah')
        this.jenisSampahList = res.data.data || res.data
      } catch (e) {}
    },

    onSearch() {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.currentPage = 1
        this.fetchData()
      }, 400)
    },

    goToPage(page) {
      if (page < 1 || page > this.lastPage) return
      this.currentPage = page
      this.fetchData()
    },

    // Buka modal tambah data (3 baris kosong)
    bukaModalTambah() {
      this.modeEdit = false
      this.form = {
        id: null,
        desa_id: '',
        tanggal: new Date().toISOString().split('T')[0],
        status: '',
        catatan_penolakan: '',
        items: [
          { jenis_sampah_id: '', jumlah: '' },
          { jenis_sampah_id: '', jumlah: '' },
          { jenis_sampah_id: '', jumlah: '' }
        ]
      }
      this.errors = {}
      this.showModalForm = true
    },

    bukaModalEdit(item) {
      this.modeEdit = true
      this.form = {
        id: item.id,
        desa_id: item.desa_id,
        tanggal: item.tanggal ? item.tanggal.split(' ')[0] : '',
        status: item.status || 'menunggu',
        catatan_penolakan: item.catatan_penolakan || '',
        items: [
          { jenis_sampah_id: item.jenis_sampah_id, jumlah: item.jumlah }
        ]
      }
      this.errors = {}
      this.showModalForm = true
    },

    tutupModalForm() { this.showModalForm = false },

    tambahBarisSampah() {
      this.form.items.push({ jenis_sampah_id: '', jumlah: '' })
    },

    hapusBarisSampah(index) {
      if (this.form.items.length > 1) this.form.items.splice(index, 1)
    },

    async simpanData() {
      this.errors = {}
      let hasError = false

      if (!this.form.desa_id) { this.errors.desa_id = 'Desa wajib dipilih.'; hasError = true }
      if (!this.form.tanggal) { this.errors.tanggal = 'Tanggal wajib diisi.'; hasError = true }
      
      const validItems = this.form.items.filter(i => i.jenis_sampah_id && i.jumlah)
      if (validItems.length === 0) { this.errors.items = 'Minimal satu jenis sampah dan jumlah harus diisi.'; hasError = true }

      if (hasError) return

      this.loadingSubmit = true
      try {
        if (this.modeEdit) {
          const payload = {
            desa_id: this.form.desa_id,
            tanggal: this.form.tanggal,
            jenis_sampah_id: validItems[0].jenis_sampah_id,
            jumlah: validItems[0].jumlah,
            status: 'menunggu'
          }
          await api.put(`/data-sampah/${this.form.id}`, payload)
        } else {
          for (let item of validItems) {
            const payload = {
              desa_id: this.form.desa_id,
              tanggal: this.form.tanggal,
              jenis_sampah_id: item.jenis_sampah_id,
              jumlah: item.jumlah
            }
            await api.post('/data-sampah', payload)
          }
        }
        this.showToast(this.modeEdit ? 'Data berhasil diperbarui.' : 'Entri data sampah berhasil ditambahkan.', 'success')
        this.tutupModalForm()
        this.fetchData()
      } catch {
        this.showToast('Terjadi kesalahan. Coba lagi.', 'error')
      } finally {
        this.loadingSubmit = false
      }
    },

    // Verifikasi (Admin)
    bukaModalVerifikasi(item) {
      this.itemVerifikasi = item
      this.formVerifikasi = { status: 'disetujui', catatan_penolakan: '' }
      this.errors = {}
      this.showModalVerifikasi = true
    },
    tutupModalVerifikasi() {
      this.showModalVerifikasi = false
      this.itemVerifikasi = null
    },
    async submitVerifikasi() {
      this.errors = {}
      if (this.formVerifikasi.status === 'ditolak' && !this.formVerifikasi.catatan_penolakan.trim()) {
        this.errors.catatan_penolakan = 'Catatan penolakan wajib diisi jika menolak data.'
        return
      }
      this.loadingSubmit = true
      try {
        const payload = {
          desa_id: this.itemVerifikasi.desa_id,
          tanggal: this.itemVerifikasi.tanggal,
          jenis_sampah_id: this.itemVerifikasi.jenis_sampah_id,
          jumlah: this.itemVerifikasi.jumlah,
          status: this.formVerifikasi.status,
          catatan_penolakan: this.formVerifikasi.status === 'ditolak' ? this.formVerifikasi.catatan_penolakan : ''
        }
        await api.put(`/data-sampah/${this.itemVerifikasi.id}`, payload)
        this.showToast('Verifikasi data berhasil diproses.', 'success')
        this.tutupModalVerifikasi()
        this.fetchData()
      } catch {
        this.showToast('Gagal memproses verifikasi.', 'error')
      } finally {
        this.loadingSubmit = false
      }
    },

    // Hapus
    konfirmasiHapus(item) {
      this.modalHapusId = item.id
      this.showModalHapus = true
    },
    tutupModalHapus() {
      this.showModalHapus = false
      this.modalHapusId = null
    },
    async hapusData() {
      this.loadingHapus = true
      try {
        await api.delete(`/data-sampah/${this.modalHapusId}`)
        this.showToast('Data berhasil dihapus.', 'success')
        this.tutupModalHapus()
        this.fetchData()
      } catch {
        this.showToast('Gagal menghapus data.', 'error')
      } finally {
        this.loadingHapus = false
      }
    },

    // Helper format
    formatTanggal(val) {
      if (!val) return '-'
      return new Date(val).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
    },
    formatAngka(n) {
      if (!n && n !== 0) return '0'
      return Number(n).toLocaleString('id-ID')
    },
    capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1)
    },
    badgeStatus(status) {
      if (status === 'disetujui') return 'ds-badge-success'
      if (status === 'ditolak') return 'ds-badge-danger'
      return 'ds-badge-warning'
    },
    iconStatus(status) {
      if (status === 'disetujui') return 'bi-check-circle-fill'
      if (status === 'ditolak') return 'bi-x-circle-fill'
      return 'bi-clock-fill'
    },

    showToast(message, type = 'info') {
      const id = ++this.toastCounter
      this.toasts.push({ id, message, type })
      setTimeout(() => this.toasts = this.toasts.filter(t => t.id !== id), 3500)
    },
    toastIcon(type) {
      const map = { success: 'bi-check-circle-fill', error: 'bi-x-circle-fill', info: 'bi-info-circle-fill' }
      return map[type] || 'bi-info-circle-fill'
    }
  }
}