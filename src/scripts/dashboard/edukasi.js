import api from '@/services/api.js'

export default {
  data() {
    return {
      edukasis: [],
      loading: true,
      submitting: false,
      deletingId: null,

      currentPage: 1,
      lastPage: 1,
      total: 0,
      perPage: 10,

      searchQuery: '',
      filterKategori: '',
      searchTimeout: null,

      statTotal: 0,
      statModul: 0,
      statVideo: 0,

      showModal: false,
      isEdit: false,
      editId: null,

      form: {
        judul: '',
        kategori: '',
        deskripsi: '',
        link_video: '',
      },
      formFilePdf: null,
      formGambar: null,
      previewGambar: null,
      existingGambar: null,
      existingPdf: null,
      formErrors: {},

      showModalHapus: false,
      hapusId: null,
      hapusJudul: '',

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
  },

  mounted() {
    this.fetchEdukasis()
  },

  methods: {
    // ══════════════════════════════════
    // FETCH DATA
    // ══════════════════════════════════
    async fetchEdukasis() {
      this.loading = true
      try {
        const params = { page: this.currentPage, per_page: this.perPage }
        if (this.searchQuery.trim()) params.search = this.searchQuery.trim()
        if (this.filterKategori)     params.kategori = this.filterKategori

        const res = await api.get('/edukasis', { params })
        const d   = res.data

        this.edukasis    = d.data         || []
        this.currentPage = d.current_page
        this.lastPage    = d.last_page
        this.total       = d.total
        this.perPage     = d.per_page

        this.statTotal = d.total
        this.statModul = this.edukasis.filter(e => e.kategori === 'modul').length
        this.statVideo = this.edukasis.filter(e => e.kategori === 'video').length
      } catch {
        this.showToast('Gagal memuat data edukasi.', 'error')
      } finally {
        this.loading = false
      }
    },

    // Pencarian dengan debounce 400ms
    onSearch() {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.currentPage = 1
        this.fetchEdukasis()
      }, 400)
    },

    // Filter kategori
    onFilterKategori() {
      this.currentPage = 1
      this.fetchEdukasis()
    },

    // Navigasi halaman
    goToPage(page) {
      if (page < 1 || page > this.lastPage) return
      this.currentPage = page
      this.fetchEdukasis()
    },

    // ══════════════════════════════════
    // MODAL TAMBAH / EDIT
    // ══════════════════════════════════
    bukaModalTambah() {
      this.isEdit         = false
      this.editId         = null
      this.form           = { judul: '', kategori: '', deskripsi: '', link_video: '' }
      this.formFilePdf    = null
      this.formGambar     = null
      this.previewGambar  = null
      this.existingGambar = null
      this.existingPdf    = null
      this.formErrors     = {}
      this.showModal      = true
    },

    bukaModalEdit(item) {
      this.isEdit  = true
      this.editId  = item.id
      this.form = {
        judul:      item.judul      || '',
        kategori:   item.kategori   || '',
        deskripsi:  item.deskripsi  || '',
        link_video: item.link_video || '',
      }
      this.formFilePdf    = null
      this.formGambar     = null
      this.existingGambar = item.gambar
        ? `http://localhost:8000/storage/${item.gambar}`
        : null
      this.previewGambar  = this.existingGambar
      this.existingPdf    = item.file_pdf || null
      this.formErrors     = {}
      this.showModal      = true
    },

    tutupModal() {
      this.showModal = false
    },

    pilihKategori(kategori) {
      this.form.kategori  = kategori
      this.formFilePdf    = null
      this.formGambar     = null
      this.previewGambar  = null
      this.existingGambar = null
      this.existingPdf    = null
      this.form.link_video = ''
      this.formErrors     = {}
    },

    // ══════════════════════════════════
    // UPLOAD PDF
    // ══════════════════════════════════
    onPdfChange(event) {
      const file = event.target.files[0]
      if (!file) return
      if (file.size > 10 * 1024 * 1024) {
        this.showToast('Ukuran PDF maksimal 10MB.', 'error')
        return
      }
      if (file.type !== 'application/pdf') {
        this.showToast('File harus berformat PDF.', 'error')
        return
      }
      this.formFilePdf = file
    },

    hapusPdf() {
      this.formFilePdf = null
      this.existingPdf = null
    },

    // ══════════════════════════════════
    // UPLOAD GAMBAR
    // ══════════════════════════════════
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
      const reader = new FileReader()
      reader.onload = (e) => { this.previewGambar = e.target.result }
      reader.readAsDataURL(file)
    },

    hapusPreviewGambar() {
      this.formGambar     = null
      this.previewGambar  = null
      this.existingGambar = null
    },

    // ══════════════════════════════════
    // SUBMIT FORM
    // ══════════════════════════════════
    async submitForm() {
      this.formErrors = {}

      if (!this.form.judul.trim()) {
        this.formErrors.judul = 'Judul wajib diisi.'
        return
      }
      if (!this.form.kategori) {
        this.formErrors.kategori = 'Pilih kategori terlebih dahulu.'
        return
      }
      if (this.form.kategori === 'modul' && !this.formFilePdf && !this.existingPdf) {
        this.formErrors.file_pdf = 'File PDF wajib diupload untuk kategori Modul.'
        return
      }
      if (this.form.kategori === 'video' && !this.form.link_video.trim()) {
        this.formErrors.link_video = 'Link video YouTube wajib diisi.'
        return
      }

      this.submitting = true
      try {
        const fd = new FormData()
        fd.append('judul',     this.form.judul)
        fd.append('kategori',  this.form.kategori)
        fd.append('deskripsi', this.form.deskripsi)

        if (this.form.kategori === 'modul') {
          if (this.formFilePdf) fd.append('file_pdf', this.formFilePdf)
          if (this.formGambar)  fd.append('gambar', this.formGambar)
        }

        if (this.form.kategori === 'video') {
          fd.append('link_video', this.form.link_video)
        }

        const config = { headers: { 'Content-Type': 'multipart/form-data' } }

        if (this.isEdit) {
          fd.append('_method', 'PUT')
          await api.post(`/edukasis/${this.editId}`, fd, config)
          this.showToast('Konten edukasi berhasil diperbarui!', 'success')
        } else {
          await api.post('/edukasis', fd, config)
          this.showToast('Konten edukasi berhasil ditambahkan!', 'success')
        }

        this.tutupModal()
        this.currentPage = this.isEdit ? this.currentPage : 1
        this.fetchEdukasis()
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

    // ══════════════════════════════════
    // HAPUS
    // ══════════════════════════════════
    bukaModalHapus(item) {
      this.hapusId        = item.id
      this.hapusJudul     = item.judul
      this.showModalHapus = true
    },

    tutupModalHapus() {
      this.showModalHapus = false
      this.hapusId        = null
      this.hapusJudul     = ''
    },

    async konfirmasiHapus() {
      this.deletingId = this.hapusId
      try {
        await api.delete(`/edukasis/${this.hapusId}`)
        this.showToast('Konten edukasi berhasil dihapus.', 'success')
        this.tutupModalHapus()
        if (this.edukasis.length === 1 && this.currentPage > 1) this.currentPage--
        this.fetchEdukasis()
      } catch {
        this.showToast('Gagal menghapus konten edukasi.', 'error')
      } finally {
        this.deletingId = null
      }
    },

    // ══════════════════════════════════
    // HELPERS
    // ══════════════════════════════════
    formatTanggal(val) {
      if (!val) return '-'
      return new Date(val).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric'
      })
    },

    getGambarUrl(path) {
      if (!path) return null
      if (path.startsWith('http')) return path
      return `http://localhost:8000/storage/${path}`
    },

    getYoutubeThumbnail(url) {
      if (!url) return null
      const match = url.match(/(?:v=|youtu\.be\/|embed\/)([^&?/]+)/)
      return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : null
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
    },
  },
}