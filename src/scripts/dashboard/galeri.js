import api from "@/services/api.js";

export default {
  data() {
    return {
      // Data utama
      galeris: [],
      loading: true,
      submitting: false,
      deletingId: null,

      // Pagination
      currentPage: 1,
      lastPage: 1,
      total: 0,
      perPage: 12,

      // Pencarian
      searchQuery: "",
      searchTimeout: null,

      // Modal tambah/edit
      showModal: false,
      isEdit: false,
      editId: null,

      // Form data
      form: {
        keterangan: "",
      },
      formGambar: null,
      previewGambar: null,
      existingGambar: null,
      formErrors: {},

      // Modal hapus
      showModalHapus: false,
      hapusId: null,
      hapusKeterangan: "",

      // Toast
      toasts: [],
      toastCounter: 0,
    };
  },

  mounted() {
    this.fetchGaleris();
  },

  methods: {
    // ════════════════════════════════════
    // FETCH DATA
    // ════════════════════════════════════
    /**
     * Ambil data galeri dari API (dengan pagination & pencarian)
     */
    async fetchGaleris() {
      this.loading = true;
      try {
        const params = { page: this.currentPage, per_page: this.perPage };
        if (this.searchQuery.trim()) params.search = this.searchQuery.trim();

        const res = await api.get("/galeris", { params });
        const d = res.data;

        this.galeris = d.data;
        this.currentPage = d.current_page;
        this.lastPage = d.last_page;
        this.total = d.total;
        this.perPage = d.per_page;
      } catch {
        this.showToast("Gagal memuat data galeri.", "error");
      } finally {
        this.loading = false;
      }
    },

    // ════════════════════════════════════
    // PENCARIAN (DEBOUNCE 400ms)
    // ════════════════════════════════════
    onSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.currentPage = 1;
        this.fetchGaleris();
      }, 400);
    },

    // ════════════════════════════════════
    // PAGINATION
    // ════════════════════════════════════
    goToPage(page) {
      if (page < 1 || page > this.lastPage) return;
      this.currentPage = page;
      this.fetchGaleris();
    },

    // ════════════════════════════════════
    // MODAL TAMBAH/EDIT
    // ════════════════════════════════════
    bukaModalTambah() {
      this.isEdit = false;
      this.editId = null;
      this.form = { keterangan: "" };
      this.formGambar = null;
      this.previewGambar = null;
      this.existingGambar = null;
      this.formErrors = {};
      this.showModal = true;
    },

    bukaModalEdit(item) {
      this.isEdit = true;
      this.editId = item.id;
      this.form = {
        keterangan: item.keterangan || "",
      };
      this.formGambar = null;
      this.existingGambar = item.gambar
        ? `http://localhost:8000/storage/${item.gambar}`
        : null;
      this.previewGambar = this.existingGambar;
      this.formErrors = {};
      this.showModal = true;
    },

    tutupModal() {
      this.showModal = false;
    },

    // ════════════════════════════════════
    // UPLOAD GAMBAR (VALIDASI)
    // ════════════════════════════════════
    onGambarChange(event) {
      const file = event.target.files[0];
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) {
        this.showToast("Ukuran gambar maksimal 10MB.", "error");
        return;
      }
      const allowed = ["image/jpeg", "image/png", "image/webp"];
      if (!allowed.includes(file.type)) {
        this.showToast("Format gambar harus JPG, PNG, atau WebP.", "error");
        return;
      }
      this.formGambar = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewGambar = e.target.result;
      };
      reader.readAsDataURL(file);
    },

    hapusPreviewGambar() {
      this.formGambar = null;
      this.previewGambar = null;
      this.existingGambar = null;
    },

    // ════════════════════════════════════
    // SUBMIT FORM (TAMBAH / EDIT)
    // ════════════════════════════════════
    async submitForm() {
      this.formErrors = {};

      if (!this.isEdit && !this.formGambar) {
        this.formErrors.gambar = "Gambar wajib diupload.";
        return;
      }
      if (!this.form.keterangan.trim()) {
        this.formErrors.keterangan = "Keterangan wajib diisi.";
        return;
      }

      this.submitting = true;
      try {
        const fd = new FormData();
        fd.append("keterangan", this.form.keterangan);
        if (this.formGambar) fd.append("gambar", this.formGambar);

        const config = { headers: { "Content-Type": "multipart/form-data" } };

        if (this.isEdit) {
          fd.append("_method", "PUT");
          await api.post(`/galeris/${this.editId}`, fd, config);
          this.showToast("Foto berhasil diperbarui!", "success");
        } else {
          await api.post("/galeris", fd, config);
          this.showToast("Foto berhasil ditambahkan!", "success");
        }

        this.tutupModal();
        this.currentPage = this.isEdit ? this.currentPage : 1;
        this.fetchGaleris();
      } catch (err) {
        if (err.response?.status === 422) {
          const e = err.response.data.errors || {};
          this.formErrors = Object.fromEntries(
            Object.entries(e).map(([k, v]) => [k, v[0]]),
          );
          this.showToast("Periksa kembali isian form.", "error");
        } else {
          this.showToast("Terjadi kesalahan. Coba lagi.", "error");
        }
      } finally {
        this.submitting = false;
      }
    },

    // ════════════════════════════════════
    // HAPUS
    // ════════════════════════════════════
    bukaModalHapus(item) {
      this.hapusId = item.id;
      this.hapusKeterangan = item.keterangan || "foto ini";
      this.showModalHapus = true;
    },

    tutupModalHapus() {
      this.showModalHapus = false;
      this.hapusId = null;
      this.hapusKeterangan = "";
    },

    async konfirmasiHapus() {
      this.deletingId = this.hapusId;
      try {
        await api.delete(`/galeris/${this.hapusId}`);
        this.showToast("Foto berhasil dihapus.", "success");
        this.tutupModalHapus();
        if (this.galeris.length === 1 && this.currentPage > 1) {
          this.currentPage--;
        }
        this.fetchGaleris();
      } catch {
        this.showToast("Gagal menghapus foto.", "error");
      } finally {
        this.deletingId = null;
      }
    },

    // ════════════════════════════════════
    // HELPERS
    // ════════════════════════════════════
    formatTanggal(val) {
      if (!val) return "-";
      return new Date(val).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },

    getGambarUrl(path) {
      if (!path) return null;
      if (path.startsWith("http")) return path;
      return `http://localhost:8000/storage/${path}`;
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