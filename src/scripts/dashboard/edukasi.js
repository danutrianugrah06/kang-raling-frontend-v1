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
      },
      formFilePdf: null,
      formFileVideo: null, // Baru: Penampung file video lokal
      formGambar: null,
      previewGambar: null,
      
      existingGambar: null,
      existingPdf: null,
      existingVideo: null, // Baru: Penanda video lama ada
      gambarDihapusSengaja: false,

      formErrors: {},

      showModalHapus: false,
      hapusId: null,
      hapusJudul: '',

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
  },

  mounted() {
    this.fetchEdukasis()
  },

  methods: {
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

    onSearch() {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.currentPage = 1
        this.fetchEdukasis()
      }, 400)
    },

    onFilterKategori() {
      this.currentPage = 1
      this.fetchEdukasis()
    },

    goToPage(page) {
      if (page < 1 || page > this.lastPage) return
      this.currentPage = page
      this.fetchEdukasis()
    },

    bukaModalTambah() {
      this.isEdit         = false
      this.editId         = null
      this.form           = { judul: '', kategori: '', deskripsi: '' }
      this.formFilePdf    = null
      this.formFileVideo  = null
      this.formGambar     = null
      this.previewGambar  = null
      this.existingGambar = null
      this.existingPdf    = null
      this.existingVideo  = null
      this.gambarDihapusSengaja = false
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
      }
      this.formFilePdf    = null
      this.formFileVideo  = null
      this.formGambar     = null
      this.existingGambar = item.gambar ? `http://localhost:8000/storage/${item.gambar}` : null
      this.previewGambar  = this.existingGambar
      this.existingPdf    = item.file_pdf || null
      this.existingVideo  = item.link_video || null // Isi dengan path video lama jika ada
      this.gambarDihapusSengaja = false
      this.formErrors     = {}
      this.showModal      = true
    },

    tutupModal() {
      this.showModal = false
    },

    pilihKategori(kategori) {
      this.form.kategori  = kategori
      this.formErrors     = {}
    },

    onPdfChange(event) {
      const file = event.target.files[0]
      if (!file) return
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

    // Baru: Handler Video
    onVideoChange(event) {
      const file = event.target.files[0]
      if (!file) return
      const allowed = ['video/mp4', 'video/webm', 'video/ogg']
      if (!allowed.includes(file.type)) {
        this.showToast('Format video harus MP4, WebM, atau OGG.', 'error')
        return
      }
      this.formFileVideo = file
    },

    hapusVideo() {
      this.formFileVideo = null
      this.existingVideo = null
    },

    onGambarChange(event) {
      const file = event.target.files[0]
      if (!file) return
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
      this.gambarDihapusSengaja = true
    },

    async submitForm() {
      this.formErrors = {}

      if (!this.form.judul.trim()) this.formErrors.judul = 'Judul wajib diisi.'
      if (!this.form.kategori) this.formErrors.kategori = 'Pilih kategori terlebih dahulu.'
      
      if (this.form.kategori === 'modul' && !this.formFilePdf && !this.existingPdf) {
        this.formErrors.file_pdf = 'File PDF wajib diupload untuk kategori Modul.'
      }
      if (this.form.kategori === 'video' && !this.formFileVideo && !this.existingVideo) {
        this.formErrors.link_video = 'File Video lokal wajib diupload.'
      }

      if (Object.keys(this.formErrors).length > 0) return

      this.submitting = true
      try {
        const fd = new FormData()
        fd.append('judul',     this.form.judul)
        fd.append('kategori',  this.form.kategori)
        fd.append('deskripsi', this.form.deskripsi)

        if (this.form.kategori === 'modul' && this.formFilePdf) {
          fd.append('file_pdf', this.formFilePdf)
        }

        // Sekarang kita upload file fisik video, dikirim ke parameter link_video
        if (this.form.kategori === 'video' && this.formFileVideo) {
          fd.append('link_video', this.formFileVideo)
        }

        // Gambar bisa untuk Modul dan Video (sebagai Thumbnail)
        if (this.formGambar) {
          fd.append('gambar', this.formGambar)
        } else if (this.isEdit && this.gambarDihapusSengaja) {
          fd.append('remove_gambar', 'true')
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
          this.formErrors = Object.fromEntries(Object.entries(e).map(([k, v]) => [k, v[0]]))
          this.showToast('Periksa kembali isian form.', 'error')
        } else {
          this.showToast('Gagal mengupload. Pastikan ukuran file tidak terlalu besar.', 'error')
        }
      } finally {
        this.submitting = false
      }
    },

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

    formatTanggal(val) {
      if (!val) return '-'
      return new Date(val).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
    },
    getGambarUrl(path) {
      if (!path) return null
      if (path.startsWith('http')) return path
      return `http://localhost:8000/storage/${path}`
    },
    showToast(message, type = 'info') {
      const id = ++this.toastCounter
      this.toasts.push({ id, message, type })
      setTimeout(() => { this.toasts = this.toasts.filter(t => t.id !== id) }, 3500)
    },
    toastIcon(type) {
      const map = { success: 'bi-check-circle-fill', error: 'bi-x-circle-fill', info: 'bi-info-circle-fill' }
      return map[type] || 'bi-info-circle-fill'
    },
  },
}