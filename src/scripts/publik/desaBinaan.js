import api from '@/services/api.js'

export default {
  data() {
    return {
      desas: [],           // Array data desa yang ditampilkan
      loading: true,       // Status loading pertama kali
      loadingMore: false,  // Status loading saat memuat lebih banyak
      currentPage: 1,      // Halaman saat ini
      lastPage: 1,         // Halaman terakhir dari API
      hasMore: false,      // Apakah masih ada halaman berikutnya
      toasts: [],          // Antrian notifikasi toast
      toastCounter: 0,     // Penghitung ID unik toast
    }
  },

  mounted() {
    // Ambil data desa saat komponen pertama kali dipasang
    this.fetchDesas()
  },

  methods: {
    /*
      FETCH DATA DESA
      - Mengambil data dari endpoint /desas dengan parameter page dan per_page.
      - Jika page = 1, ganti array desas; jika page > 1, gabungkan dengan array lama.
      - Update currentPage, lastPage, dan hasMore untuk kontrol tombol.
    */
    async fetchDesas(page = 1) {
      if (page === 1) this.loading = true
      else this.loadingMore = true

      try {
        const res = await api.get('/desas', { params: { page, per_page: 8 } })
        const d = res.data

        if (page === 1) {
          this.desas = d.data || []
        } else {
          this.desas = [...this.desas, ...(d.data || [])]
        }

        this.currentPage = d.current_page
        this.lastPage = d.last_page
        this.hasMore = this.currentPage < this.lastPage

      } catch (e) {
        this.showToast('Gagal memuat daftar desa.', 'error')
      } finally {
        this.loading = false
        this.loadingMore = false
      }
    },

    /*
      LOAD MORE: Memanggil fetchDesas dengan halaman berikutnya.
      - Dicegah jika hasMore false.
    */
    loadMore() {
      if (!this.hasMore) return
      this.fetchDesas(this.currentPage + 1)
    },

    /*
      NAVIGASI KE HALAMAN DETAIL DESA
      - Menggunakan slug untuk route dinamis.
    */
    goToDetail(slug) {
      this.$router.push('/desa-binaan/' + slug)
    },

    /*
      AMBIL GAMBAR COVER UNTUK KARTU DESA
      - Mengambil gambar dari TPS pertama yang memiliki data gambar.
      - Jika tidak ada, return null (placeholder akan tampil).
    */
    getCoverGambar(desa) {
      if (desa.profil_tps && desa.profil_tps.length > 0 && desa.profil_tps[0].gambar) {
        return desa.profil_tps[0].gambar
      }
      return null
    },

    /*
      KONVERSI PATH GAMBAR MENJADI URL ABSOLUT
      - Jika path kosong, return ''.
      - Jika sudah berawalan http, langsung return.
      - Jika tidak, tambahkan base URL lokal.
    */
    getImageUrl(path) {
      if (!path) return ''
      if (path.startsWith('http')) return path
      return 'http://localhost:8000/storage/' + path
    },

    /*
      TAMPILKAN TOAST NOTIFIKASI
      - Membuat ID unik, push ke array toasts.
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