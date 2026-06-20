import api from "@/services/api.js";

export default {
  data() {
    return {
      dataList: [],

      loading: true,
      loadingSubmit: false,
      loadingHapus: false,
      loadingDropdown: false,
      loadingJenisPengelolaan: false,

      // Pagination & Search
      currentPage: 1,
      lastPage: 1,
      total: 0,
      perPage: 10,
      searchQuery: "",

      // Dropdown Lists
      listDataSampah: [],
      listJenisPengelolaan: [],

      // Modal Form Tambah/Edit
      showModalForm: false,
      modeEdit: false,
      form: {
        id: null,
        data_sampah_id: "",
        jenis_pengelolaan_id: "",
        jumlah: "",
        keterangan: "",
      },

      errors: {},

      // Modal Hapus
      showModalHapus: false,
      modalHapusId: null,

      // Toast
      toasts: [],
      toastCounter: 0,
    };
  },

  // INI DIA YANG TYPO (omputed -> computed)
  computed: {
    pageNumbers() {
      const pages = [];
      const start = Math.max(1, this.currentPage - 2);
      const end = Math.min(this.lastPage, this.currentPage + 2);
      for (let i = start; i <= end; i++) pages.push(i);
      return pages;
    },

    filteredData() {
      if (!Array.isArray(this.dataList)) return [];
      if (!this.searchQuery.trim()) return this.dataList;
      const q = this.searchQuery.toLowerCase();
      return this.dataList.filter((item) => {
        const desa = item?.data_sampah?.desa?.nama_desa?.toLowerCase() || "";
        const jenisSampah =
          item?.data_sampah?.jenis_sampah?.nama?.toLowerCase() || "";
        const jenisKelola = item?.jenis_pengelolaan?.nama?.toLowerCase() || "";
        const ket = item?.keterangan?.toLowerCase() || "";
        return (
          desa.includes(q) ||
          jenisSampah.includes(q) ||
          jenisKelola.includes(q) ||
          ket.includes(q)
        );
      });
    },

    // FITUR BARU: Deteksi Otomatis Batas Maksimal Sampah
    maxJumlahPengelolaan() {
      if (!this.form.data_sampah_id) return null;
      // Cari data sampah yang sedang dipilih di dropdown
      const selected = this.listDataSampah.find(
        (ds) => ds?.id === this.form.data_sampah_id,
      );
      return selected ? parseFloat(selected.jumlah) : null;
    },
  },

  mounted() {
    this.fetchData();
  },

  methods: {
    // FETCH DATA
    async fetchData(page = 1) {
      this.loading = true;
      try {
        const res = await api.get("/data-pengelolaan", {
          params: { page: page, per_page: this.perPage },
        });
        const d = res.data;

        // Membongkar data pagination Laravel
        const isPaginatorInsideData =
          d.data && typeof d.data === "object" && !Array.isArray(d.data);
        const paginator = isPaginatorInsideData ? d.data : d;

        this.dataList = Array.isArray(paginator.data) ? paginator.data : [];
        this.currentPage = paginator.current_page || 1;
        this.lastPage = paginator.last_page || 1;
        this.total = paginator.total || 0;
      } catch {
        this.showToast("Gagal memuat data pengelolaan.", "error");
      } finally {
        this.loading = false;
      }
    },

    goToPage(page) {
      if (page < 1 || page > this.lastPage) return;
      this.fetchData(page);
    },

    // FETCH DROPDOWNS
    async fetchDropdownDataSampah() {
      this.loadingDropdown = true;
      try {
        const res = await api.get("/data-sampah", {
          params: { per_page: 999 },
        });
        // Memastikan tidak terbungkus pagination secara dalam
        let semua = [];
        if (res.data && res.data.data && Array.isArray(res.data.data.data)) {
          semua = res.data.data.data;
        } else if (res.data && Array.isArray(res.data.data)) {
          semua = res.data.data;
        } else if (Array.isArray(res.data)) {
          semua = res.data;
        }

        // Hanya data sampah dengan status 'verified' dan belum memiliki pengelolaan
        this.listDataSampah = semua.filter(
          (ds) =>
            ds?.status === "verified" &&
            (!ds?.pengelolaans || ds?.pengelolaans.length === 0),
        );
      } catch {
        this.showToast("Gagal memuat daftar data sampah.", "error");
      } finally {
        this.loadingDropdown = false;
      }
    },

    async fetchJenisPengelolaan() {
      this.loadingJenisPengelolaan = true;
      try {
        const res = await api.get("/jenis-pengelolaan");
        // Memastikan tidak terbungkus
        let semua = [];
        if (res.data && res.data.data && Array.isArray(res.data.data.data)) {
          semua = res.data.data.data;
        } else if (res.data && Array.isArray(res.data.data)) {
          semua = res.data.data;
        } else if (Array.isArray(res.data)) {
          semua = res.data;
        }

        this.listJenisPengelolaan = semua;
      } catch {
        this.showToast("Gagal memuat jenis pengelolaan.", "error");
      } finally {
        this.loadingJenisPengelolaan = false;
      }
    },

    // FORM TAMBAH / EDIT
    async bukaModalForm() {
      this.modeEdit = false;
      this.form = {
        id: null,
        data_sampah_id: "",
        jenis_pengelolaan_id: "",
        jumlah: "",
        keterangan: "",
      };
      this.errors = {};
      this.showModalForm = true;

      // Load dropdowns paralel
      await Promise.all([
        this.fetchDropdownDataSampah(),
        this.fetchJenisPengelolaan(),
      ]);
    },

    async bukaModalEdit(item) {
      this.modeEdit = true;
      this.form = {
        id: item.id,
        data_sampah_id: item.data_sampah_id,
        jenis_pengelolaan_id: item.jenis_pengelolaan_id,
        jumlah: item.jumlah,
        keterangan: item.keterangan || "",
      };
      this.errors = {};
      this.showModalForm = true;
      // Pada edit, kita set listDataSampah hanya dengan data yang sedang aktif
      await this.fetchJenisPengelolaan();
      this.listDataSampah = item.data_sampah ? [item.data_sampah] : [];
    },

    tutupModalForm() {
      this.showModalForm = false;
    },

    async simpanData() {
      this.errors = {};
      let hasError = false;
      if (!this.form.data_sampah_id) {
        this.errors.data_sampah_id = "Data sampah wajib dipilih.";
        hasError = true;
      }
      if (!this.form.jenis_pengelolaan_id) {
        this.errors.jenis_pengelolaan_id = "Jenis pengelolaan wajib dipilih.";
        hasError = true;
      }

      // FITUR BARU: Validasi Cegah Bobol
      const maxVal = this.maxJumlahPengelolaan;
      if (!this.form.jumlah || Number(this.form.jumlah) <= 0) {
        this.errors.jumlah = "Jumlah wajib diisi (minimal 0.01).";
        hasError = true;
      } else if (maxVal !== null && Number(this.form.jumlah) > maxVal) {
        // Tembak error jika melebihi batas sampah mentahnya
        this.errors.jumlah = `Maksimal pengelolaan untuk sampah ini adalah ${this.formatAngka(maxVal)} Kg.`;
        hasError = true;
      }

      if (hasError) return;

      this.loadingSubmit = true;
      try {
        const payload = {
          data_sampah_id: this.form.data_sampah_id,
          jenis_pengelolaan_id: this.form.jenis_pengelolaan_id,
          jumlah: Number(this.form.jumlah),
          keterangan: this.form.keterangan ? this.form.keterangan.trim() : "",
        };
        if (this.modeEdit) {
          await api.put(`/data-pengelolaan/${this.form.id}`, payload);
          this.showToast("Data pengelolaan berhasil diperbarui.", "success");
        } else {
          await api.post("/data-pengelolaan", payload);
          this.showToast("Data pengelolaan berhasil ditambahkan.", "success");
        }

        this.tutupModalForm();
        this.fetchData(this.currentPage);
      } catch (err) {
        if (err.response?.status === 422) {
          const errs = err.response.data.errors;
          if (errs?.data_sampah_id)
            this.errors.data_sampah_id = errs.data_sampah_id[0];
          if (errs?.jenis_pengelolaan_id)
            this.errors.jenis_pengelolaan_id = errs.jenis_pengelolaan_id[0];
          if (errs?.jumlah) this.errors.jumlah = errs.jumlah[0];
        } else {
          this.showToast("Terjadi kesalahan. Coba lagi.", "error");
        }
      } finally {
        this.loadingSubmit = false;
      }
    },

    // MODAL HAPUS
    konfirmasiHapus(item) {
      // Menyimpan ID dan memunculkan Modal Konfirmasi Hapus buatanmu
      this.modalHapusId = item.id;
      this.showModalHapus = true;
    },

    tutupModalHapus() {
      this.showModalHapus = false;
      this.modalHapusId = null;
    },

    async hapusData() {
      this.loadingHapus = true;
      try {
        // Eksekusi API untuk menghapus data di database
        await api.delete(`/data-pengelolaan/${this.modalHapusId}`);
        this.showToast("Data berhasil dihapus.", "success");
        
        // Tutup modal secara otomatis
        this.tutupModalHapus();

        // Mundur satu halaman jika data yang dihapus adalah data terakhir di halaman tersebut
        if (this.dataList.length === 1 && this.currentPage > 1) {
          this.currentPage--;
        }
        
        // Tarik ulang data terbaru untuk merefresh tabel
        this.fetchData(this.currentPage);
        
      } catch (err) {
        // Tangkap pesan error jika Laravel menolak (misal: karena Hak Akses)
        if (err.response?.data?.message) {
          this.showToast(err.response.data.message, "error");
        } else {
          this.showToast("Gagal menghapus data. Cek koneksi server.", "error");
        }
      } finally {
        this.loadingHapus = false;
      }
    },

    // HELPER
    formatTanggal(val) {
      if (!val) return "-";
      return new Date(val).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    },

    formatAngka(n) {
      if (!n && n !== 0) return "0";
      return Number(n).toLocaleString("id-ID");
    },

    showToast(message, type = "info") {
      const id = ++this.toastCounter;
      this.toasts.push({ id, message, type });
      setTimeout(() => {
        this.toasts = this.toasts.filter((t) => t.id !== id);
      }, 3500);
    },

    toastIcon(type) {
      const map = {
        success: "bi-check-circle-fill",
        error: "bi-x-circle-fill",
        info: "bi-info-circle-fill",
      };
      return map[type] || "bi-info-circle-fill";
    },
  },
};