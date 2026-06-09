import api from '@/services/api.js'

export default {
  data() {
    return {
      dataList: [],
      
      loading: true,
      loadingSubmit: false,
      loadingHapus: false,
      loadingDropdown: false,
      loadingJenisPengelolaan: false,
      
      // Pagination & Search
      currentPage: 1,
      lastPage: 1,
      total: 0,
      perPage: 10,
      searchQuery: '',

      // Dropdown Lists
      listDataSampah: [],
      listJenisPengelolaan: [],

      // Modal Form Tambah/Edit
      showModalForm: false,
      modeEdit: false,
      form: {
        id: null,
        data_sampah_id: '',
        jenis_pengelolaan_id: '',
        jumlah: '',
        keterangan: '',
      },
      errors: {},

      // Modal Hapus
      showModalHapus: false,
      modalHapusId: null,

      // Toast
      toasts: [],
      toastCounter: 0,
    }
  },

  computed: {
    // Nomor halaman yang ditampilkan (maksimal 2 di kiri/kanan halaman aktif)
    pageNumbers() {
      const pages = []
      const start = Math.max(1, this.currentPage - 2)
      const end   = Math.min(this.lastPage, this.currentPage + 2)
      for (let i = start; i <= end; i++) pages.push(i)
      return pages
    },
    // Filter lokal berdasarkan data yang di-fetch per halaman
    filteredData() {
      if (!this.searchQuery.trim()) return this.dataList
      const q = this.searchQuery.toLowerCase()
      return this.dataList.filter(item => {
        const desa = item.data_sampah?.desa?.nama_desa?.toLowerCase() || ''
        const jenisSampah = item.data_sampah?.jenis_sampah?.nama?.toLowerCase() || ''
        const jenisKelola = item.jenis_pengelolaan?.nama?.toLowerCase() || ''
        const ket = item.keterangan?.toLowerCase() || ''
        
        return desa.includes(q) || jenisSampah.includes(q) || jenisKelola.includes(q) || ket.includes(q)
      })
    }
  },

  mounted() {
    this.fetchData()
  },

  methods: {
    // ==========================================
    // FETCH DATA
    // ==========================================
    async fetchData(page = 1) {
      this.loading = true
      try {
        const res = await api.get('/data-pengelolaan', {
          params: { page: page, per_page: this.perPage }
        })
        const d = res.data
        this.dataList = d.data || []
        this.currentPage = d.current_page || 1
        this.lastPage = d.last_page || 1
        this.total = d.total || 0
      } catch {
        this.showToast('Gagal memuat data pengelolaan.', 'error')
      } finally {
        this.loading = false
      }
    },

    goToPage(page) {
      if (page < 1 || page > this.lastPage) return
      this.fetchData(page)
    },

    // ==========================================
    // FETCH DROPDOWNS
    // ==========================================
    async fetchDropdownDataSampah() {
      this.loadingDropdown = true
      try {
        const res = await api.get('/data-sampah', { params: { per_page: 999 } })
        const semua = res.data.data || res.data
        // Hanya data sampah dengan status 'verified' dan belum memiliki pengelolaan
        this.listDataSampah = semua.filter(
          (ds) => ds.status === 'verified' && (!ds.pengelolaans || ds.pengelolaans.length === 0)
        )
      } catch {
        this.showToast('Gagal memuat daftar data sampah.', 'error')
      } finally {
        this.loadingDropdown = false
      }
    },

    async fetchJenisPengelolaan() {
      this.loadingJenisPengelolaan = true
      try {
        const res = await api.get('/jenis-pengelolaan')
        this.listJenisPengelolaan = res.data.data || res.data
      } catch {
        this.showToast('Gagal memuat jenis pengelolaan.', 'error')
      } finally {
        this.loadingJenisPengelolaan = false
      }
    },

    // ==========================================
    // FORM TAMBAH / EDIT
    // ==========================================
    async bukaModalForm() {
      this.modeEdit = false
      this.form = {
        id: null,
        data_sampah_id: '',
        jenis_pengelolaan_id: '',
        jumlah: '',
        keterangan: '',
      }
      this.errors = {}
      this.showModalForm = true
      
      // Load dropdowns paralel
      await Promise.all([this.fetchDropdownDataSampah(), this.fetchJenisPengelolaan()])
    },

    async bukaModalEdit(item) {
      this.modeEdit = true
      this.form = {
        id: item.id,
        data_sampah_id: item.data_sampah_id,
        jenis_pengelolaan_id: item.jenis_pengelolaan_id,
        jumlah: item.jumlah,
        keterangan: item.keterangan || '',
      }
      this.errors = {}
      this.showModalForm = true

      // Pada edit, kita set listDataSampah hanya dengan data yang sedang aktif
      await this.fetchJenisPengelolaan()
      this.listDataSampah = item.data_sampah ? [item.data_sampah] : []
    },

    tutupModalForm() {
      this.showModalForm = false
    },

    async simpanData() {
      this.errors = {}
      let hasError = false

      if (!this.form.data_sampah_id) { this.errors.data_sampah_id = 'Data sampah wajib dipilih.'; hasError = true }
      if (!this.form.jenis_pengelolaan_id) { this.errors.jenis_pengelolaan_id = 'Jenis pengelolaan wajib dipilih.'; hasError = true }
      if (!this.form.jumlah || Number(this.form.jumlah) <= 0) { 
        this.errors.jumlah = 'Jumlah wajib diisi (minimal 0.01).'; 
        hasError = true 
      }

      if (hasError) return

      this.loadingSubmit = true
      try {
        const payload = {
          data_sampah_id: this.form.data_sampah_id,
          jenis_pengelolaan_id: this.form.jenis_pengelolaan_id,
          jumlah: Number(this.form.jumlah),
          keterangan: this.form.keterangan ? this.form.keterangan.trim() : '',
        }

        if (this.modeEdit) {
          await api.put(`/data-pengelolaan/${this.form.id}`, payload)
          this.showToast('Data pengelolaan berhasil diperbarui.', 'success')
        } else {
          await api.post('/data-pengelolaan', payload)
          this.showToast('Data pengelolaan berhasil ditambahkan.', 'success')
        }

        this.tutupModalForm()
        this.fetchData(this.currentPage)
      } catch (err) {
        if (err.response?.status === 422) {
          const errs = err.response.data.errors
          if (errs?.data_sampah_id) this.errors.data_sampah_id = errs.data_sampah_id[0]
          if (errs?.jenis_pengelolaan_id) this.errors.jenis_pengelolaan_id = errs.jenis_pengelolaan_id[0]
          if (errs?.jumlah) this.errors.jumlah = errs.jumlah[0]
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
        await api.delete(`/data-pengelolaan/${this.modalHapusId}`)
        this.showToast('Data berhasil dihapus.', 'success')
        this.tutupModalHapus()
        
        // Jika halaman terakhir hanya berisi 1 data, mundur ke halaman sebelumnya
        if (this.dataList.length === 1 && this.currentPage > 1) {
          this.currentPage--
        }
        this.fetchData(this.currentPage)
      } catch {
        this.showToast('Gagal menghapus data.', 'error')
      } finally {
        this.loadingHapus = false
      }
    },

    // ==========================================
    // HELPER
    // ==========================================
    formatTanggal(val) {
      if (!val) return '-'
      return new Date(val).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric'
      })
    },

    formatAngka(n) {
      if (!n && n !== 0) return '0'
      return Number(n).toLocaleString('id-ID')
    },

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
  }
}