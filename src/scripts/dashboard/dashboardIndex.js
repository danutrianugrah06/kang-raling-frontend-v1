import { useAuthStore } from "@/store/auth";
import api from "@/services/api";

const BULAN_SINGKAT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];
const BULAN_FULL = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export default {
  data() {
    const now = new Date();
    return {
      loading: true,
      formattedDate: "",
      formattedTime: "",
      clockInterval: null,

      stats: {
        total_tps: null,
        volume_sampah: null,
        sampah_terkelola: null,
        total_desa: null,
        total_pengajuan: null,
        diterima: null,
        dikembalikan: null,
        belum_diverifikasi: null,
        data_terinput: null,
        verifikasi_tertunda: null,
      },
      chartData: [],
      selectedYear: now.getFullYear(),
      availableYears: [
        now.getFullYear(),
        now.getFullYear() - 1,
        now.getFullYear() - 2,
      ],
      downloadingPdf: false,
      toast: { show: false, message: "", type: "success" },
    };
  },

  computed: {
    // 0. Ambil nama lengkap user dari memori Pinia
    currentName() {
      const store = useAuthStore();
      return store.user?.name || store.user?.nama || this.currentRole;
    },

    // 1. Ambil wujud yang sedang aktif secara real-time dari Pinia
    currentRole() {
      return useAuthStore().currentRole || "Fasilitator";
    },

    // 2. Tentukan apakah perlu menampilkan kolom kanan (Aksi Cepat)
    showRightCol() {
      return ["Administrator", "Fasilitator"].includes(this.currentRole);
    },

    // 3. Kelas warna untuk Banner (DIBUAT UNIVERSAL UNTUK SEMUA ROLE / RBAC)
    welcomeClass() {
      return "welcome-universal";
    },

    // 4. Deskripsi Banner dinamis (DIBUAT UNIVERSAL)
    welcomeDesc() {
      return "Selamat datang di panel kontrol Kang Raling. Kelola, pantau, dan analisis data lingkungan dengan mudah melalui dashboard terpadu ini.";
    },
  },

  watch: {
    // Jika user mengganti dropdown Role, muat ulang data statistik yang sesuai
    currentRole() {
      this.loadDashboard();
    },
  },

  mounted() {
    this.updateClock();
    this.clockInterval = setInterval(this.updateClock, 1000);
    this.loadDashboard();
    this.loadChartData();
  },

  beforeUnmount() {
    clearInterval(this.clockInterval);
  },

  methods: {
    updateClock() {
      const now = new Date();
      this.formattedDate = now.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      this.formattedTime = now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    },

    async loadDashboard() {
      this.loading = true;
      try {
        const res = await api.get("/dashboard");
        const data = res.data || {};

        // Statistik umum (muncul untuk SEMUA role)
        this.stats.total_tps = data.total_desa ?? 0;
        this.stats.total_desa = data.total_desa ?? 0;
        this.stats.volume_sampah = Number(data.total_sampah) ?? 0;
        this.stats.sampah_terkelola = Number(data.total_sampah) ?? 0;

        // Reset data spesifik sebelum diisi
        this.stats.data_terinput = 0;
        this.stats.verifikasi_tertunda = 0;
        this.stats.total_pengajuan = 0;
        this.stats.diterima = 0;
        this.stats.dikembalikan = 0;
        this.stats.belum_diverifikasi = 0;

        // BUG FIX: Menghitung jumlah BARIS DATA (Total Entri) berdasarkan status.
        // Diterima + Dikembalikan + Pending = Total Entri.
        const totalEntriRiil =
          (Number(data.diterima) || 0) +
          (Number(data.dikembalikan) || 0) +
          (Number(data.total_pending) || 0);

        // Isi data spesifik berdasarkan Wujud Aktif
        if (this.currentRole === "Administrator") {
          this.stats.data_terinput =
            data.total_entri !== undefined ? data.total_entri : totalEntriRiil; // Sekarang nampil 3, bukan 6.6!
          this.stats.verifikasi_tertunda = data.total_pending ?? 0;
          this.stats.diterima = data.diterima ?? 0;
          this.stats.dikembalikan = data.dikembalikan ?? 0;
        } else if (this.currentRole === "Fasilitator") {
          this.stats.total_pengajuan =
            data.total_entri !== undefined ? data.total_entri : totalEntriRiil; // Sama, sekarang nampil riilnya
          this.stats.diterima = data.diterima ?? 0;
          this.stats.dikembalikan = data.dikembalikan ?? 0;
          this.stats.belum_diverifikasi = data.total_pending ?? 0;
        }
      } catch {
        this.showToast("Gagal memuat data dashboard", "error");
      } finally {
        this.loading = false;
      }
    },

    async loadChartData() {
      try {
        // Coba ambil data, bisa dari endpoint publik atau endpoint utama
        const res = await api.get("/data-sampah/publik", {
          params: { per_page: 9999 },
        });

        // 1. Ekstrak data SUPER AMAN (Menangani berbagai jenis Pagination Laravel)
        let rawData = [];
        if (Array.isArray(res.data)) {
          rawData = res.data;
        } else if (res.data && Array.isArray(res.data.data)) {
          rawData = res.data.data;
        } else if (
          res.data &&
          res.data.data &&
          Array.isArray(res.data.data.data)
        ) {
          rawData = res.data.data.data;
        }

        const bulanMap = {};
        for (let i = 1; i <= 12; i++) bulanMap[i] = 0;

        rawData.forEach((item) => {
          // Ambil properti tanggal mana yang tersedia
          let tglRaw = item.tanggal || item.created_at || item.tanggal_input;
          if (!tglRaw) return;

          let tgl;
          // 2. ANTI-ERROR FORMAT TANGGAL
          // Jika format dari Laravel adalah DD-MM-YYYY (misal: 16-06-2026)
          if (
            typeof tglRaw === "string" &&
            tglRaw.match(/^\d{2}[-/]\d{2}[-/]\d{4}/)
          ) {
            const parts = tglRaw.split(/[-/]/);
            // Ubah paksa ke standar Internasional YYYY-MM-DD
            tgl = new Date(
              `${parts[2].substring(0, 4)}-${parts[1]}-${parts[0]}`,
            );
          } else {
            tgl = new Date(tglRaw); // Format standar YYYY-MM-DD aman
          }

          if (isNaN(tgl.getTime())) return;

          const tahunData = tgl.getFullYear();
          const bulan = tgl.getMonth() + 1;

          if (tahunData == this.selectedYear) {
            // 3. Deteksi pintar nama kolom jumlah sampah (berapapun namanya di backend)
            const nilai =
              Number(item.jumlah) ||
              Number(item.volume) ||
              Number(item.volume_sampah) ||
              Number(item.total_sampah) ||
              0;
            bulanMap[bulan] += nilai;
          }
        });

        const hasil = [];
        for (let i = 1; i <= 12; i++) {
          hasil.push({
            bulan: BULAN_FULL[i - 1],
            bulan_singkat: BULAN_SINGKAT[i - 1],
            jumlah: bulanMap[i],
          });
        }

        const adaData = hasil.some((h) => h.jumlah > 0);
        this.chartData = adaData ? hasil : [];
      } catch (error) {
        console.error("Gagal menggambar grafik:", error);
        this.chartData = [];
      }
    },

    getBarHeight(value) {
      if (!this.chartData.length) return 0;
      const max = Math.max(...this.chartData.map((d) => d.jumlah));
      if (max === 0) return 0;
      return Math.max((value / max) * 100, value > 0 ? 6 : 0);
    },

    downloadPanduan() {
      window.open(
        "http://localhost:8000/panduan/panduan-kang-raling.pdf",
        "_blank",
      );
    },

    showToast(message, type = "success") {
      this.toast = { show: true, message, type };
      setTimeout(() => {
        this.toast.show = false;
      }, 3000);
    },
  },
};
