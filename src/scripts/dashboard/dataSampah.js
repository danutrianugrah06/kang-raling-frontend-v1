import api from '@/services/api.js'

export default {
  data() {
    return {
      isAdmin: false,
      dataList: [],
      desasList: [],
      jenisSampahList: [],
      
      loading: true,
      loadingSubmit: false,
      loadingHapus: false,
      
      currentPage: 1,
      lastPage: 1,
      total: 0,
      perPage: 10,
      searchQuery: '',
      searchTimeout: null,

      showModalForm: false,
      modeEdit: false,
      form: {
        id: null,
        desa_id: '',
        tanggal: '',
        status: '',
        catatan_penolakan: '',
        items: [
          { jenis_sampah_id: '', jumlah: '' }
        ]
      },
      errors: {},
      originalEditIds: [], // Menyimpan ID item asli saat edit (untuk mendeteksi jika ada baris yang dihapus)

      showModalVerifikasi: false,
      itemVerifikasi: null,
      formVerifikasi: {
        status: 'disetujui',
        catatan_penolakan: ''
      },

      panelDitolakTerbuka: true,
      showModalHapus: false,
      modalHapusIds: [], // Menggunakan array karena 1 baris grup bisa berisi banyak ID

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
    
    // 🔥 LOGIKA GROUPING (Meringkas banyak baris jadi 1 kesatuan)
    groupedData() {
      if (!Array.isArray(this.dataList)) return [];

      let list = this.dataList;
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase();
        list = list.filter(item => 
          (item?.desa?.nama_desa || '').toLowerCase().includes(q) ||
          (item?.jenis_sampah?.nama || '').toLowerCase().includes(q) ||
          (item?.status || '').toLowerCase().includes(q)
        );
      }

      const map = new Map();
      const grouped = [];

      list.forEach(item => {
        // Kunci penggabungan: Desa yang sama, Tanggal yang sama, Status yang sama
        const key = `${item.desa_id}_${item.tanggal}_${item.status}`;
        
        if (!map.has(key)) {
          map.set(key, {
            desa_id: item.desa_id,
            desa: item.desa,
            tanggal: item.tanggal,
            status: item.status,
            user: item.user,
            catatan_penolakan: item.catatan_penolakan,
            items: [{ id: item.id, jenis_sampah_id: item.jenis_sampah_id, jenis_sampah: item.jenis_sampah, jumlah: item.jumlah }],
            total_jumlah: Number(item.jumlah)
          });
          grouped.push(map.get(key));
        } else {
          const group = map.get(key);
          group.items.push({ id: item.id, jenis_sampah_id: item.jenis_sampah_id, jenis_sampah: item.jenis_sampah, jumlah: item.jumlah });
          group.total_jumlah += Number(item.jumlah);
        }
      });

      return grouped;
    },

    dataDitolak() {
      return this.groupedData.filter(item => item.status === 'ditolak' || item.status === 'rejected');
    },

    todayDate() {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }
  },

  mounted() {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    this.isAdmin = user.role === 'administrator'
    this.fetchData()
    this.fetchDesas()
    this.fetchJenisSampah()
  },

  methods: {
    async fetchData() {
      this.loading = true
      try {
        const res = await api.get('/data-sampah', { params: { page: this.currentPage, per_page: this.perPage } })
        const d = res.data;
        const paginator = (d.data && typeof d.data === 'object' && !Array.isArray(d.data)) ? d.data : d;
        this.dataList = Array.isArray(paginator.data) ? paginator.data : [];
        this.currentPage = paginator.current_page || 1;
        this.lastPage = paginator.last_page || 1;
        this.total = paginator.total || 0;
      } catch {
        this.showToast('Gagal memuat data sampah.', 'error')
      } finally {
        this.loading = false
      }
    },

    async fetchDesas() {
      try {
        const res = await api.get('/desas')
        this.desasList = res.data.data || res.data
      } catch (e) {}
    },

    async fetchJenisSampah() {
      try {
        const res = await api.get('/jenis-sampah')
        this.jenisSampahList = res.data.data || res.data
      } catch (e) {}
    },

    onSearch() {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => { this.currentPage = 1; this.fetchData() }, 400)
    },

    goToPage(page) {
      if (page < 1 || page > this.lastPage) return
      this.currentPage = page
      this.fetchData()
    },

    bukaModalTambah() {
      this.modeEdit = false
      this.form = {
        id: null,
        desa_id: '',
        tanggal: new Date().toISOString().split('T')[0],
        status: '',
        catatan_penolakan: '',
        items: [{ jenis_sampah_id: '', jumlah: '' }, { jenis_sampah_id: '', jumlah: '' }, { jenis_sampah_id: '', jumlah: '' }]
      }
      this.originalEditIds = []
      this.errors = {}
      this.showModalForm = true
    },

    bukaModalEdit(group) {
      this.modeEdit = true
      this.originalEditIds = group.items.map(i => i.id)

      // PERBAIKAN: Paksa ubah format tanggal apapun dari API menjadi murni YYYY-MM-DD
      let tanggalBaku = '';
      if (group.tanggal) {
        const d = new Date(group.tanggal);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        tanggalBaku = `${yyyy}-${mm}-${dd}`;
      }

      this.form = {
        desa_id: group.desa_id,
        tanggal: tanggalBaku,
        status: group.status || 'menunggu',
        catatan_penolakan: group.catatan_penolakan || '',
        items: group.items.map(i => ({ id: i.id, jenis_sampah_id: i.jenis_sampah_id, jumlah: i.jumlah }))
      }
      this.errors = {}
      this.showModalForm = true
    },

    tutupModalForm() { this.showModalForm = false },

    tambahBarisSampah() { this.form.items.push({ id: null, jenis_sampah_id: '', jumlah: '' }) },

    hapusBarisSampah(index) { if (this.form.items.length > 1) this.form.items.splice(index, 1) },

    async simpanData() {
      this.errors = {}
      let hasError = false

      if (!this.form.desa_id) { this.errors.desa_id = 'Desa wajib dipilih.'; hasError = true }

      if (!this.form.tanggal) { 
        this.errors.tanggal = 'Tanggal wajib diisi.'
        hasError = true 
      } else {
        const inputDate = new Date(this.form.tanggal).setHours(0,0,0,0);
        const todayDate = new Date().setHours(0,0,0,0);
        if (inputDate > todayDate) {
          this.errors.tanggal = 'Tidak bisa mencatat untuk hari esok.';
          this.showToast('Validasi gagal. Cek kembali form isian.', 'error');
          hasError = true;
        }
      }
      
      const validItems = this.form.items.filter(i => i.jenis_sampah_id && i.jumlah)
      if (validItems.length === 0) { this.errors.items = 'Minimal satu jenis sampah dan jumlah harus diisi.'; hasError = true }

      if (hasError) return

      this.loadingSubmit = true
      try {
        if (this.modeEdit) {
          // Cari item yang dihapus oleh user saat edit
          const currentIds = validItems.map(i => i.id).filter(id => id);
          const deletedIds = this.originalEditIds.filter(id => !currentIds.includes(id));
          
          // Hapus dari database
          if(deletedIds.length > 0) {
            await Promise.all(deletedIds.map(id => api.delete(`/data-sampah/${id}`)));
          }

          // Update atau Tambah item baru
          const requests = validItems.map(item => {
            const payload = { desa_id: this.form.desa_id, tanggal: this.form.tanggal, jenis_sampah_id: item.jenis_sampah_id, jumlah: item.jumlah, status: 'menunggu' }
            return item.id ? api.put(`/data-sampah/${item.id}`, payload) : api.post('/data-sampah', payload)
          })
          await Promise.all(requests)
        } else {
          // Tambah Baru Sekaligus (Batch)
          const requests = validItems.map(item => {
            const payload = { desa_id: this.form.desa_id, tanggal: this.form.tanggal, jenis_sampah_id: item.jenis_sampah_id, jumlah: item.jumlah }
            return api.post('/data-sampah', payload)
          })
          await Promise.all(requests)
        }

        this.showToast(this.modeEdit ? 'Data berhasil diperbarui.' : 'Entri data sampah berhasil ditambahkan.', 'success')
        this.tutupModalForm()
        this.fetchData()
      } catch {
        this.showToast('Terjadi kesalahan. Coba lagi.', 'error')
      } finally {
        this.loadingSubmit = false
      }
    },

    // Verifikasi (Admin)
    bukaModalVerifikasi(group) {
      this.itemVerifikasi = group
      this.formVerifikasi = { status: 'disetujui', catatan_penolakan: '' }
      this.errors = {}
      this.showModalVerifikasi = true
    },
    tutupModalVerifikasi() {
      this.showModalVerifikasi = false
      this.itemVerifikasi = null
    },
    async submitVerifikasi() {
      this.errors = {}
      if (this.formVerifikasi.status === 'ditolak' && !this.formVerifikasi.catatan_penolakan.trim()) {
        this.errors.catatan_penolakan = 'Catatan penolakan wajib diisi jika menolak data.'
        return
      }
      this.loadingSubmit = true
      try {
        // Verifikasi semua item dalam satu desa & tanggal sekaligus
        const requests = this.itemVerifikasi.items.map(item => {
          const payload = {
            desa_id: this.itemVerifikasi.desa_id,
            tanggal: this.itemVerifikasi.tanggal,
            jenis_sampah_id: item.jenis_sampah_id,
            jumlah: item.jumlah,
            status: this.formVerifikasi.status,
            catatan_penolakan: this.formVerifikasi.status === 'ditolak' ? this.formVerifikasi.catatan_penolakan : ''
          }
          return api.put(`/data-sampah/${item.id}`, payload)
        })
        await Promise.all(requests)

        this.showToast('Verifikasi data berhasil diproses.', 'success')
        this.tutupModalVerifikasi()
        this.fetchData()
      } catch {
        this.showToast('Gagal memproses verifikasi.', 'error')
      } finally {
        this.loadingSubmit = false
      }
    },

    // Hapus
    konfirmasiHapus(group) {
      // Ambil seluruh ID yang ada di dalam grup tersebut
      this.modalHapusIds = group.items.map(i => i.id)
      this.showModalHapus = true
    },
    tutupModalHapus() {
      this.showModalHapus = false
      this.modalHapusIds = []
    },
    async hapusData() {
      this.loadingHapus = true
      try {
        await Promise.all(this.modalHapusIds.map(id => api.delete(`/data-sampah/${id}`)))
        this.showToast('Data kesatuan berhasil dihapus.', 'success')
        this.tutupModalHapus()
        this.fetchData()
      } catch {
        this.showToast('Gagal menghapus data.', 'error')
      } finally {
        this.loadingHapus = false
      }
    },

    // Helper format
    formatTanggal(val) {
      if (!val) return '-'
      return new Date(val).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
    },
    formatAngka(n) {
      if (!n && n !== 0) return '0'
      return Number(n).toLocaleString('id-ID')
    },
    capitalize(str) {
      if (!str) return 'Menunggu';
      
      // Kamus penerjemah khusus untuk tampilan tabel
      const terjemahan = {
        'pending': 'Menunggu',
        'verified': 'Disetujui',
        'rejected': 'Ditolak'
      };

      // Cek apakah kata tersebut ada di kamus, jika ada tampilkan terjemahannya
      return terjemahan[str.toLowerCase()] || (str.charAt(0).toUpperCase() + str.slice(1));
    },
    badgeStatus(status) {
      if (status === 'disetujui') return 'ds-badge-success'
      if (status === 'ditolak') return 'ds-badge-danger'
      return 'ds-badge-warning'
    },
    iconStatus(status) {
      if (status === 'disetujui') return 'bi-check-circle-fill'
      if (status === 'ditolak') return 'bi-x-circle-fill'
      return 'bi-clock-fill'
    },

    showToast(message, type = 'info') {
      const id = ++this.toastCounter
      this.toasts.push({ id, message, type })
      setTimeout(() => this.toasts = this.toasts.filter(t => t.id !== id), 3500)
    },
    toastIcon(type) {
      const map = { success: 'bi-check-circle-fill', error: 'bi-x-circle-fill', info: 'bi-info-circle-fill' }
      return map[type] || 'bi-info-circle-fill'
    }
  }
}