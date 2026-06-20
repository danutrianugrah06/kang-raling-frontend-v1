// src/scripts/dashboard/dashboardLayout.js
import { useAuthStore } from '@/store/auth'
import api from '@/services/api'

export default {
  data() {
    return {
      sidebarOpen: false,
      formattedDate: '',
      formattedTime: '',
      currentYear: new Date().getFullYear(),
      pendingCount: 0,
      clockInterval: null,
      isMobile: window.innerWidth < 992
    }
  },

  computed: {
    authStore() {
      return useAuthStore()
    },
    userName() {
      return this.authStore.user?.nama || 'Pengguna'
    },
    availableRoles() {
      return this.authStore.user?.roles || []
    },
    currentActiveRole: {
      get() {
        return this.authStore.currentRole || ''
      },
      set(newRole) {
        this.authStore.setActiveRole(newRole)
        if (this.$route.path !== '/dashboard') {
          this.$router.push('/dashboard')
        }
        if (this.hasPermission('verifikasi.data-sampah')) {
          this.fetchPendingCount()
        }
      }
    },

    // =============================================
    // RBAC DINAMIS: Kumpulkan semua permission
    // dari role yang sedang aktif saja
    // =============================================
    activePermissions() {
      const activeRoleData = this.availableRoles.find(
        r => r.name === this.currentActiveRole
      )
      if (!activeRoleData || !activeRoleData.permissions) return []
      const perms = activeRoleData.permissions
      // Handle array of objects [{name:'kelola.artikel'}] atau array string
      if (perms.length > 0 && typeof perms[0] === 'object') {
        return perms.map(p => p.name)
      }
      return perms
    },

    // =============================================
    // MENU DINAMIS — Dibangun otomatis dari permissions
    // Role baru apapun langsung terbaca tanpa edit Vue
    // =============================================
    dynamicMenuGroups() {
      const perms = this.activePermissions

      // Definisi SEMUA menu yang mungkin ada
      // Kunci = permission yang dibutuhkan
      // Nilai = data tampilan menu
      const allMenuItems = [
        // ── ADMIN ─────────────────────────────
        {
          permission: 'verifikasi.data-sampah',
          group: 'Menu Admin',
          icon: 'bi-patch-check-fill',
          label: 'Verifikasi Data Sampah',
          to: '/dashboard/verifikasi',
          badge: true, // tampilkan pendingCount
        },
        {
          permission: 'manajemen.user',
          group: 'Menu Admin',
          icon: 'bi-people-fill',
          label: 'Manajemen User',
          to: '/dashboard/users',
        },
        {
          permission: 'kelola.role-permission',
          group: 'Menu Admin',
          icon: 'bi-person-badge-fill',
          label: 'Kelola Role',
          to: '/dashboard/roles',
        },
        {
          permission: 'kelola.role-permission',
          group: 'Menu Admin',
          icon: 'bi-shield-lock-fill',
          label: 'Hak Akses',
          to: '/dashboard/permissions',
        },
        {
          permission: 'kelola.tabel-generate',
          group: 'Menu Admin',
          icon: 'bi-table',
          label: 'Tabel Generate',
          to: '/dashboard/api-tabel',
        },
        {
          permission: 'kelola.api-key',
          group: 'Menu Admin',
          icon: 'bi-clock-history',
          label: 'Activity Log',
          to: '/dashboard/activity-log',
        },

        // ── FASILITATOR ────────────────────────
        {
          permission: 'kelola.artikel',
          group: 'Kelola Konten',
          icon: 'bi-newspaper',
          label: 'Artikel dan Berita',
          to: '/dashboard/artikel',
        },
        {
          permission: 'kelola.galeri',
          group: 'Kelola Konten',
          icon: 'bi-images',
          label: 'Galeri Dokumentasi',
          to: '/dashboard/galeri',
        },
        {
          permission: 'kelola.desa-binaan',
          group: 'Kelola Konten',
          icon: 'bi-house-heart-fill',
          label: 'Desa Binaan',
          to: '/dashboard/desa-binaan',
        },
        {
          permission: 'kelola.edukasi',
          group: 'Kelola Konten',
          icon: 'bi-mortarboard-fill',
          label: 'Edukasi',
          to: '/dashboard/edukasi',
        },
        {
          permission: 'kelola.jenis-sampah',
          group: 'Kelola Konten',
          icon: 'bi-tags-fill',
          label: 'Jenis Sampah',
          to: '/dashboard/jenis-sampah',
        },
        {
          permission: 'kelola.jenis-pengelolaan',
          group: 'Kelola Konten',
          icon: 'bi-recycle',
          label: 'Jenis Pengelolaan',
          to: '/dashboard/pengelolaan',
        },
        {
          permission: 'input.data-sampah',
          group: 'Input Data',
          icon: 'bi-clipboard-plus-fill',
          label: 'Data Sampah',
          to: '/dashboard/input-sampah',
        },
        {
          permission: 'input.data-pengelolaan',
          group: 'Input Data',
          icon: 'bi-clipboard-check-fill',
          label: 'Data Pengelolaan',
          to: '/dashboard/input-pengelolaan',
        },

        // ── DEVELOPER ─────────────────────────
        {
          permission: 'generate.api-token',
          group: 'Menu Developer',
          icon: 'bi-key-fill',
          label: 'Buat Token Baru',
          to: '/dashboard/api-keys',
        },
      ]

      // =============================================
      // FILTER: Hanya tampilkan menu yang
      // permission-nya dimiliki role aktif
      // Role baru (Auditor dll) otomatis terbaca!
      // =============================================
      const visibleItems = allMenuItems.filter(
        item => perms.includes(item.permission)
      )

      // Kelompokkan berdasarkan group
      // Hasilnya: { 'Menu Admin': [...], 'Kelola Konten': [...] }
      const groups = {}
      for (const item of visibleItems) {
        if (!groups[item.group]) groups[item.group] = []
        // Hindari duplikat (misal kelola.role-permission muncul 2x)
        const alreadyAdded = groups[item.group].some(i => i.to === item.to)
        if (!alreadyAdded) {
          groups[item.group].push(item)
        }
      }

      return groups
    },

    roleBadgeClass() {
      const map = {
        'Administrator':       'role-admin',
        'Fasilitator':         'role-fasil',
        'Pimpinan':            'role-pimpinan',
        'Developer Eksternal': 'role-dev',
      }
      return map[this.currentActiveRole] ?? 'role-custom'
    },

    mainStyle() {
      if (!this.isMobile && this.sidebarOpen) {
        return { marginLeft: '240px' }
      }
      return { marginLeft: '0px' }
    }
  },

  mounted() {
    this.updateClock()
    this.clockInterval = setInterval(this.updateClock, 1000)

    if (!this.isMobile) {
      this.sidebarOpen = true
    }

    if (this.hasPermission('verifikasi.data-sampah')) {
      this.fetchPendingCount()
    }

    window.addEventListener('resize', this.handleResize)
    document.addEventListener('click', this.handleOutsideClick)
  },

  beforeUnmount() {
    clearInterval(this.clockInterval)
    window.removeEventListener('resize', this.handleResize)
    document.removeEventListener('click', this.handleOutsideClick)
  },

  methods: {
    // =============================================
    // FUNGSI INTI RBAC — Cek dari role aktif
    // =============================================
    hasPermission(permissionName) {
      return this.activePermissions.includes(permissionName)
    },

    hasAnyPermission(permissionsArray) {
      return permissionsArray.some(perm => this.hasPermission(perm))
    },

    updateClock() {
      const now = new Date()
      this.formattedDate = now.toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      })
      this.formattedTime = now.toLocaleTimeString('id-ID', {
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      })
    },

    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
    },
    closeSidebar() {
      this.sidebarOpen = false
    },
    closeSidebarMobile() {
      if (this.isMobile) this.sidebarOpen = false
    },

    handleResize() {
      const wasDesktop = !this.isMobile
      this.isMobile = window.innerWidth < 992
      if (!this.isMobile && !wasDesktop) this.sidebarOpen = true
      if (this.isMobile) this.sidebarOpen = false
    },

    handleOutsideClick(e) {
      const notifWrap = this.$el?.querySelector('.dash-notif-wrap')
      if (notifWrap && !notifWrap.contains(e.target)) {}
    },

    async fetchPendingCount() {
      try {
        const res = await api.get('/dashboard')
        this.pendingCount = res.data?.data?.verifikasi_tertunda ?? 0
      } catch {
        this.pendingCount = 0
      }
    },

    async handleLogout() {
      const auth = useAuthStore()
      try {
        await api.post('/logout')
      } catch {}
      finally {
        auth.logout()
        this.$router.push('/login')
      }
    }
  }
}