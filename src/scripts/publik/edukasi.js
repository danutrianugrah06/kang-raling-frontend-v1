import api from '@/services/api.js'

export default {
  data() {
    return {
      // Modul State
      moduls: [],
      loadingModul: true,
      modulPage: 1,
      modulTotalPages: 1,

      // Video State
      videos: [],
      loadingVideo: true,
      videoPage: 1,
      videoTotalPages: 1,

      toasts: [],
      toastCounter: 0,
    }
  },

  mounted() {
    this.fetchModul(1)
    this.fetchVideo(1)
  },

  methods: {
    /* ── FETCH & PAGINATION MODUL ── */
    async fetchModul(page = 1) {
      this.loadingModul = true
      try {
        const res = await api.get('/edukasis', {
          params: { page: page, per_page: 9, kategori: 'modul' }
        })
        const data = res.data
        this.moduls = data.data || []
        this.modulPage = data.current_page || 1
        this.modulTotalPages = data.last_page || 1
      } catch (e) {
        this.showToast('Gagal memuat modul edukasi.', 'error')
      } finally {
        this.loadingModul = false
      }
    },
    changePageModul(page) {
      if (page >= 1 && page <= this.modulTotalPages) {
        this.fetchModul(page)
      }
    },

    /* ── FETCH & PAGINATION VIDEO ── */
    async fetchVideo(page = 1) {
      this.loadingVideo = true
      try {
        const res = await api.get('/edukasis', {
          params: { page: page, per_page: 9, kategori: 'video' }
        })
        const data = res.data
        this.videos = data.data || []
        this.videoPage = data.current_page || 1
        this.videoTotalPages = data.last_page || 1
      } catch (e) {
        this.showToast('Gagal memuat video edukasi.', 'error')
      } finally {
        this.loadingVideo = false
      }
    },
    changePageVideo(page) {
      if (page >= 1 && page <= this.videoTotalPages) {
        this.fetchVideo(page)
      }
    },

    /* ── AKSI BUKA KONTEN ── */
    bukaModul(modul) {
      if (modul.file_pdf) {
        window.open('http://localhost:8000/storage/' + modul.file_pdf, '_blank', 'noopener,noreferrer')
      } else {
        this.showToast('File PDF belum tersedia.', 'error')
      }
    },
    bukaVideo(video) {
      if (video.link_video) {
        // Cek apakah ini link YouTube lama atau path video lokal baru
        let url = video.link_video
        
        // Jika bukan link luar (http), berarti file lokal. Kita arahkan ke storage Laravel!
        if (!url.startsWith('http')) {
          url = 'http://localhost:8000/storage/' + url
        }
        
        // Buka di tab baru, browser akan otomatis memutar file MP4-nya!
        window.open(url, '_blank', 'noopener,noreferrer')
      } else {
        this.showToast('File video belum tersedia.', 'error')
      }
    },

    /* ── HELPERS ── */
    getImageUrl(path) {
      if (!path) return ''
      if (path.startsWith('http')) return path
      return 'http://localhost:8000/storage/' + path
    },
    getYoutubeThumbnail(url) {
      if (!url) return null
      const match = url.match(/(?:v=|youtu\.be\/|embed\/)([^&?/]+)/)
      return match ? 'https://img.youtube.com/vi/' + match[1] + '/hqdefault.jpg' : null
    },
    getVideoImage(video) {
      if (video.gambar) return this.getImageUrl(video.gambar)
      return this.getYoutubeThumbnail(video.link_video)
    },
    formatTanggal(dateStr) {
      if (!dateStr) return ''
      return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    },
    showToast(message, type = 'success') {
      const id = ++this.toastCounter
      this.toasts.push({ id, message, type })
      setTimeout(() => { this.toasts = this.toasts.filter(t => t.id !== id) }, 3500)
    }
  }
}