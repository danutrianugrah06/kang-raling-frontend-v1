import api from "@/services/api.js";

export default {
  data() {
    const now = new Date();
    return {
      generating: false,
      laporanReady: false,
      filter: {
        bulan: String(now.getMonth() + 1).padStart(2, "0"),
        tahun: now.getFullYear(),
        desa_id: "",
      },
      daftarDesa: [],

      tabelSampah: [],
      tabelPengelolaan: [],

      ringkasan: {
        total_sampah: 0,
        total_dikelola: 0,
        organik: 0,
        anorganik: 0,
        residu: 0,
      },

      daftarBulan: [
        { value: "01", label: "Januari" },
        { value: "02", label: "Februari" },
        { value: "03", label: "Maret" },
        { value: "04", label: "April" },
        { value: "05", label: "Mei" },
        { value: "06", label: "Juni" },
        { value: "07", label: "Juli" },
        { value: "08", label: "Agustus" },
        { value: "09", label: "September" },
        { value: "10", label: "Oktober" },
        { value: "11", label: "November" },
        { value: "12", label: "Desember" },
      ],

      toasts: [],
      toastCounter: 0,
    };
  },

  computed: {
    namaUser() {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return user.nama || "Koordinator";
    },
    daftarTahun() {
      const now = new Date().getFullYear();
      const years = [];
      for (let y = now; y >= now - 4; y--) years.push(y);
      return years;
    },
    labelPeriode() {
      const bulanLabel = this.filter.bulan
        ? this.daftarBulan.find((b) => b.value === this.filter.bulan)?.label ||
          ""
        : "Semua Bulan";
      const desaLabel = this.filter.desa_id
        ? this.daftarDesa.find((d) => d.id == this.filter.desa_id)?.nama_desa ||
          ""
        : "Seluruh Desa";

      return `${bulanLabel} ${this.filter.tahun} - ${desaLabel}`;
    },
  },

  async mounted() {
    await this.fetchDesa();
  },

  methods: {
    async fetchDesa() {
      try {
        const res = await api.get("/desas");

        // PENGAMAN PAGINATION UNTUK DROPDOWN DESA
        let mentahDesa = [];
        if (res.data?.data?.data && Array.isArray(res.data.data.data)) {
          mentahDesa = res.data.data.data;
        } else if (res.data?.data && Array.isArray(res.data.data)) {
          mentahDesa = res.data.data;
        } else if (Array.isArray(res.data)) {
          mentahDesa = res.data;
        }

        this.daftarDesa = mentahDesa;
      } catch {}
    },

    async generateLaporan() {
      this.generating = true;
      this.laporanReady = false;
      try {
        const params = { tahun: this.filter.tahun };
        if (this.filter.bulan) params.bulan = this.filter.bulan;
        if (this.filter.desa_id) params.desa_id = this.filter.desa_id;

        const [resSampah, resPengelolaan] = await Promise.all([
          api.get("/data-sampah", {
            params: { ...params, status: "verified", per_page: 9999 },
          }),
          api.get("/data-pengelolaan", {
            params: { ...params, per_page: 9999 },
          }),
        ]);

        // 1. BONGKAR BUNGKUS PAGINATION SAMPAH
        let mentahSampah = [];
        if (
          resSampah.data?.data?.data &&
          Array.isArray(resSampah.data.data.data)
        ) {
          mentahSampah = resSampah.data.data.data;
        } else if (resSampah.data?.data && Array.isArray(resSampah.data.data)) {
          mentahSampah = resSampah.data.data;
        } else if (Array.isArray(resSampah.data)) {
          mentahSampah = resSampah.data;
        }

        // 2. BONGKAR BUNGKUS PAGINATION PENGELOLAAN
        let mentahPengelolaan = [];
        if (
          resPengelolaan.data?.data?.data &&
          Array.isArray(resPengelolaan.data.data.data)
        ) {
          mentahPengelolaan = resPengelolaan.data.data.data;
        } else if (
          resPengelolaan.data?.data &&
          Array.isArray(resPengelolaan.data.data)
        ) {
          mentahPengelolaan = resPengelolaan.data.data;
        } else if (Array.isArray(resPengelolaan.data)) {
          mentahPengelolaan = resPengelolaan.data;
        }

        // Lanjutkan ke proses perhitungan
        this.prosesDataSampah(mentahSampah);
        this.prosesDataPengelolaan(mentahPengelolaan);

        this.laporanReady = true;
        this.showToast("Laporan berhasil disusun.", "success");

        this.$nextTick(() => {
          const el = document.getElementById("lp-print-area");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      } catch (err) {
        console.error("Error Cetak Laporan: ", err);
        this.showToast("Gagal memuat data laporan.", "error");
      } finally {
        this.generating = false;
      }
    },

    prosesDataSampah(dataMentah) {
      const groups = {};
      let tMasuk = 0,
        tOrg = 0,
        tAnorg = 0,
        tRes = 0;

      const filterDesa = this.filter.desa_id;
      const filterBulan = this.filter.bulan;

      dataMentah.forEach((row) => {
        const desaId = row.desa_id || row.desa?.id || "0";
        if (filterDesa && desaId != filterDesa) return;

        const tgl = row.tanggal;

        if (filterBulan && tgl && tgl.substring(5, 7) !== filterBulan) return;

        const key = `${desaId}_${tgl}`;

        if (!groups[key]) {
          groups[key] = {
            desa: row.desa?.nama_desa || "-",
            tanggal: tgl,
            organik: 0,
            anorganik: 0,
            residu: 0,
            total: 0,
            status: row.status,
          };
        }

        const qty = parseFloat(row.jumlah || 0);
        groups[key].total += qty;
        tMasuk += qty;

        const jenis = (row.jenis_sampah?.nama || "").toLowerCase();
        if (jenis.includes("anorganik")) {
          groups[key].anorganik += qty;
          tAnorg += qty;
        } else if (jenis.includes("organik")) {
          groups[key].organik += qty;
          tOrg += qty;
        } else if (jenis.includes("residu")) {
          groups[key].residu += qty;
          tRes += qty;
        }
      });

      this.tabelSampah = Object.values(groups).sort(
        (a, b) => new Date(a.tanggal) - new Date(b.tanggal),
      );
      this.ringkasan.total_sampah = tMasuk;
      this.ringkasan.organik = tOrg;
      this.ringkasan.anorganik = tAnorg;
      this.ringkasan.residu = tRes;
    },

    prosesDataPengelolaan(dataMentah) {
      const groups = {};
      let tDikelola = 0;

      const filterDesa = this.filter.desa_id;
      const filterBulan = this.filter.bulan;

      dataMentah.forEach((row) => {
        // Ambil ID dan Nama Desa dari relasi data_sampah agar selalu sinkron
        const desaId = row.data_sampah?.desa_id || row.desa_id || "0";
        if (filterDesa && desaId != filterDesa) return;

        const desaNama =
          row.data_sampah?.desa?.nama_desa || row.desa?.nama_desa || "-";

        // KUNCI PERBAIKANNYA DI SINI:
        // Ambil tanggal dari sumber sampahnya (data_sampah.tanggal), bukan tanggal inputnya!
        const tgl =
          row.data_sampah?.tanggal || row.created_at?.substring(0, 10) || "-";

        if (filterBulan && tgl !== "-" && tgl.substring(5, 7) !== filterBulan)
          return;

        const key = `${desaId}_${tgl}`;

        if (!groups[key]) {
          groups[key] = {
            desa: desaNama,
            tanggal: tgl, // Sekarang tanggalnya akan ikut 10 Jun dan 12 Jun
            total: 0,
            jenisList: new Set(),
          };
        }

        const qty = parseFloat(row.jumlah || 0);
        groups[key].total += qty;
        tDikelola += qty;

        if (row.jenis_pengelolaan?.nama) {
          groups[key].jenisList.add(row.jenis_pengelolaan.nama);
        }
      });

      this.tabelPengelolaan = Object.values(groups)
        .map((item) => ({
          ...item,
          keterangan: Array.from(item.jenisList).join(", "),
        }))
        .sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));

      this.ringkasan.total_dikelola = tDikelola;
    },

    cetakLaporan() {
      window.print();
    },

    exportPdf() {
      this.showToast("Menyiapkan file PDF, mohon tunggu...", "info");
      const element = document.getElementById("lp-print-area");
      window.scrollTo(0, 0);

      const opt = {
        margin: [15, 10, 15, 10],
        filename: `Laporan_Sampah_${this.filter.bulan}_${this.filter.tahun}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"], avoid: "tr" },
      };

      if (window.html2pdf) {
        window
          .html2pdf()
          .set(opt)
          .from(element)
          .save()
          .then(() => {
            this.showToast("File PDF berhasil diunduh.", "success");
          });
      } else {
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        script.onload = () => {
          window
            .html2pdf()
            .set(opt)
            .from(element)
            .save()
            .then(() => {
              this.showToast("File PDF berhasil diunduh.", "success");
            });
        };
        document.head.appendChild(script);
      }
    },

    formatDate(dateObj) {
      return new Date(dateObj).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    },

    formatTanggal(str) {
      if (!str) return "-";
      return new Date(str).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    },

    formatAngka(val) {
      // Karena desimal, kita beri ID format agar bisa tampil rapi (contoh: 3,50)
      return parseFloat(val || 0).toLocaleString("id-ID");
    },

    labelStatus(status) {
      const map = {
        pending: "Pending",
        verified: "Terverifikasi",
        rejected: "Ditolak",
      };
      return map[status] || status;
    },

    showToast(message, type = "success") {
      const id = ++this.toastCounter;
      this.toasts.push({ id, message, type });
      setTimeout(() => {
        this.toasts = this.toasts.filter((t) => t.id !== id);
      }, 4000);
    },
  },
};
