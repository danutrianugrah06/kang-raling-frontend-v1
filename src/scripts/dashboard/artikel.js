import api from '@/services/api.js'

export default {
  data() {
    return {
      // Data utama
      artikels: [],
      loading: true,
      submitting: false,
      deletingId: null,

      // Pagination
      currentPage: 1,
      lastPage: 1,
      total: 0,
      perPage: 10,

      // Pencarian
      searchQuery: '',
      searchTimeout: null,

      // Modal tambah/edit
      showModal: false,
      isEdit: false,
      editId: null,

      // Form data[cite: 3]
      form: {
        judul: '',
        isi_artikel: '',
      },
      formGambar: null,
      previewGambar: null,
      existingGambar: null,
      formErrors: {},
      gambarDihapusSengaja: false, // INDIKATOR BARU: Mendeteksi jika gambar dihapus oleh user[cite: 3]

      // Modal hapus
      showModalHapus: false,
      hapusId: null,
      hapusJudul: '',

      // Toast
      toasts: [],
      toastCounter: 0,

      // Role user (dari localStorage)
      isAdmin: false,
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
    }
  },

  mounted() {
    // Ambil role user dari localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    this.isAdmin = user.role === 'administrator'
    this.fetchArtikels()
  },

  methods: {
    /**
     * Ambil data artikel dari API (dengan pagination & pencarian)
     */
    async fetchArtikels() {
      this.loading = true
      try {
        const params = {
          page: this.currentPage,
          per_page: this.perPage,
        }
        if (this.searchQuery.trim()) params.search = this.searchQuery.trim()

        const res = await api.get('/artikels', { params })
        const d   = res.data

        this.artikels    = d.data        || []
        this.currentPage = d.current_page
        this.lastPage    = d.last_page
        this.total       = d.total
        this.perPage     = d.per_page

      } catch (err) {
        this.showToast('Gagal memuat data artikel.', 'error')
      } finally {
        this.loading = false
      }
    },

    /**
     * Handler pencarian dengan debounce 400ms
     */
    onSearch() {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.currentPage = 1
        this.fetchArtikels()
      }, 400)
    },

    /**
     * Pindah ke halaman tertentu
     * @param {number} page
     */
    goToPage(page) {
      if (page < 1 || page > this.lastPage) return
      this.currentPage = page
      this.fetchArtikels()
    },

    /**
     * Buka modal tambah artikel (reset semua form)
     */
    bukaModalTambah() {
      this.isEdit         = false
      this.editId         = null
      this.form           = { judul: '', isi_artikel: '' }
      this.formGambar     = null
      this.previewGambar  = null
      this.existingGambar = null
      this.formErrors     = {}
      this.gambarDihapusSengaja = false // Reset indikator[cite: 3]
      this.showModal      = true
    },

    /**
     * Buka modal edit artikel (isi form dengan data yang ada)
     * @param {Object} artikel
     */
    bukaModalEdit(artikel) {
      this.isEdit         = true
      this.editId         = artikel.id
      this.form = {
        judul:        artikel.judul       || '',
        isi_artikel:  artikel.isi_artikel || '',
      }
      this.formGambar     = null
      this.existingGambar = artikel.gambar
        ? `http://localhost:8000/storage/${artikel.gambar}`
        : null
      this.previewGambar  = this.existingGambar
      this.formErrors     = {}
      this.gambarDihapusSengaja = false // Reset indikator[cite: 3]
      this.showModal      = true
    },

    /**
     * Tutup modal tambah/edit
     */
    tutupModal() {
      this.showModal = false
    },

    /**
     * Handler upload gambar (validasi ukuran & format)
     * @param {Event} event
     */
    onGambarChange(event) {
      const file = event.target.files[0]
      if (!file) return
      if (file.size > 10 * 1024 * 1024) {
        this.showToast('Ukuran gambar maksimal 10MB.', 'error')
        return
      }
      const allowed = ['image/jpeg', 'image/png', 'image/webp']
      if (!allowed.includes(file.type)) {
        this.showToast('Format gambar harus JPG, PNG, atau WebP.', 'error')
        return
      }
      this.formGambar = file
      const reader   = new FileReader()
      reader.onload  = (e) => { this.previewGambar = e.target.result }
      reader.readAsDataURL(file)
    },

    /**
     * Hapus preview gambar (baik yang baru diupload maupun existing)
     */
    hapusPreviewGambar() {
      this.formGambar     = null
      this.previewGambar  = null
      this.existingGambar = null
      this.gambarDihapusSengaja = true // Aktifkan sinyal hapus[cite: 3]
    },

    /**
     * Submit form (tambah atau edit)
     */
    async submitForm() {
      this.formErrors = {}

      if (!this.form.judul.trim()) {
        this.formErrors.judul = 'Judul artikel wajib diisi.'
        return
      }
      if (!this.form.isi_artikel.trim()) {
        this.formErrors.isi_artikel = 'Isi artikel wajib diisi.'
        return
      }

      this.submitting = true
      try {
        const fd = new FormData()
        fd.append('judul',       this.form.judul)
        fd.append('isi_artikel', this.form.isi_artikel)
        
        // Logika baru untuk menyuntikkan file gambar atau sinyal hapus gambar[cite: 3]
        if (this.formGambar) {
          fd.append('gambar', this.formGambar)
        } else if (this.isEdit && this.gambarDihapusSengaja) {
          fd.append('remove_gambar', 'true')
        }

        const config = { headers: { 'Content-Type': 'multipart/form-data' } }

        if (this.isEdit) {
          fd.append('_method', 'PUT')
          await api.post(`/artikels/${this.editId}`, fd, config)
          this.showToast('Artikel berhasil diperbarui!', 'success')
        } else {
          await api.post('/artikels', fd, config)
          this.showToast('Artikel berhasil ditambahkan!', 'success')
        }

        this.tutupModal()
        this.currentPage = this.isEdit ? this.currentPage : 1
        this.fetchArtikels()
      } catch (err) {
        if (err.response?.status === 422) {
          const e = err.response.data.errors || {}
          this.formErrors = Object.fromEntries(
            Object.entries(e).map(([k, v]) => [k, v[0]])
          )
          this.showToast('Periksa kembali isian form.', 'error')
        } else {
          this.showToast('Terjadi kesalahan. Coba lagi.', 'error')
        }
      } finally {
        this.submitting = false
      }
    },

    /**
     * Buka modal konfirmasi hapus
     * @param {Object} artikel
     */
    bukaModalHapus(artikel) {
      this.hapusId        = artikel.id
      this.hapusJudul     = artikel.judul
      this.showModalHapus = true
    },

    /**
     * Tutup modal konfirmasi hapus
     */
    tutupModalHapus() {
      this.showModalHapus = false
      this.hapusId        = null
      this.hapusJudul     = ''
    },

    /**
     * Eksekusi hapus artikel
     */
    async konfirmasiHapus() {
      this.deletingId = this.hapusId
      try {
        await api.delete(`/artikels/${this.hapusId}`)
        this.showToast('Artikel berhasil dihapus.', 'success')
        this.tutupModalHapus()
        // Jika halaman terakhir hanya berisi 1 data, mundur ke halaman sebelumnya
        if (this.artikels.length === 1 && this.currentPage > 1) {
          this.currentPage--
        }
        this.fetchArtikels()
      } catch {
        this.showToast('Gagal menghapus artikel.', 'error')
      } finally {
        this.deletingId = null
      }
    },

    /**
     * Format tanggal ke format Indonesia (dd Mon yyyy)
     * @param {string} val
     * @returns {string}
     */
    formatTanggal(val) {
      if (!val) return '-'
      return new Date(val).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric'
      })
    },

    /**
     * Dapatkan URL lengkap gambar (dari path relatif)
     * @param {string} path
     * @returns {string|null}
     */
    getGambarUrl(path) {
      if (!path) return null
      if (path.startsWith('http')) return path
      return `http://localhost:8000/storage/${path}`
    },

    /**
     * Tampilkan toast notifikasi (hilang otomatis setelah 3.5 detik)
     * @param {string} message
     * @param {string} type 'success' | 'error' | 'info'
     */
    showToast(message, type = 'info') {
      const id = ++this.toastCounter
      this.toasts.push({ id, message, type })
      setTimeout(() => {
        this.toasts = this.toasts.filter(t => t.id !== id)
      }, 3500)
    },

    /**
     * Pilih ikon berdasarkan tipe toast
     * @param {string} type
     * @returns {string}
     */
    toastIcon(type) {
      const map = {
        success: 'bi-check-circle-fill',
        error:   'bi-x-circle-fill',
        info:    'bi-info-circle-fill'
      }
      return map[type] || 'bi-info-circle-fill'
    },
  },
}