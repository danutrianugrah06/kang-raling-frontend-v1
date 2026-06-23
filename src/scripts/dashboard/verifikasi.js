import api from '@/services/api.js'

export default {
  data() {
    return {
      dataList: [],
      loading: true,
      loadingAction: null,
      loadingSubmitReject: false,
      
      currentPage: 1,
      lastPage: 1,
      total: 0,
      perPage: 30,
      searchQuery: '',
      filterStatus: 'pending',
      searchTimeout: null,

      showModalReject: false,
      groupToReject: null,
      catatanPenolakan: '',
      errorCatatan: '',

      // STATE BARU UNTUK MODAL BATAL VERIFIKASI
      showModalCancel: false,
      groupToCancel: null,

      toasts: [],
      toastCounter: 0,

      // STATE BARU UNTUK MODAL BATAL VERIFIKASI
      showModalCancel: false,
      groupToCancel: null,

      // --- TAMBAHAN BARU: STATE UNTUK MODAL VERIFIKASI ---
      showModalVerify: false,
      groupToVerify: null,

      // --- TAMBAHAN BARU: STATE UNTUK MODAL TOGGLE PUBLIKASI ---
      showModalTogglePublish: false,
      groupToTogglePublish: null,
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

    groupedData() {
      if (!Array.isArray(this.dataList)) return [];

      let result = this.dataList;
      if (this.filterStatus) {
        result = result.filter(item => item?.status === this.filterStatus);
      }
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase();
        result = result.filter(item => (item?.desa?.nama_desa || '').toLowerCase().includes(q));
      }
      
      const groups = {};
      result.forEach(item => {
        const key = `${item?.desa_id}_${item?.tanggal}_${item?.user_id}`;
        if (!groups[key]) {
          groups[key] = {
            id: key,
            desa: item?.desa,
            tanggal: item?.tanggal,
            user: item?.user,
            status: item?.status,
            is_public: !!item?.is_public,
            catatan_penolakan: item?.catatan_penolakan,
            items: []
          };
        }
        groups[key].items.push(item);
      });
      return Object.values(groups);
    }
  },

  watch: {
    searchQuery() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.currentPage = 1;
        this.fetchData();
      }, 300);
    }
  },

  mounted() {
    this.fetchData()
  },

  methods: {
    async fetchData() {
      this.loading = true;
      try {
        const res = await api.get('/data-sampah', {
          params: { page: this.currentPage, per_page: this.perPage }
        });
        const d = res.data;
        const isPaginatorInsideData = d.data && typeof d.data === 'object' && !Array.isArray(d.data);
        const paginator = isPaginatorInsideData ? d.data : d;
        
        this.dataList = Array.isArray(paginator.data) ? paginator.data : [];
        this.currentPage = paginator.current_page || 1;
        this.lastPage = paginator.last_page || 1;
        this.total = paginator.total || 0;
      } catch {
        this.showToast('Gagal memuat data antrean.', 'error');
      } finally {
        this.loading = false;
      }
    },

    goToPage(page) {
      if (page < 1 || page > this.lastPage) return;
      this.currentPage = page;
      this.fetchData();
    },

    // --- FITUR VERIFIKASI (MODAL CUSTOM) ---
    bukaModalVerify(group) {
      this.groupToVerify = group;
      this.showModalVerify = true;
    },
    tutupModalVerify() {
      this.showModalVerify = false;
      this.groupToVerify = null;
    },
    async submitVerify() {
      this.loadingAction = 'verify';
      try {
        const promises = this.groupToVerify.items.map(item => api.post(`/data-sampah/${item.id}/verify`));
        await Promise.all(promises);
        this.showToast('Data berhasil diverifikasi dan langsung tayang ke Publik.', 'success');
        this.tutupModalVerify();
        this.fetchData(); 
      } catch {
        this.showToast('Gagal memverifikasi data.', 'error');
      } finally {
        this.loadingAction = null;
      }
    },

    // --- FITUR BATAL (MODAL CUSTOM) ---
    bukaModalCancel(group) {
      this.groupToCancel = group;
      this.showModalCancel = true;
    },
    tutupModalCancel() {
      this.showModalCancel = false;
      this.groupToCancel = null;
    },
    async submitCancelVerify() {
      this.loadingAction = 'cancel';
      try {
        const requests = this.groupToCancel.items.map(item => api.post(`/data-sampah/${item.id}/cancel-verify`));
        await Promise.all(requests);
        this.showToast('Verifikasi dibatalkan. Status dikembalikan ke Pending.', 'info');
        this.tutupModalCancel();
        this.fetchData();
      } catch {
        this.showToast('Gagal membatalkan verifikasi.', 'error');
      } finally {
        this.loadingAction = null;
      }
    },

    // --- FITUR TOGGLE PUBLIKASI ---
    // --- FITUR TOGGLE PUBLIKASI (MODAL CUSTOM) ---
    bukaModalTogglePublish(group) {
      this.groupToTogglePublish = group;
      this.showModalTogglePublish = true;
    },
    tutupModalTogglePublish() {
      this.showModalTogglePublish = false;
      this.groupToTogglePublish = null;
    },
    async submitTogglePublish() {
      this.loadingAction = 'pub';
      const group = this.groupToTogglePublish;
      try {
        const requests = group.items.map(item => api.post(`/data-sampah/${item.id}/toggle-publish`));
        await Promise.all(requests);
        
        const isNowPublic = !group.is_public;
        this.showToast(isNowPublic ? 'Data resmi ditayangkan ke Publik.' : 'Data ditarik dari halaman Publik.', 'success');
        this.tutupModalTogglePublish();
        this.fetchData();
      } catch {
        this.showToast('Gagal mengubah status tayang.', 'error');
      } finally {
        this.loadingAction = null;
      }
    },

    bukaModalReject(group) {
      this.groupToReject = group;
      this.catatanPenolakan = '';
      this.errorCatatan = '';
      this.showModalReject = true;
    },
    tutupModalReject() {
      this.showModalReject = false;
      this.groupToReject = null;
    },
    async submitReject() {
      this.errorCatatan = '';
      if (!this.catatanPenolakan.trim()) {
        this.errorCatatan = 'Catatan penolakan wajib diisi.';
        return;
      }
      this.loadingSubmitReject = true;
      try {
        const promises = this.groupToReject.items.map(item => {
          return api.post(`/data-sampah/${item.id}/reject`, { catatan_penolakan: this.catatanPenolakan });
        });
        await Promise.all(promises);
        this.showToast('Penolakan berhasil dikirim ke Fasilitator.', 'success');
        this.tutupModalReject();
        this.fetchData();
      } catch {
        this.showToast('Gagal mengirim penolakan.', 'error');
      } finally {
        this.loadingSubmitReject = false;
      }
    },

    formatTanggal(val) {
      if (!val) return '-';
      return new Date(val).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    },
    formatAngka(n) {
      if (!n && n !== 0) return '0';
      return Number(n).toLocaleString('id-ID');
    },
    capitalize(str) {
      if (!str) return 'Menunggu';
      
      // Kamus penerjemah khusus untuk tampilan tabel
      const terjemahan = {
        'pending': 'Menunggu',
        'verified': 'Disetujui',
        'rejected': 'Ditolak'
      };

      return terjemahan[str.toLowerCase()] || (str.charAt(0).toUpperCase() + str.slice(1));
    },
    badgeStatus(status) {
      if (status === 'verified') return 'vs-badge-success';
      if (status === 'rejected') return 'vs-badge-danger';
      return 'vs-badge-warning';
    },
    iconStatus(status) {
      if (status === 'verified') return 'bi-check-circle-fill';
      if (status === 'rejected') return 'bi-x-circle-fill';
      return 'bi-clock-fill';
    },
    showToast(message, type = 'info') {
      const id = ++this.toastCounter;
      this.toasts.push({ id, message, type });
      setTimeout(() => { this.toasts = this.toasts.filter(t => t.id !== id); }, 3500);
    },
    toastIcon(type) {
      const map = { success: 'bi-check-circle-fill', error: 'bi-x-circle-fill', info: 'bi-info-circle-fill' };
      return map[type] || 'bi-info-circle-fill';
    }
  }
}