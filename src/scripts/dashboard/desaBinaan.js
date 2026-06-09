import api from "@/services/api.js";

export default {
  data() {
    return {
      // Data utama
      desas: [],
      loading: true,
      submitting: false,
      deletingId: null,

      // Pencarian
      searchQuery: "",
      searchTimeout: null,

      // Accordion: id desa yang sedang terbuka detail TPS-nya
      expandedDesaId: null,

      // Modal Desa
      showModalDesa: false,
      isEditDesa: false,
      editDesaId: null,
      formDesa: { nama_desa: "", alamat: "" },
      formDesaErrors: {},

      // Modal TPS
      showModalTps: false,
      isEditTps: false,
      editTpsId: null,
      tpsDesaId: null,
      tpsDesaNama: "",
      formTps: {
        nama_tps: "",
        nama_pengelola: "",
        nama_fasilitator: "",
        jumlah_warga_terlayani: "",
        kegiatan_tps: "",
        telepon: "",
      },
      formTpsGambar: null,
      previewTpsGambar: null,
      existingTpsGambar: null,
      formTpsErrors: {},

      // Modal Hapus (universal untuk desa atau tps)
      showModalHapus: false,
      hapusMode: "",   // 'desa' atau 'tps'
      hapusId: null,
      hapusNama: "",

      // Toast
      toasts: [],
      toastCounter: 0,
    };
  },

  computed: {
    // Filter desa berdasarkan search query
    filteredDesas() {
      if (!this.searchQuery.trim()) return this.desas;
      const q = this.searchQuery.toLowerCase();
      return this.desas.filter(
        (d) =>
          d.nama_desa.toLowerCase().includes(q) ||
          (d.alamat || "").toLowerCase().includes(q),
      );
    },
  },

  mounted() {
    this.fetchDesas();
  },

  methods: {
    // ════════════════════════════════════
    // FETCH DATA
    // ════════════════════════════════════
    async fetchDesas() {
      this.loading = true;
      try {
        const res = await api.get("/desas");
        this.desas = res.data.data || [];
      } catch {
        this.showToast("Gagal memuat data desa.", "error");
      } finally {
        this.loading = false;
      }
    },

    // ════════════════════════════════════
    // SEARCH (DEBOUNCE)
    // ════════════════════════════════════
    onSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {}, 300); // cukup untuk trigger re-render
    },

    // ════════════════════════════════════
    // ACCORDION TPS
    // ════════════════════════════════════
    toggleAccordion(desaId) {
      this.expandedDesaId = this.expandedDesaId === desaId ? null : desaId;
    },

    // Ambil array profil_tps dari objek desa
    getTps(desa) {
      return desa.profil_tps || [];
    },

    // ════════════════════════════════════
    // MODAL DESA (TAMBAH / EDIT)
    // ════════════════════════════════════
    bukaModalTambahDesa() {
      this.isEditDesa = false;
      this.editDesaId = null;
      this.formDesa = { nama_desa: "", alamat: "" };
      this.formDesaErrors = {};
      this.showModalDesa = true;
    },

    bukaModalEditDesa(desa) {
      this.isEditDesa = true;
      this.editDesaId = desa.id;
      this.formDesa = {
        nama_desa: desa.nama_desa || "",
        alamat: desa.alamat || "",
      };
      this.formDesaErrors = {};
      this.showModalDesa = true;
    },

    tutupModalDesa() {
      this.showModalDesa = false;
    },

    async submitDesa() {
      this.formDesaErrors = {};
      if (!this.formDesa.nama_desa.trim()) {
        this.formDesaErrors.nama_desa = "Nama desa wajib diisi.";
        return;
      }
      this.submitting = true;
      try {
        if (this.isEditDesa) {
          await api.put(`/desas/${this.editDesaId}`, this.formDesa);
          this.showToast("Data desa berhasil diperbarui!", "success");
        } else {
          await api.post("/desas", this.formDesa);
          this.showToast("Desa berhasil ditambahkan!", "success");
        }
        this.tutupModalDesa();
        this.fetchDesas();
      } catch (err) {
        if (err.response?.status === 422) {
          const e = err.response.data.errors || {};
          this.formDesaErrors = Object.fromEntries(
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
    // MODAL TPS (TAMBAH / EDIT)
    // ════════════════════════════════════
    bukaModalTambahTps(desa) {
      this.isEditTps = false;
      this.editTpsId = null;
      this.tpsDesaId = desa.id;
      this.tpsDesaNama = desa.nama_desa;
      this.formTps = {
        nama_tps: "",
        nama_pengelola: "",
        nama_fasilitator: "",
        jumlah_warga_terlayani: "",
        kegiatan_tps: "",
        telepon: "",
      };
      this.formTpsGambar = null;
      this.previewTpsGambar = null;
      this.existingTpsGambar = null;
      this.formTpsErrors = {};
      this.showModalTps = true;
    },

    bukaModalEditTps(tps, desa) {
      this.isEditTps = true;
      this.editTpsId = tps.id;
      this.tpsDesaId = desa.id;
      this.tpsDesaNama = desa.nama_desa;
      this.formTps = {
        nama_tps: tps.nama_tps || "",
        nama_pengelola: tps.nama_pengelola || "",
        nama_fasilitator: tps.nama_fasilitator || "",
        jumlah_warga_terlayani: tps.jumlah_warga_terlayani || "",
        kegiatan_tps: tps.kegiatan_tps || "",
        telepon: tps.telepon || "",
      };
      this.formTpsGambar = null;
      this.existingTpsGambar = tps.gambar ? `http://localhost:8000/storage/${tps.gambar}` : null;
      this.previewTpsGambar = this.existingTpsGambar;
      this.formTpsErrors = {};
      this.showModalTps = true;
    },

    tutupModalTps() {
      this.showModalTps = false;
    },

    // Upload gambar TPS
    onGambarTpsChange(event) {
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
      this.formTpsGambar = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewTpsGambar = e.target.result;
      };
      reader.readAsDataURL(file);
    },

    hapusPreviewGambarTps() {
      this.formTpsGambar = null;
      this.previewTpsGambar = null;
      this.existingTpsGambar = null;
    },

    async submitTps() {
      this.formTpsErrors = {};
      if (!this.formTps.nama_tps.trim()) {
        this.formTpsErrors.nama_tps = "Nama TPS wajib diisi.";
        return;
      }
      if (!this.formTps.nama_pengelola.trim()) {
        this.formTpsErrors.nama_pengelola = "Nama pengelola wajib diisi.";
        return;
      }
      if (!this.formTps.jumlah_warga_terlayani) {
        this.formTpsErrors.jumlah_warga_terlayani = "Jumlah warga terlayani wajib diisi.";
        return;
      }

      this.submitting = true;
      try {
        const fd = new FormData();
        fd.append("desa_id", this.tpsDesaId);
        fd.append("nama_tps", this.formTps.nama_tps);
        fd.append("nama_pengelola", this.formTps.nama_pengelola);
        fd.append("nama_fasilitator", this.formTps.nama_fasilitator);
        fd.append("jumlah_warga_terlayani", this.formTps.jumlah_warga_terlayani);
        fd.append("kegiatan_tps", this.formTps.kegiatan_tps);
        fd.append("telepon", this.formTps.telepon);
        if (this.formTpsGambar) fd.append("gambar", this.formTpsGambar);

        const config = { headers: { "Content-Type": "multipart/form-data" } };

        if (this.isEditTps) {
          fd.append("_method", "PUT");
          await api.post(`/profil-tps/${this.editTpsId}`, fd, config);
          this.showToast("Profil TPS berhasil diperbarui!", "success");
        } else {
          await api.post("/profil-tps", fd, config);
          this.showToast("Profil TPS berhasil ditambahkan!", "success");
        }
        this.tutupModalTps();
        this.fetchDesas();
      } catch (err) {
        if (err.response?.status === 422) {
          const e = err.response.data.errors || {};
          this.formTpsErrors = Object.fromEntries(
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
    // HAPUS (DESA ATAU TPS)
    // ════════════════════════════════════
    bukaModalHapusDesa(desa) {
      this.hapusMode = "desa";
      this.hapusId = desa.id;
      this.hapusNama = desa.nama_desa;
      this.showModalHapus = true;
    },

    bukaModalHapusTps(tps) {
      this.hapusMode = "tps";
      this.hapusId = tps.id;
      this.hapusNama = tps.nama_tps;
      this.showModalHapus = true;
    },

    tutupModalHapus() {
      this.showModalHapus = false;
      this.hapusId = null;
      this.hapusNama = "";
      this.hapusMode = "";
    },

    async konfirmasiHapus() {
      this.deletingId = this.hapusId;
      try {
        if (this.hapusMode === "desa") {
          await api.delete(`/desas/${this.hapusId}`);
          this.showToast("Desa berhasil dihapus.", "success");
          if (this.expandedDesaId === this.hapusId) this.expandedDesaId = null;
        } else {
          await api.delete(`/profil-tps/${this.hapusId}`);
          this.showToast("Profil TPS berhasil dihapus.", "success");
        }
        this.tutupModalHapus();
        this.fetchDesas();
      } catch {
        this.showToast("Gagal menghapus data.", "error");
      } finally {
        this.deletingId = null;
      }
    },

    // ════════════════════════════════════
    // HELPER
    // ════════════════════════════════════
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