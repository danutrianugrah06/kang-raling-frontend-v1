import api from '@/services/api.js'

export default {
  data() {
    return {
      dataList: [],
      
      loading: true,
      loadingAction: null, // Menyimpan ID group yang sedang diproses
      loadingSubmitReject: false,
      
      // Pagination & Search
      currentPage: 1,
      lastPage: 1,
      total: 0,
      perPage: 30,
      searchQuery: '',
      filterStatus: 'pending',
      searchTimeout: null,

      // Modal Reject
      showModalReject: false,
      groupToReject: null,
      catatanPenolakan: '',
      errorCatatan: '',

      // Toast
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

    // Grouping data berdasarkan desa_id, tanggal, user_id
    groupedData() {
      // PENGAMAN SAKTI: Pastikan dataList adalah Array agar .filter() tidak error
      if (!Array.isArray(this.dataList)) return [];

      let result = this.dataList;
      if (this.filterStatus) {
        result = result.filter(item => item?.status === this.filterStatus);
      }
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase();
        result = result.filter(item => 
          (item?.desa?.nama_desa || '').toLowerCase().includes(q)
        );
      }
      
      const groups = {};
      result.forEach(item => {
        // PENGAMAN: Tambahkan ? agar tidak error jika relasi kosong
        const key = `${item?.desa_id}_${item?.tanggal}_${item?.user_id}`;
        if (!groups[key]) {
          groups[key] = {
            id: key,
            desa: item?.desa,
            tanggal: item?.tanggal,
            user: item?.user,
            status: item?.status,
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
    // FETCH DATA
    async fetchData() {
      this.loading = true;
      try {
        const res = await api.get('/data-sampah', {
          params: { page: this.currentPage, per_page: this.perPage }
        });
        
        // BONGKAR BUNGKUS PAGINATION LARAVEL
        const d = res.data;
        const isPaginatorInsideData = d.data && typeof d.data === 'object' && !Array.isArray(d.data);
        const paginator = isPaginatorInsideData ? d.data : d;

        // Paksa simpan sebagai Array murni
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

    // VERIFIKASI LANGSUNG
    async prosesVerify(group) {
      this.loadingAction = group.id;
      try {
        const promises = group.items.map(item => {
          return api.post(`/data-sampah/${item.id}/verify`);
        });
        await Promise.all(promises);
        this.showToast('Data berhasil diverifikasi dan dipublikasikan.', 'success');
        this.fetchData(); 
      } catch {
        this.showToast('Gagal memverifikasi data.', 'error');
      } finally {
        this.loadingAction = null;
      }
    },

    // TOLAK (MODAL)
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
          return api.post(`/data-sampah/${item.id}/reject`, {
            catatan_penolakan: this.catatanPenolakan
          });
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

    // HELPER FORMATTING
    formatTanggal(val) {
      if (!val) return '-';
      return new Date(val).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
    },

    formatAngka(n) {
      if (!n && n !== 0) return '0';
      return Number(n).toLocaleString('id-ID');
    },

    capitalize(str) {
      if (!str) return '';
      return str.charAt(0).toUpperCase() + str.slice(1);
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
      setTimeout(() => {
        this.toasts = this.toasts.filter(t => t.id !== id);
      }, 3500);
    },

    toastIcon(type) {
      const map = {
        success: 'bi-check-circle-fill',
        error:   'bi-x-circle-fill',
        info:    'bi-info-circle-fill',
      };
      return map[type] || 'bi-info-circle-fill';
    }
  }
}