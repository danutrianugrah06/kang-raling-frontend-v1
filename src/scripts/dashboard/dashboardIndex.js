import { useAuthStore } from "@/store/auth";
import api from "@/services/api";

// Konstanta nama bulan (singkat dan full) untuk grafik
const BULAN_SINGKAT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const BULAN_FULL   = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

export default {
  data() {
    const now = new Date();
    return {
      loading: true,                    // Status loading data dashboard
      formattedDate: "",                // String tanggal lengkap (tidak digunakan di template, tapi dipertahankan)
      formattedTime: "",                // String waktu (tidak digunakan di template, tapi dipertahankan)
      clockInterval: null,              // Interval update jam (tidak digunakan di template, tapi dipertahankan)
      stats: {                          // Objek statistik dari API
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
      chartData: [],                    // Data grafik bulanan [{ bulan, bulan_singkat, jumlah }]
      selectedYear: now.getFullYear(),  // Tahun yang dipilih untuk grafik
      availableYears: [                 // Tahun yang tersedia untuk dipilih (tahun sekarang -2 s/d sekarang)
        now.getFullYear(),
        now.getFullYear() - 1,
        now.getFullYear() - 2,
      ],
      downloadingPdf: false,            // Status unduh PDF (tidak digunakan secara aktif, tapi dipertahankan)
      toast: { show: false, message: "", type: "success" }, // Notifikasi toast
    };
  },

  computed: {
    // Cek apakah pengguna adalah admin (berdasarkan role di store auth)
    isAdmin() {
      return useAuthStore().isAdmin;
    },
    // Nama pengguna (tidak digunakan di template, tapi dipertahankan)
    userName() {
      return useAuthStore().user?.nama || "Pengguna";
    },
  },

  mounted() {
    this.updateClock();                         // Set jam pertama kali
    this.clockInterval = setInterval(this.updateClock, 1000); // Update setiap detik
    this.loadDashboard();                       // Ambil data dashboard
    this.loadChartData();                       // Ambil data grafik
  },

  beforeUnmount() {
    clearInterval(this.clockInterval);          // Bersihkan interval saat komponen dihancurkan
  },

  methods: {
    /**
     * Update jam dan tanggal (real-time)
     * Meskipun tidak ditampilkan di template, fungsi ini tetap dijalankan untuk kebutuhan jika ada perubahan.
     */
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

    /**
     * Muat data dashboard dari API (/dashboard)
     * - Menentukan role (admin atau fasilitator) dan memetakan respons ke stats.
     */
    async loadDashboard() {
      this.loading = true;
      try {
        const res = await api.get("/dashboard");
        const data = res.data || {};

        // Statistik umum (semua role)
        this.stats.total_tps = data.total_desa ?? 0;
        this.stats.total_desa = data.total_desa ?? 0;
        this.stats.volume_sampah = Number(data.total_sampah) ?? 0;
        this.stats.sampah_terkelola = Number(data.total_sampah) ?? 0;

        // Statistik berdasarkan role
        if (this.isAdmin) {
          this.stats.data_terinput = Number(data.total_sampah) ?? 0;
          this.stats.verifikasi_tertunda = data.total_pending ?? 0;
          this.stats.diterima = data.diterima ?? 0;
          this.stats.dikembalikan = data.dikembalikan ?? 0;
        } else {
          this.stats.total_pengajuan = Number(data.total_sampah) ?? 0;
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

    /**
     * Muat data grafik volume sampah per bulan (hanya data yang sudah diverifikasi)
     * - Filter berdasarkan tahun yang dipilih.
     */
    async loadChartData() {
      try {
        const res = await api.get("/data-sampah/publik", {
          params: { per_page: 9999 },
        });

        const rawData = res.data?.data ?? [];

        // Inisialisasi map bulan (1..12) dengan nilai 0
        const bulanMap = {};
        for (let i = 1; i <= 12; i++) bulanMap[i] = 0;

        // Akumulasi jumlah sampah per bulan berdasarkan tahun yang dipilih
        rawData.forEach((item) => {
          if (item.status === "verified") {
            const tgl = new Date(item.tanggal);
            const tahunData = tgl.getFullYear();
            const bulan = tgl.getMonth() + 1;
            if (tahunData === this.selectedYear) {
              bulanMap[bulan] += Number(item.jumlah) || 0;
            }
          }
        });

        // Bentuk array chartData (12 bulan)
        const hasil = [];
        for (let i = 1; i <= 12; i++) {
          hasil.push({
            bulan: BULAN_FULL[i - 1],
            bulan_singkat: BULAN_SINGKAT[i - 1],
            jumlah: bulanMap[i],
          });
        }

        // Tampilkan grafik hanya jika ada data > 0
        const adaData = hasil.some((h) => h.jumlah > 0);
        this.chartData = adaData ? hasil : [];
      } catch {
        this.chartData = [];
      }
    },

    /**
     * Hitung tinggi bar chart dalam persen (relative terhadap nilai maksimum)
     * @param {number} value - Jumlah sampah untuk bulan tertentu
     * @returns {number} - Tinggi dalam persen (0-100), minimal 4px untuk nilai >0 agar terlihat
     */
    getBarHeight(value) {
      if (!this.chartData.length) return 0;
      const max = Math.max(...this.chartData.map((d) => d.jumlah));
      if (max === 0) return 0;
      // Nilai minimal 6% agar batang tetap terlihat meskipun kecil
      return Math.max((value / max) * 100, value > 0 ? 6 : 0);
    },

    /**
     * Unduh PDF panduan (membuka tab baru dengan URL file PDF)
     */
    downloadPanduan() {
      window.open("http://localhost:8000/panduan/panduan-kang-raling.pdf", "_blank");
    },

    /**
     * Tampilkan toast notifikasi (sukses/error) yang hilang setelah 3 detik.
     * @param {string} message - Pesan yang ditampilkan
     * @param {string} type - 'success' atau 'error'
     */
    showToast(message, type = "success") {
      this.toast = { show: true, message, type };
      setTimeout(() => {
        this.toast.show = false;
      }, 3000);
    },
  },
};