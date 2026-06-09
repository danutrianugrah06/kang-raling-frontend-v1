import api from '@/services/api.js'

export default {
  data() {
    return {
      artikel: null,            // data artikel yang sedang ditampilkan
      artikelLainnya: [],       // daftar artikel rekomendasi
      loading: true,            // status loading awal
      error: false,             // true jika artikel tidak ditemukan / gagal
      toasts: [],
      toastCounter: 0,
    }
  },

  watch: {
    /*
      Pantau perubahan slug di URL.
      Jika slug berubah (misal navigasi dari artikel lain), fetch ulang.
    */
    '$route.params.slug'(newSlug) {
      if (newSlug) {
        this.fetchArtikel(newSlug)
      }
    }
  },

  mounted() {
    // Ambil slug dari URL saat komponen pertama kali dimuat
    this.fetchArtikel(this.$route.params.slug)
  },

  methods: {
    /*
      Ambil artikel berdasarkan slug.
      - Set loading true, reset error dan data lama.
      - Jika berhasil, scroll ke atas dan ambil rekomendasi.
      - Jika gagal, tampilkan pesan error.
    */
    async fetchArtikel(slug) {
      this.loading = true
      this.error = false
      this.artikel = null
      this.artikelLainnya = []

      try {
        const res = await api.get('/artikels/' + slug)
        this.artikel = res.data.data || res.data
        // Smooth scroll ke atas agar pengguna langsung melihat konten
        window.scrollTo({ top: 0, behavior: 'smooth' })
        await this.fetchArtikelLainnya(slug)
      } catch (e) {
        // 404 atau error jaringan, set error = true
        if (e.response && e.response.status === 404) {
          this.error = true
        } else {
          this.error = true
          this.showToast('Gagal memuat artikel. Coba lagi nanti.', 'error')
        }
      } finally {
        this.loading = false
      }
    },

    /*
      Ambil 3 artikel lain untuk rekomendasi, kecuali artikel yang sedang dibaca.
      Mengambil halaman 1 dengan 6 item, lalu disaring dan di-slice 3.
    */
    async fetchArtikelLainnya(currentSlug) {
      try {
        const res = await api.get('/artikels', { params: { page: 1, per_page: 6 } })
        const semua = res.data.data || res.data
        this.artikelLainnya = semua
          .filter(a => a.slug !== currentSlug)
          .slice(0, 3)
      } catch (e) {
        // Gagal memuat rekomendasi tidak perlu ditampilkan ke pengguna
      }
    },

    /*
      Bagikan artikel:
      - Jika browser mendukung Web Share API, gunakan native share sheet.
      - Jika tidak, salin URL ke clipboard dan tampilkan toast sukses.
    */
    shareArtikel() {
      if (navigator.share) {
        navigator.share({
          title: this.artikel?.judul || 'Artikel Kang Raling',
          url: window.location.href,
        }).catch(() => {})
      } else {
        navigator.clipboard.writeText(window.location.href).then(() => {
          this.showToast('Link berhasil disalin!', 'success')
        })
      }
    },

    /*
      Ubah path gambar relatif dari server menjadi URL lengkap.
      Jika path sudah berawalan "http", gunakan langsung.
    */
    getImageUrl(path) {
      if (!path) return ''
      if (path.startsWith('http')) return path
      return 'http://localhost:8000/storage/' + path
    },

    /*
      Format tanggal ISO menjadi format Indonesia (contoh: 1 Januari 2024).
    */
    formatTanggal(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    },

    /*
      Tampilkan toast notifikasi yang otomatis hilang setelah 3,5 detik.
    */
    showToast(message, type = 'success') {
      const id = ++this.toastCounter
      this.toasts.push({ id, message, type })
      setTimeout(() => {
        this.toasts = this.toasts.filter(t => t.id !== id)
      }, 3500)
    }
  }
}