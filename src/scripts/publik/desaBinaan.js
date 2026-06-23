import api from '@/services/api.js'

export default {
  data() {
    return {
      desas: [],        // Array data desa yang ditampilkan
      loading: true,    // Status loading saat fetch data
      currentPage: 1,    // Halaman saat ini
      lastPage: 1,       // Halaman terakhir dari API
      toasts: [],        // Antrian notifikasi toast
      toastCounter: 0,   // Penghitung ID unik toast
    }
  },

  mounted() {
    // Ambil data desa saat komponen pertama kali dipasang
    this.fetchDesas()
  },

  methods: {
    /*
      FETCH DATA DESA
      - Mengambil data dari endpoint /desas dengan parameter page.
      - Backend sudah paginate(9), jadi setiap halaman berisi 9 desa.
      - Update currentPage dan lastPage dari response Laravel paginate.
    */
    async fetchDesas(page = 1) {
      this.loading = true
      try {
        const res = await api.get('/desas', { params: { page } })
        const d = res.data

        this.desas       = d.data || []
        this.currentPage = d.current_page || 1
        this.lastPage    = d.last_page || 1

      } catch (e) {
        this.showToast('Gagal memuat daftar desa.', 'error')
      } finally {
        this.loading = false
      }
    },

    /*
      PINDAH HALAMAN
      - Dicegah jika halaman tujuan di luar rentang valid.
      - Scroll ke atas grid supaya pengguna langsung lihat konten baru.
    */
    goToPage(page) {
      if (page < 1 || page > this.lastPage) return
      this.fetchDesas(page)
      this.$nextTick(() => {
        const grid = document.querySelector('.desa-grid')
        if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
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