import api from '@/services/api.js'

export default {
  data() {
    return {
      loading: true,
      apiKeys: [],
      searchQuery: '',

      // Toggle & Copy visibility
      visibleKeys: {},
      copiedId: null,

      // Modal Actions
      actionTarget: null,
      showResetModal: false,
      showDeleteModal: false,
      processing: false,
      testingId: null,

      // Toast
      toasts: [],
      toastCounter: 0,
    }
  },

  computed: {
    // Filter token berdasarkan nama (case insensitive)
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
        this.showToast('Gagal memuat tabel API Key.', 'error')
      } finally {
        this.loading = false
      }
    },

    // ==========================================
    // HELPERS
    // ==========================================
    formatDate(dateStr) {
      if (!dateStr) return '-'
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric'
      })
    },

    // Menyembunyikan/menampilkan token
    toggleVisible(id) {
      this.visibleKeys = {
        ...this.visibleKeys,
        [id]: !this.visibleKeys[id],
      }
    },

    // Mask token agar tidak terlihat penuh (kecuali panjang <=12)
    maskKey(key) {
      if (!key) return '—'
      if (key.length <= 12) return '•'.repeat(key.length)
      return key.substring(0, 8) + '••••••••••••' + key.substring(key.length - 4)
    },

    // Salin token ke clipboard
    async copyKey(item) {
      try {
        await navigator.clipboard.writeText(item.key)
        this.copiedId = item.id
        this.showToast('Token berhasil disalin.', 'success')
        setTimeout(() => { this.copiedId = null }, 2500)
      } catch {
        this.showToast('Gagal menyalin token.', 'error')
      }
    },

    // ==========================================
    // UPDATE STATUS AKTIF/NONAKTIF
    // ==========================================
    async toggleStatus(item) {
      try {
        await api.patch(`/api-keys/${item.id}/toggle-active`)
        item.is_active = !item.is_active
        this.showToast(`Status token ${item.name} berhasil diperbarui.`, 'success')
      } catch {
        this.showToast('Gagal memperbarui status token.', 'error')
        this.fetchKeys()
      }
    },

    // ==========================================
    // TEST KONEKSI TOKEN
    // ==========================================
    async testKey(item) {
      this.testingId = item.id
      try {
        const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
        const res = await fetch(`${baseURL}/interop/data-sampah?limit=1`, {
          headers: {
            'X-API-Key': item.key,
            'Accept': 'application/json',
          },
        })
        if (res.ok) {
          this.showToast('Koneksi sukses! Token tervalidasi.', 'success')
        } else {
          this.showToast('Token ditolak. Cek kembali status token.', 'error')
        }
      } catch {
        this.showToast('Gagal terhubung ke server.', 'error')
      } finally {
        this.testingId = null
      }
    },

    // ==========================================
    // RESET TOKEN
    // ==========================================
    confirmReset(item) {
      this.actionTarget = item
      this.showResetModal = true
    },

    async resetKey() {
      if (!this.actionTarget) return
      this.processing = true
      try {
        await api.post(`/api-keys/${this.actionTarget.id}/reset`)
        this.showToast(`Token ${this.actionTarget.name} berhasil direset.`, 'success')
        this.showResetModal = false
        this.actionTarget = null
        await this.fetchKeys()
      } catch {
        this.showToast('Gagal mereset token.', 'error')
      } finally {
        this.processing = false
      }
    },

    // ==========================================
    // HAPUS TOKEN
    // ==========================================
    confirmDelete(item) {
      this.actionTarget = item
      this.showDeleteModal = true
    },

    async deleteKey() {
      if (!this.actionTarget) return
      this.processing = true
      try {
        await api.delete(`/api-keys/${this.actionTarget.id}`)
        this.showToast('Token berhasil dihapus.', 'success')
        this.showDeleteModal = false
        this.actionTarget = null
        await this.fetchKeys()
      } catch {
        this.showToast('Gagal menghapus token.', 'error')
      } finally {
        this.processing = false
      }
    },

    // ==========================================
    // TOAST HELPER
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