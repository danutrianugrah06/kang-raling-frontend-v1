import api from "@/services/api.js";

export default {
  data() {
    return {
      activeTab: "artikel",

      /* State Artikel */
      artikels: [],
      loadingArtikel: true,
      artikelPage: 1,
      artikelTotalPages: 1,

      /* State Galeri */
      galeris: [],
      loadingGaleri: false,
      galeriPage: 1,
      galeriTotalPages: 1,
      galeriLoaded: false, 

      toasts: [],
      toastCounter: 0,
    };
  },

  mounted() {
    if (this.$route.query.tab === "galeri") {
      this.switchTab("galeri");
    } else {
      this.fetchArtikel(1);
    }
  },

  methods: {
    switchTab(tab) {
      this.activeTab = tab;
      this.$router
        .replace({ query: { ...this.$route.query, tab: tab } })
        .catch(() => {});

      if (tab === "galeri" && !this.galeriLoaded) {
        this.fetchGaleri(1);
      } else if (tab === "artikel" && this.artikels.length === 0) {
        this.fetchArtikel(1);
      }
    },

    /* ── FETCH & GANTI HALAMAN ARTIKEL ── */
    async fetchArtikel(page = 1) {
      this.loadingArtikel = true;
      try {
        // per_page dihapus agar mengikuti default backend (10)
        const res = await api.get("/artikels", { params: { page: page } });
        const data = res.data;
        
        this.artikels = data.data || [];
        this.artikelPage = data.current_page || 1;
        this.artikelTotalPages = data.last_page || 1;
        
        // Scroll ke atas dengan halus setelah pindah halaman
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (e) {
        this.showToast("Gagal memuat artikel.", "error");
      } finally {
        this.loadingArtikel = false;
      }
    },

    changePageArtikel(page) {
      if (page >= 1 && page <= this.artikelTotalPages) {
        this.fetchArtikel(page);
      }
    },

    /* ── FETCH & GANTI HALAMAN GALERI ── */
    async fetchGaleri(page = 1) {
      this.loadingGaleri = true;
      try {
        const res = await api.get("/galeris", { params: { page: page } });
        const data = res.data;
        
        this.galeris = data.data || [];
        this.galeriPage = data.current_page || 1;
        this.galeriTotalPages = data.last_page || 1;
        this.galeriLoaded = true;

        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (e) {
        this.showToast("Gagal memuat galeri.", "error");
      } finally {
        this.loadingGaleri = false;
      }
    },

    changePageGaleri(page) {
      if (page >= 1 && page <= this.galeriTotalPages) {
        this.fetchGaleri(page);
      }
    },

    goToArtikel(slug) { this.$router.push("/artikel/" + slug); },
    goToGaleri(slug) { this.$router.push("/galeri/" + slug); },

    /* ── HELPER ── */
    getImageUrl(path) {
      if (!path) return "";
      if (path.startsWith("http")) return path;
      return "http://localhost:8000/storage/" + path;
    },

    onImgError(e) {
      e.target.style.display = "none";
      const placeholder = document.createElement("div");
      placeholder.className = "img-placeholder-fallback";
      placeholder.innerHTML = '<i class="bi bi-image"></i>';
      e.target.parentNode.appendChild(placeholder);
    },

    formatTanggal(dateStr) {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    },

    getExcerpt(html) {
      if (!html) return "";
      const div = document.createElement("div");
      div.innerHTML = html;
      const text = div.textContent || div.innerText || "";
      return text.substring(0, 160).trim() + (text.length > 160 ? "..." : "");
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