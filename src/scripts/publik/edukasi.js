import api from '@/services/api.js'

export default {
  data() {
    return {
      // Modul (kategori: modul)
      moduls: [],
      loadingModul: true,
      loadingMoreModul: false,
      modulPage: 1,
      hasMoreModul: false,

      // Video (kategori: video)
      videos: [],
      loadingVideo: true,
      loadingMoreVideo: false,
      videoPage: 1,
      hasMoreVideo: false,

      // Toast
      toasts: [],
      toastCounter: 0,
    }
  },

  mounted() {
    this.fetchModul()
    this.fetchVideo()
  },

  methods: {
    /* ── FETCH MODUL ── */
    async fetchModul() {
      this.loadingModul = true
      try {
        const res = await api.get('/edukasis', {
          params: { page: 1, per_page: 6, kategori: 'modul' }
        })
        const data = res.data
        this.moduls = data.data || data
        this.modulPage = 1
        this.hasMoreModul = this.checkHasMore(data)
      } catch (e) {
        this.showToast('Gagal memuat modul edukasi.', 'error')
      } finally {
        this.loadingModul = false
      }
    },

    async loadMoreModul() {
      this.loadingMoreModul = true
      try {
        this.modulPage++
        const res = await api.get('/edukasis', {
          params: { page: this.modulPage, per_page: 6, kategori: 'modul' }
        })
        const data = res.data
        this.moduls.push(...(data.data || data))
        this.hasMoreModul = this.checkHasMore(data)
      } catch (e) {
        this.modulPage--
        this.showToast('Gagal memuat lebih banyak modul.', 'error')
      } finally {
        this.loadingMoreModul = false
      }
    },

    /* ── FETCH VIDEO ── */
    async fetchVideo() {
      this.loadingVideo = true
      try {
        const res = await api.get('/edukasis', {
          params: { page: 1, per_page: 7, kategori: 'video' }
        })
        const data = res.data
        this.videos = data.data || data
        this.videoPage = 1
        this.hasMoreVideo = this.checkHasMore(data)
      } catch (e) {
        this.showToast('Gagal memuat video edukasi.', 'error')
      } finally {
        this.loadingVideo = false
      }
    },

    async loadMoreVideo() {
      this.loadingMoreVideo = true
      try {
        this.videoPage++
        const res = await api.get('/edukasis', {
          params: { page: this.videoPage, per_page: 6, kategori: 'video' }
        })
        const data = res.data
        this.videos.push(...(data.data || data))
        this.hasMoreVideo = this.checkHasMore(data)
      } catch (e) {
        this.videoPage--
        this.showToast('Gagal memuat lebih banyak video.', 'error')
      } finally {
        this.loadingMoreVideo = false
      }
    },

    /* ── AKSI BUKA MODUL (PDF) ── */
    bukaModul(modul) {
      if (modul.file_pdf) {
        const url = 'http://localhost:8000/storage/' + modul.file_pdf
        window.open(url, '_blank', 'noopener,noreferrer')
      } else {
        this.showToast('File PDF belum tersedia untuk modul ini.', 'error')
      }
    },

    /* ── AKSI BUKA VIDEO (YOUTUBE) ── */
    bukaVideo(video) {
      if (video.link_video) {
        window.open(video.link_video, '_blank', 'noopener,noreferrer')
      } else {
        this.showToast('Link video belum tersedia.', 'error')
      }
    },

    /* ── HELPERS ── */
    getImageUrl(path) {
      if (!path) return ''
      if (path.startsWith('http')) return path
      return 'http://localhost:8000/storage/' + path
    },

    // Konversi URL YouTube ke embed (untuk kemungkinan penggunaan iframe)
    getYoutubeEmbed(url) {
      if (!url) return null
      const match = url.match(/(?:v=|youtu\.be\/|embed\/)([^&?/]+)/)
      return match ? 'https://www.youtube.com/embed/' + match[1] : null
    },

    // Ambil thumbnail YouTube dari URL apa saja
    getYoutubeThumbnail(url) {
      if (!url) return null
      const match = url.match(/(?:v=|youtu\.be\/|embed\/)([^&?/]+)/)
      return match ? 'https://img.youtube.com/vi/' + match[1] + '/hqdefault.jpg' : null
    },

    // Prioritas gambar: 1. gambar manual, 2. thumbnail YouTube
    getVideoImage(video) {
      if (video.gambar) return this.getImageUrl(video.gambar)
      return this.getYoutubeThumbnail(video.link_video)
    },

    formatTanggal(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return date.toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric'
      })
    },

    checkHasMore(data) {
      if (data?.meta)                        return data.meta.current_page < data.meta.last_page
      if (data?.last_page)                   return data.current_page < data.last_page
      if (data?.next_page_url !== undefined) return !!data.next_page_url
      return false
    },

    showToast(message, type = 'success') {
      const id = ++this.toastCounter
      this.toasts.push({ id, message, type })
      setTimeout(() => {
        this.toasts = this.toasts.filter(t => t.id !== id)
      }, 3500)
    }
  }
}