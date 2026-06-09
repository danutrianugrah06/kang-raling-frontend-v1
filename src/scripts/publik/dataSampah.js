import api from "@/services/api.js";

const BULAN = [
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
];

export default {
  data() {
    const tahunSekarang = new Date().getFullYear();
    const tahunOptions = [];
    const batasTahun = tahunSekarang + 5;
    for (let t = tahunSekarang; t >= 2022; t--) tahunOptions.push(t);

    return {
      desas: [],
      loadingDesa: true,
      dataSampahMentah: [],
      loadingData: true,
      filterDesa: "",
      filterBulan: String(new Date().getMonth() + 1).padStart(2, "0"),
      filterTahun: String(tahunSekarang),
      bulanOptions: BULAN,
      tahunOptions,
      openDesaId: null,
      paginasi: {}, // { desaId: halamanAktif }
      modalVisible: false,
      modalData: null,
      toasts: [],
      toastCounter: 0,
    };
  },

  computed: {
    // Grouping data per tanggal per desa (akumulasi jenis sampah)
    groupedDataSampah() {
      const groups = {};
      this.dataSampahMentah.forEach((item) => {
        const desaId = item.desa_id || item.desa?.id;
        const tanggal = item.tanggal;
        const key = `${desaId}_${tanggal}`;
        if (!groups[key]) {
          groups[key] = {
            id: key,
            desa_id: desaId,
            desa: item.desa,
            tanggal: tanggal,
            organik: 0,
            anorganik: 0,
            residu: 0,
            total_timbulan: 0,
            total_terkelola: 0,
          };
        }
        const jumlah = parseFloat(item.jumlah || 0);
        groups[key].total_timbulan += jumlah;
        const jenis = (item.jenis_sampah?.nama || "").toLowerCase();
        if (jenis.includes("anorganik")) groups[key].anorganik += jumlah;
        else if (jenis.includes("organik")) groups[key].organik += jumlah;
        else if (jenis.includes("residu")) groups[key].residu += jumlah;

        const pengelolaans =
          item.pengelolaans ||
          item.pengelolaan_sampahs ||
          item.data_pengelolaan ||
          item.data_pengelolaan_sampahs ||
          [];
        pengelolaans.forEach((p) => {
          groups[key].total_terkelola += parseFloat(p.jumlah || 0);
        });
      });
      return Object.values(groups).sort(
        (a, b) => new Date(b.tanggal) - new Date(a.tanggal),
      );
    },

    // Statistik dari data yang sudah difilter
    statistikLokal() {
      let total_sampah = 0,
        total_terkelola = 0,
        total_organik = 0,
        total_anorganik = 0,
        total_residu = 0;
      this.groupedDataSampah.forEach((group) => {
        total_sampah += group.total_timbulan;
        total_terkelola += group.total_terkelola;
        total_organik += group.organik;
        total_anorganik += group.anorganik;
        total_residu += group.residu;
      });
      return {
        jumlah_tps: this.desas.length,
        total_sampah,
        total_terkelola,
        total_organik,
        total_anorganik,
        total_residu,
      };
    },

    // Daftar desa unik dari data yang muncul
    desaList() {
      const map = {};
      this.groupedDataSampah.forEach((item) => {
        const id = item.desa_id;
        if (id && !map[id]) {
          map[id] = {
            id,
            nama: item.desa?.nama_desa || "Desa " + id,
            alamat: item.desa?.alamat || "Kabupaten Garut",
          };
        }
      });
      return Object.values(map);
    },
  },

  mounted() {
    this.fetchDesas();
    this.fetchData();
  },

  methods: {
    async fetchDesas() {
      this.loadingDesa = true;
      try {
        const res = await api.get("/desas");
        this.desas = res.data.data || res.data;
      } catch (e) {
      } finally {
        this.loadingDesa = false;
      }
    },

    async fetchData() {
      this.loadingData = true;
      this.openDesaId = null;
      this.paginasi = {};
      try {
        const params = { per_page: 9999 };
        if (this.filterDesa) params.desa_id = this.filterDesa;
        if (this.filterBulan) params.bulan = this.filterBulan;
        if (this.filterTahun) params.tahun = this.filterTahun;
        const res = await api.get("/data-sampah/publik", { params });
        this.dataSampahMentah = res.data.data || res.data;
        if (this.desaList.length > 0) this.openDesaId = this.desaList[0].id;
      } catch (e) {
        this.showToast("Gagal memuat data sampah.", "error");
      } finally {
        this.loadingData = false;
      }
    },

    terapkanFilter() {
      this.fetchData();
    },
    resetFilter() {
      const tahunSekarang = new Date().getFullYear();
      this.filterDesa = "";
      this.filterBulan = String(new Date().getMonth() + 1).padStart(2, "0");
      this.filterTahun = String(tahunSekarang);
      this.fetchData();
    },

    toggleDesa(desaId) {
      this.openDesaId = this.openDesaId === desaId ? null : desaId;
    },
    getDataPerDesa(desaId) {
      return this.groupedDataSampah.filter(
        (item) => String(item.desa_id) === String(desaId),
      );
    },
    getTotalTimbulanDesa(desaId) {
      const total = this.getDataPerDesa(desaId).reduce(
        (sum, i) => sum + i.total_timbulan,
        0,
      );
      return this.formatAngka(total);
    },

    // Pagination per desa (5 item per halaman)
    getHalamanAktif(desaId) {
      return this.paginasi[desaId] || 1;
    },
    getDataHalaman(desaId) {
      const semua = this.getDataPerDesa(desaId);
      const hal = this.getHalamanAktif(desaId);
      const start = (hal - 1) * 5;
      return semua.slice(start, start + 5);
    },
    getTotalHalaman(desaId) {
      return Math.ceil(this.getDataPerDesa(desaId).length / 5) || 1;
    },
    getHalamanRange(desaId) {
      const total = this.getTotalHalaman(desaId);
      return Array.from({ length: total }, (_, i) => i + 1);
    },
    getPaginasiInfo(desaId) {
      return `Menampilkan halaman ${this.getHalamanAktif(desaId)} dari ${this.getTotalHalaman(desaId)}`;
    },
    gantiHalaman(desaId, hal) {
      this.paginasi = { ...this.paginasi, [desaId]: hal };
    },
    halamanSebelumnya(desaId) {
      const hal = this.getHalamanAktif(desaId);
      if (hal > 1) this.gantiHalaman(desaId, hal - 1);
    },
    halamanBerikutnya(desaId) {
      const hal = this.getHalamanAktif(desaId);
      const total = this.getTotalHalaman(desaId);
      if (hal < total) this.gantiHalaman(desaId, hal + 1);
    },

    bukaDetail(item) {
      this.modalData = item;
      this.modalVisible = true;
      document.body.style.overflow = "hidden";
    },
    tutupModal() {
      this.modalVisible = false;
      this.modalData = null;
      document.body.style.overflow = "";
    },
    persenTerkelola(item) {
      if (!item || item.total_timbulan === 0) return 0;
      return Math.min(
        100,
        Math.round((item.total_terkelola / item.total_timbulan) * 100),
      );
    },

    formatTanggal(dateStr) {
      if (!dateStr) return "-";
      return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    },
    formatAngka(n) {
      if (!n && n !== 0) return "0";
      const num = parseFloat(n);
      return num % 1 === 0
        ? num.toLocaleString("id-ID")
        : num.toLocaleString("id-ID", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 2,
          });
    },
    showToast(message, type = "success") {
      const id = ++this.toastCounter;
      this.toasts.push({ id, message, type });
      setTimeout(() => {
        this.toasts = this.toasts.filter((t) => t.id !== id);
      }, 3500);
    },
  },
};
