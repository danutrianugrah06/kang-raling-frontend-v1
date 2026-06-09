import api from "@/services/api.js";

export default {
  data() {
    return {
      /* Tab aktif awal: artikel */
      activeTab: "artikel",

      /* State artikel */
      artikels: [],
      loadingArtikel: true,
      loadingMoreArtikel: false,
      artikelPage: 1,
      hasMoreArtikel: false,

      /* State galeri */
      galeris: [],
      loadingGaleri: false,
      loadingMoreGaleri: false,
      galeriPage: 1,
      hasMoreGaleri: false,
      galeriLoaded: false, // penanda agar galeri hanya di-fetch sekali

      /* Toast */
      toasts: [],
      toastCounter: 0,
    };
  },

  mounted() {
    /*
      Saat komponen dipasang, cek apakah URL memiliki query ?tab=galeri.
      Jika ya, langsung pindah ke tab galeri; jika tidak, fetch artikel.
      Hal ini memungkinkan deep-link ke tab tertentu.
    */
    if (this.$route.query.tab === "galeri") {
      this.switchTab("galeri");
    } else {
      this.fetchArtikel();
    }
  },

  methods: {
    /* ── PERPINDAHAN TAB ── */
    switchTab(tab) {
      this.activeTab = tab;
      /*
        Update query string URL tanpa reload halaman.
        replace() digunakan agar tidak menumpuk di history browser.
        .catch(() => {}) mencegah error navigasi yang tidak perlu.
      */
      this.$router
        .replace({ query: { ...this.$route.query, tab: tab } })
        .catch(() => {});

      // Fetch data hanya jika diperlukan (hindari fetch ulang yang tidak perlu)
      if (tab === "galeri" && !this.galeriLoaded) {
        this.fetchGaleri();
      } else if (tab === "artikel" && this.artikels.length === 0) {
        this.fetchArtikel();
      }
    },

    /* ── FETCH ARTIKEL ── */
    async fetchArtikel() {
      this.loadingArtikel = true;
      try {
        const res = await api.get("/artikels", {
          params: { page: 1, per_page: 6 },
        });
        const data = res.data;
        // Normalisasi: backend bisa mengembalikan { data: [...] } atau langsung array
        this.artikels = data.data || data;
        this.artikelPage = 1;
        this.hasMoreArtikel = this.checkHasMore(data);
      } catch (e) {
        this.showToast("Gagal memuat artikel. Coba lagi nanti.", "error");
      } finally {
        this.loadingArtikel = false;
      }
    },

    /* ── LOAD MORE ARTIKEL ── */
    async loadMoreArtikel() {
      this.loadingMoreArtikel = true;
      try {
        this.artikelPage++;
        const res = await api.get("/artikels", {
          params: { page: this.artikelPage, per_page: 6 },
        });
        const data = res.data;
        const newItems = data.data || data;
        // Gabungkan item baru ke array yang sudah ada
        this.artikels.push(...newItems);
        this.hasMoreArtikel = this.checkHasMore(data);
      } catch (e) {
        // Jika gagal, kembalikan halaman ke posisi sebelumnya
        this.artikelPage--;
        this.showToast("Gagal memuat lebih banyak artikel.", "error");
      } finally {
        this.loadingMoreArtikel = false;
      }
    },

    /* ── FETCH GALERI ── */
    async fetchGaleri() {
      this.loadingGaleri = true;
      try {
        const res = await api.get("/galeris", {
          params: { page: 1, per_page: 6 },
        });
        const data = res.data;
        this.galeris = data.data || data;
        this.galeriPage = 1;
        this.hasMoreGaleri = this.checkHasMore(data);
        this.galeriLoaded = true; // tandai agar tidak fetch ulang saat pindah tab
      } catch (e) {
        this.showToast("Gagal memuat galeri. Coba lagi nanti.", "error");
      } finally {
        this.loadingGaleri = false;
      }
    },

    /* ── LOAD MORE GALERI ── */
    async loadMoreGaleri() {
      this.loadingMoreGaleri = true;
      try {
        this.galeriPage++;
        const res = await api.get("/galeris", {
          params: { page: this.galeriPage, per_page: 6 },
        });
        const data = res.data;
        const newItems = data.data || data;
        this.galeris.push(...newItems);
        this.hasMoreGaleri = this.checkHasMore(data);
      } catch (e) {
        this.galeriPage--;
        this.showToast("Gagal memuat lebih banyak galeri.", "error");
      } finally {
        this.loadingMoreGaleri = false;
      }
    },

    /* ── NAVIGASI KE DETAIL ── */
    goToArtikel(slug) {
      // Arahkan ke halaman detail artikel menggunakan slug
      this.$router.push("/artikel/" + slug);
    },

    goToGaleri(slug) {
      // Arahkan ke halaman detail galeri menggunakan slug  
      this.$router.push("/galeri/" + slug);
    },

    /* ── HELPER ── */

    /**
     * Mengubah path relatif dari server menjadi URL penuh.
     * Jika path sudah berawalan "http", langsung dikembalikan.
     */
    getImageUrl(path) {
      if (!path) return "";
      if (path.startsWith("http")) return path;
      return "http://localhost:8000/storage/" + path;
    },

    /**
     * Fallback saat gambar gagal dimuat.
     * Menyembunyikan elemen <img> yang rusak dan menggantinya dengan placeholder
     * menggunakan class CSS (bukan inline style) agar konsisten dengan prinsip clean code.
     * 
     * Alasan: Menghindari hardcoded style di JavaScript, memudahkan maintenance tema.
     */
    onImgError(e) {
      // Sembunyikan gambar yang gagal
      e.target.style.display = "none";
      
      // Buat elemen placeholder dengan class CSS, bukan inline style
      const placeholder = document.createElement("div");
      placeholder.className = "img-placeholder-fallback"; // class didefinisikan di CSS
      placeholder.innerHTML = '<i class="bi bi-image"></i>';
      
      // Sisipkan placeholder di posisi yang sama dengan gambar
      e.target.parentNode.appendChild(placeholder);
    },

    /**
     * Format tanggal ke dalam Bahasa Indonesia (contoh: 1 Januari 2024).
     */
    formatTanggal(dateStr) {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    },

    /**
     * Ambil 160 karakter pertama dari konten HTML sebagai kutipan (excerpt).
     * Menghapus tag HTML terlebih dahulu.
     */
    getExcerpt(html) {
      if (!html) return "";
      const div = document.createElement("div");
      div.innerHTML = html;
      const text = div.textContent || div.innerText || "";
      return text.substring(0, 160).trim() + (text.length > 160 ? "..." : "");
    },

    /**
     * Cek apakah masih ada halaman berikutnya berdasarkan struktur respons API.
     * Mendukung format: meta (Laravel pagination), last_page, atau next_page_url.
     */
    checkHasMore(data) {
      if (data && data.meta)
        return data.meta.current_page < data.meta.last_page;
      if (data && data.last_page) return data.current_page < data.last_page;
      if (data && data.next_page_url !== undefined) return !!data.next_page_url;
      return false;
    },

    /**
     * Tampilkan toast notifikasi (sukses/error) yang hilang otomatis setelah 3.5 detik.
     * Setiap toast memiliki ID unik agar bisa dihapus satu per satu.
     */
    showToast(message, type = "success") {
      const id = ++this.toastCounter;
      this.toasts.push({ id, message, type });
      setTimeout(() => {
        this.toasts = this.toasts.filter((t) => t.id !== id);
      }, 3500);
    },
  },
};