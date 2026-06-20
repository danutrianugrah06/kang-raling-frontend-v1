import api from '@/services/api.js'

export default {
  data() {
    return {
      loading: true,
      apiKeys: [],
      searchQuery: '',

      // Toggle & Copy
      visibleKeys: {},
      copiedId: null,

      // Modal Buat Baru
      showCreateModal: false,
      saving: false,
      formCreate: { name: '' },
      formErrors: {},

      // Toast
      toasts: [],
      toastCounter: 0,
    }
  },

  computed: {
    // Filter pencarian lokal berdasarkan nama token
    filteredKeys() {
      if (!this.searchQuery) return this.apiKeys;
      const q = this.searchQuery.toLowerCase();
      return this.apiKeys.filter(item => item.name.toLowerCase().includes(q));
    }
  },

  async mounted() {
    await this.fetchKeys()
  },

  methods: {
    // ==========================================
    // FETCH DATA
    // ==========================================
    async fetchKeys() {
      this.loading = true
      try {
        const res = await api.get('/api-keys')
        this.apiKeys = Array.isArray(res.data) ? res.data : (res.data.data || [])
      } catch {
        this.showToast('Gagal memuat daftar API Key.', 'error')
      } finally {
        this.loading = false
      }
    },

    // ==========================================
    // PENCARIAN (DEBOUNCE)
    // ==========================================
    onSearch() {
      // Pencarian langsung karena computed property sudah reactive
      // Tidak perlu debounce untuk filter lokal sederhana
    },

    // ==========================================
    // MODAL BUAT TOKEN
    // ==========================================
    openCreateModal() {
      this.formCreate = { name: '' }
      this.formErrors = {}
      this.showCreateModal = true
    },

    closeCreateModal() {
      this.showCreateModal = false
    },

    async submitCreate() {
      this.formErrors = {}
      if (!this.formCreate.name.trim()) {
        this.formErrors.name = ['Nama token wajib diisi.']
        return
      }
      
      this.saving = true
      try {
        // 1. Tangkap balasan dari backend ke dalam variabel 'res'
        const res = await api.post('/api-keys', { name: this.formCreate.name.trim() })
        
        // 2. Ambil token aslinya
        const plainToken = res.data.token || res.data.data?.token;

        this.closeCreateModal()
        this.showToast('Token baru berhasil di-generate! Segera salin sekarang.', 'success')
        
        // 3. Refresh tabel
        await this.fetchKeys()

        // 4. SUNTIKKAN TOKEN ASLI KE BARIS PERTAMA AGAR TERLIHAT (Karena dari database hasilnya '-')
        if (this.apiKeys.length > 0 && plainToken) {
          this.apiKeys[0].token = plainToken;
          this.apiKeys[0].token_key = plainToken; // Cadangan
          this.apiKeys[0].key = plainToken;       // Cadangan
          
          // 5. Otomatis klik tombol "mata" agar token langsung terlihat tanpa disensor
          this.visibleKeys[this.apiKeys[0].id] = true;
        }

      } catch (err) {
        if (err.response?.status === 422) {
          this.formErrors = err.response.data.errors || {}
          this.showToast(err.response.data.message || 'Periksa isian form.', 'error')
        } else {
          this.showToast('Gagal membuat token.', 'error')
        }
      } finally {
        this.saving = false
      }
    },

    // ==========================================
    // TOGGLE VISIBILITY
    // ==========================================
    toggleVisible(id) {
      this.visibleKeys = {
        ...this.visibleKeys,
        [id]: !this.visibleKeys[id],
      }
    },

    // Masking token: tampilkan hanya 8 karakter awal + 4 karakter akhir
    maskKey(key) {
      if (!key || key === '-') return '—' // Jika '-', tampilkan strip panjang
      if (key.length <= 12) return '•'.repeat(key.length)
      return key.substring(0, 8) + '••••••••••••' + key.substring(key.length - 4)
    },

    // ==========================================
    // COPY TO CLIPBOARD
    // ==========================================
    async copyKey(item) {
      // FIX: Karena nama properti bisa token, token_key, atau key, kita ambil yang ada isinya
      const textToCopy = item.token || item.token_key || item.key;

      // Cegah copy jika token sudah disensor dari database (-)
      if (!textToCopy || textToCopy === '-' || textToCopy === '—') {
        this.showToast('Demi keamanan, token lama disembunyikan. Buat token baru jika lupa.', 'error');
        return;
      }

      try {
        await navigator.clipboard.writeText(textToCopy)
        this.copiedId = item.id
        this.showToast('Token berhasil disalin!', 'success')
        setTimeout(() => { this.copiedId = null }, 2500)
      } catch {
        this.showToast('Gagal menyalin token.', 'error')
      }
    },

    // ==========================================
    // HELPER: FORMAT TANGGAL
    // ==========================================
    formatDate(dateStr) {
      if (!dateStr) return '-'
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric'
      })
    },

    // ==========================================
    // TOAST
    // ==========================================
    showToast(message, type = 'info') {
      const id = ++this.toastCounter
      this.toasts.push({ id, message, type })
      setTimeout(() => {
        this.toasts = this.toasts.filter(t => t.id !== id)
      }, 3500)
    }
  }
} 