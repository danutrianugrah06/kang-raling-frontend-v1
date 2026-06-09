import { useAuthStore } from '@/store/auth'
import api from '@/services/api'

export default {
  data() {
    return {
      sidebarOpen: false,        // Status buka/tutup sidebar
      notifOpen: false,          // Status dropdown notifikasi
      formattedDate: '',         // String tanggal lengkap (Indonesia)
      formattedTime: '',         // String waktu (HH:MM:SS)
      currentYear: new Date().getFullYear(), // Tahun berjalan untuk footer
      pendingCount: 0,           // Jumlah data sampah menunggu verifikasi (hanya admin)
      clockInterval: null,       // ID interval untuk update jam
      isMobile: window.innerWidth < 992 // Deteksi layar mobile (<992px)
    }
  },

  computed: {
    // Nama pengguna dari store auth
    userName() {
      const auth = useAuthStore()
      return auth.user?.nama || 'Pengguna'
    },
    // Apakah pengguna admin (berdasarkan role di store)
    isAdmin() {
      const auth = useAuthStore()
      return auth.isAdmin
    },
    /**
     * Style binding untuk margin kiri area konten (dash-main)
     * - Desktop dan sidebar terbuka → marginLeft 240px (selebar sidebar)
     * - Selain itu → marginLeft 0px
     * Tidak bisa menggunakan CSS murni karena margin bergantung pada state JavaScript.
     */
    mainStyle() {
      if (!this.isMobile && this.sidebarOpen) {
        return { marginLeft: '240px' }
      }
      return { marginLeft: '0px' }
    }
  },

  mounted() {
    this.updateClock() // Set jam pertama kali
    this.clockInterval = setInterval(this.updateClock, 1000) // Update setiap detik

    // Desktop: sidebar langsung terbuka
    if (!this.isMobile) {
      this.sidebarOpen = true
    }

    // Jika admin, ambil jumlah data yang perlu diverifikasi
    if (this.isAdmin) {
      this.fetchPendingCount()
    }

    // Event listener resize (responsif)
    window.addEventListener('resize', this.handleResize)
    // Klik di luar dropdown notifikasi akan menutupnya
    document.addEventListener('click', this.handleOutsideClick)
  },

  beforeUnmount() {
    // Bersihkan interval dan event listener saat komponen dihancurkan
    clearInterval(this.clockInterval)
    window.removeEventListener('resize', this.handleResize)
    document.removeEventListener('click', this.handleOutsideClick)
  },

  methods: {
    /**
     * Update jam dan tanggal realtime (dipanggil setiap detik)
     */
    updateClock() {
      const now = new Date()
      this.formattedDate = now.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
      this.formattedTime = now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    },

    /**
     * Buka/tutup sidebar
     * Juga tutup dropdown notifikasi agar tidak mengganggu
     */
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
      this.notifOpen = false
    },

    /**
     * Tutup sidebar (dipakai untuk overlay mobile)
     */
    closeSidebar() {
      this.sidebarOpen = false
    },

    /**
     * Tutup sidebar jika dalam mode mobile (dipanggil setelah klik menu)
     */
    closeSidebarMobile() {
      if (this.isMobile) {
        this.sidebarOpen = false
      }
    },

    /**
     * Handle resize window untuk update deteksi mobile
     * - Jika berubah ke desktop (≥992px) dan sidebar sebelumnya tertutup, buka otomatis
     * - Jika berubah ke mobile, tutup sidebar
     */
    handleResize() {
      const wasDesktop = !this.isMobile
      this.isMobile = window.innerWidth < 992

      if (!this.isMobile && !wasDesktop) {
        this.sidebarOpen = true
      }
      if (this.isMobile) {
        this.sidebarOpen = false
      }
    },

    /**
     * Buka/tutup dropdown notifikasi
     */
    toggleNotif() {
      this.notifOpen = !this.notifOpen
    },

    /**
     * Tutup dropdown notifikasi jika klik di luar area notifikasi
     */
    handleOutsideClick(e) {
      const notifWrap = this.$el?.querySelector('.dash-notif-wrap')
      if (notifWrap && !notifWrap.contains(e.target)) {
        this.notifOpen = false
      }
    },

    /**
     * Ambil jumlah data sampah yang menunggu verifikasi (endpoint dashboard)
     * Hanya untuk admin
     */
    async fetchPendingCount() {
      try {
        const res = await api.get('/dashboard')
        this.pendingCount = res.data?.data?.verifikasi_tertunda ?? 0
      } catch {
        this.pendingCount = 0
      }
    },

    /**
     * Proses logout: panggil API logout, hapus store, redirect ke login
     */
    async handleLogout() {
      const auth = useAuthStore()
      try {
        await api.post('/logout')
      } catch {
        // Tetap lanjut logout meskipun request gagal
      } finally {
        auth.logout()
        this.$router.push('/login')
      }
    }
  }
}