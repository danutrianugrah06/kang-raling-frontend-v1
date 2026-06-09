<template>
  <div class="dash-root">

    <!-- TOPBAR -->
    <header class="dash-topbar">
      <div class="dash-topbar-left">
        <div class="dash-brand">
          <span class="dash-brand-text">KANG RALING</span>
        </div>
        <button class="dash-toggle-btn" @click="toggleSidebar" aria-label="Toggle Sidebar">
          <i class="bi bi-list"></i>
        </button>
      </div>

      <div class="dash-topbar-right">
        <!-- Jam dan tanggal -->
        <div class="dash-datetime">
          <i class="bi bi-calendar3"></i>
          <span>{{ formattedDate }}</span>
          <span class="dash-dot">•</span>
          <i class="bi bi-clock"></i>
          <span>{{ formattedTime }}</span>
        </div>

        <!-- Tombol logout -->
        <button class="dash-logout-btn" @click="handleLogout">
          <i class="bi bi-box-arrow-right"></i>
          <span class="dash-logout-text">Keluar</span>
        </button>
      </div>
    </header>

    <!-- OVERLAY untuk mobile -->
    <div class="dash-overlay" :class="{ visible: sidebarOpen && isMobile }" @click="closeSidebar"></div>

    <!-- SIDEBAR (menu navigasi) -->
    <aside class="dash-sidebar" :class="{ open: sidebarOpen }">
      <div class="dash-sidebar-profile">
        <div class="dash-sidebar-avatar">
          <i class="bi bi-person-fill"></i>
        </div>
        <div class="dash-sidebar-userinfo">
          <span class="dash-sidebar-name">{{ userName }}</span>
          <span class="dash-sidebar-role" :class="isAdmin ? 'role-admin' : 'role-fasil'">
            {{ isAdmin ? 'Administrator' : 'Fasilitator' }}
          </span>
        </div>
      </div>

      <nav class="dash-nav">
        <!-- Dashboard utama -->
        <router-link to="/dashboard" class="dash-nav-item" active-class="active" exact @click="closeSidebarMobile">
          <i class="bi bi-speedometer2 dash-nav-icon"></i>
          <span>Dashboard</span>
        </router-link>

        <div class="dash-nav-header">MAIN MENU</div>

        <router-link to="/dashboard/artikel" class="dash-nav-item" active-class="active" @click="closeSidebarMobile">
          <i class="bi bi-newspaper dash-nav-icon"></i>
          <span>Kelola Artikel</span>
        </router-link>

        <router-link to="/dashboard/galeri" class="dash-nav-item" active-class="active" @click="closeSidebarMobile">
          <i class="bi bi-images dash-nav-icon"></i>
          <span>Kelola Galeri</span>
        </router-link>

        <router-link to="/dashboard/desa-binaan" class="dash-nav-item" active-class="active" @click="closeSidebarMobile">
          <i class="bi bi-house-heart-fill dash-nav-icon"></i>
          <span>Kelola Desa Binaan</span>
        </router-link>

        <router-link to="/dashboard/edukasi" class="dash-nav-item" active-class="active" @click="closeSidebarMobile">
          <i class="bi bi-mortarboard-fill dash-nav-icon"></i>
          <span>Kelola Edukasi</span>
        </router-link>

        <router-link to="/dashboard/jenis-sampah" class="dash-nav-item" active-class="active" @click="closeSidebarMobile">
          <i class="bi bi-tags-fill dash-nav-icon"></i>
          <span>Kelola Jenis Sampah</span>
        </router-link>

        <router-link to="/dashboard/pengelolaan" class="dash-nav-item" active-class="active" @click="closeSidebarMobile">
          <i class="bi bi-recycle dash-nav-icon"></i>
          <span>Kelola Pengelolaan</span>
        </router-link>

        <router-link to="/dashboard/input-sampah" class="dash-nav-item" active-class="active" @click="closeSidebarMobile">
          <i class="bi bi-clipboard-plus-fill dash-nav-icon"></i>
          <span>Form Input Data Sampah</span>
        </router-link>

        <router-link to="/dashboard/input-pengelolaan" class="dash-nav-item" active-class="active" @click="closeSidebarMobile">
          <i class="bi bi-clipboard-check-fill dash-nav-icon"></i>
          <span>Form Input Pengelolaan</span>
        </router-link>

        <router-link v-if="isAdmin" to="/dashboard/verifikasi" class="dash-nav-item" active-class="active" @click="closeSidebarMobile">
          <i class="bi bi-patch-check-fill dash-nav-icon"></i>
          <span>Verifikasi Data Sampah</span>
          <span v-if="pendingCount > 0" class="dash-nav-badge">{{ pendingCount }}</span>
        </router-link>

        <div class="dash-nav-header">PENGATURAN</div>

        <router-link to="/dashboard/akun" class="dash-nav-item" active-class="active" @click="closeSidebarMobile">
          <i class="bi bi-person-gear dash-nav-icon"></i>
          <span>Pengaturan Akun</span>
        </router-link>

        <template v-if="isAdmin">
          <router-link to="/dashboard/users" class="dash-nav-item" active-class="active" @click="closeSidebarMobile">
            <i class="bi bi-people-fill dash-nav-icon"></i>
            <span>Manajemen User</span>
          </router-link>

          <router-link to="/dashboard/activity-log" class="dash-nav-item" active-class="active" @click="closeSidebarMobile">
            <i class="bi bi-clock-history dash-nav-icon"></i>
            <span>Activity Log</span>
          </router-link>

          <div class="dash-nav-header">MANAJEMEN API</div>

          <router-link to="/dashboard/api-tabel" class="dash-nav-item" active-class="active" @click="closeSidebarMobile">
            <i class="bi bi-table dash-nav-icon"></i>
            <span>Tabel Generate</span>
          </router-link>

          <router-link to="/dashboard/api-keys" class="dash-nav-item" active-class="active" @click="closeSidebarMobile">
            <i class="bi bi-key-fill dash-nav-icon"></i>
            <span>Buat Token Baru</span>
          </router-link>
        </template>

        <div class="dash-nav-header">LAINNYA</div>

        <router-link to="/dashboard/laporan" class="dash-nav-item" active-class="active" @click="closeSidebarMobile">
          <i class="bi bi-printer-fill dash-nav-icon"></i>
          <span>Cetak Laporan</span>
        </router-link>

        <a href="/" target="_blank" class="dash-nav-item" rel="noopener noreferrer">
          <i class="bi bi-eye-fill dash-nav-icon"></i>
          <span>Preview Website</span>
        </a>

        <router-link to="/dashboard/kontak" class="dash-nav-item" active-class="active" @click="closeSidebarMobile">
          <i class="bi bi-envelope-fill dash-nav-icon"></i>
          <span>Hubungi Developer</span>
        </router-link>
      </nav>
    </aside>

    <!-- MAIN CONTENT: margin kiri dikontrol secara dinamis dengan binding style (karena tergantung state sidebar dan lebar layar) -->
    <div class="dash-main" :style="mainStyle">
      <main class="dash-content">
        <RouterView />
      </main>
      <footer class="dash-footer">
        <span><strong>Kang Raling</strong> - Dinas Lingkungan Hidup Kab. Garut</span>
        <span>&copy; {{ currentYear }}</span>
      </footer>
    </div>

  </div>
</template>

<script>
import dashboardLayoutScript from '@/scripts/dashboard/dashboardLayout.js'
export default {
  name: 'DashboardLayout',
  ...dashboardLayoutScript
}
</script>

<style scoped>
@import '@/assets/css/dashboard/dashboardLayout.css';
</style>