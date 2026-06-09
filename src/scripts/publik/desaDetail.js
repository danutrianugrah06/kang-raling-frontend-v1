import api from '@/services/api.js'

export default {
  data() {
    return {
      desa: null,           // Data desa utama
      profilTps: null,      // Data TPS pertama dari desa
      loading: true,        // Status loading
      error: false,         // Status error
      toasts: [],           // Antrian toast
      toastCounter: 0,      // ID unik toast
    }
  },

  /*
    WATCHER: Pantau perubahan parameter slug di URL.
    Jika slug berubah (misal dari rekomendasi), fetch ulang data.
  */
  watch: {
    '$route.params.id'(slug) {
      if (slug) {
        this.fetchDetail(slug)
      }
    }
  },

  mounted() {
    // Ambil slug dari parameter route (menggunakan 'slug' sesuai router)
    this.fetchDetail(this.$route.params.slug)
  },

  methods: {
    /*
      FETCH DETAIL DESA
      - Mengambil data desa dari endpoint /desas/{slug}.
      - Set loading true, reset error & data lama.
      - Ambil TPS pertama dari array profil_tps jika ada.
      - Scroll ke atas setelah berhasil.
      - Tangani error 404/403 dan koneksi.
    */
    async fetchDetail(slug) {
      this.loading = true
      this.error = false
      this.desa = null
      this.profilTps = null

      try {
        const resD = await api.get('/desas/' + slug)
        this.desa = resD.data.data || resD.data

        if (this.desa.profil_tps && this.desa.profil_tps.length > 0) {
          this.profilTps = this.desa.profil_tps[0]
        }

        window.scrollTo({ top: 0, behavior: 'smooth' })
      } catch (e) {
        if (e.response && (e.response.status === 404 || e.response.status === 403)) {
          this.error = true
        } else {
          this.error = true
          this.showToast('Gagal memuat data desa. Coba lagi nanti.', 'error')
        }
      } finally {
        this.loading = false
      }
    },

    /*
      KONVERSI PATH GAMBAR MENJADI URL ABSOLUT
    */
    getImageUrl(path) {
      if (!path) return ''
      if (path.startsWith('http')) return path
      return 'http://localhost:8000/storage/' + path
    },

    /*
      FORMAT ANGKA KE FORMAT RIBUAN INDONESIA (contoh: 1.500)
    */
    formatAngka(n) {
      if (!n && n !== 0) return '0'
      return Number(n).toLocaleString('id-ID')
    },

    /*
      TAMPILKAN TOAST NOTIFIKASI
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