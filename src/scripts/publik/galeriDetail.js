import api from '@/services/api.js'

export default {
  data() {
    return {
      galeri: null,          // Objek data galeri utama
      galeriLainnya: [],     // Array rekomendasi (maksimal 3 foto lain)
      loading: true,         // Status loading untuk menampilkan skeleton
      error: false,          // Status error (404 atau koneksi gagal)
      toasts: [],            // Antrian notifikasi toast
      toastCounter: 0,       // Penghitung ID unik untuk setiap toast
    }
  },

  /*
    WATCHER: Pantau perubahan parameter slug di URL.
    Jika slug berubah (misal navigasi dari rekomendasi), fetch ulang data.
  */
  watch: {
    '$route.params.slug'(newSlug) {
      if (newSlug) this.fetchGaleri(newSlug)
    }
  },

  mounted() {
    // Ambil slug dari URL saat komponen pertama kali dimuat
    this.fetchGaleri(this.$route.params.slug)
  },

  methods: {
    /*
      FETCH GALERI UTAMA
      - Mengambil data galeri berdasarkan slug.
      - Set loading true, reset error & data lama.
      - Jika berhasil, scroll ke atas dan ambil rekomendasi.
      - Jika gagal (404 atau koneksi), set error = true.
    */
    async fetchGaleri(slug) {
      this.loading = true
      this.error = false
      this.galeri = null
      this.galeriLainnya = []

      try {
        const res = await api.get('/galeris/' + slug)
        this.galeri = res.data.data || res.data
        window.scrollTo({ top: 0, behavior: 'smooth' })
        await this.fetchGaleriLainnya(slug)
      } catch (error) {
        console.error("Gagal memuat detail galeri:", error.response || error)
        this.error = true
      } finally {
        this.loading = false
      }
    },

    /*
      FETCH REKOMENDASI GALERI LAINNYA
      - Ambil 6 galeri terbaru (halaman 1, per_page=6).
      - Filter agar tidak menampilkan galeri yang sedang dibuka.
      - Ambil maksimal 3 item untuk ditampilkan.
    */
    async fetchGaleriLainnya(currentSlug) {
      try {
        const res = await api.get('/galeris', { params: { page: 1, per_page: 6 } })
        const semua = res.data.data || res.data
        this.galeriLainnya = semua
          .filter(g => g.slug !== currentSlug)
          .slice(0, 3)
      } catch (e) {
        // Gagal memuat rekomendasi tidak perlu ditampilkan ke pengguna (fitur opsional)
      }
    },

    /*
      NAVIGASI KE GALERI LAIN
      - Push route baru berdasarkan slug.
      - Watcher akan otomatis memicu fetchGaleri.
    */
    goToGaleri(slug) {
      this.$router.push('/galeri/' + slug)
    },

    /*
      BAGIKAN FOTO
      - Gunakan Web Share API jika didukung (mobile/desktop modern).
      - Fallback: copy URL ke clipboard.
    */
    shareGaleri() {
      if (navigator.share) {
        navigator.share({
          title: this.galeri?.keterangan || 'Galeri Kang Raling',
          url: window.location.href,
        }).catch(() => {})
      } else {
        navigator.clipboard.writeText(window.location.href).then(() => {
          this.showToast('Link berhasil disalin!', 'success')
        })
      }
    },

    /*
      HELPER: Konversi path gambar menjadi URL absolut.
      - Jika path kosong, return ''.
      - Jika sudah http, langsung return.
      - Jika tidak, tambahkan base URL lokal (sesuai konfigurasi backend).
    */
    getImageUrl(path) {
      if (!path) return ''
      if (path.startsWith('http')) return path
      return 'http://localhost:8000/storage/' + path
    },

    /*
      HELPER: Format tanggal database ke format Indonesia (contoh: 1 Januari 2024).
    */
    formatTanggal(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    },

    /*
      HELPER: Tampilkan toast notifikasi.
      - ID unik berdasarkan counter.
      - Hapus otomatis setelah 3,5 detik.
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