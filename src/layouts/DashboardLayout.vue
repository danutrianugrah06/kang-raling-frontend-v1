<template>
  <div class="dash-root">

    <!-- TOPBAR -->
    <header class="dash-topbar">
      <div class="dash-topbar-left">
        <div class="dash-brand"><span class="dash-brand-text">KANG RALING</span></div>
        <button class="dash-toggle-btn" @click="toggleSidebar"><i class="bi bi-list"></i></button>
      </div>
      <div class="dash-topbar-right">
        <div class="dash-datetime">
          <i class="bi bi-calendar3"></i><span>{{ formattedDate }}</span><span class="dash-dot">•</span>
          <i class="bi bi-clock"></i><span>{{ formattedTime }}</span>
        </div>
        <button class="dash-logout-btn" @click="handleLogout">
          <i class="bi bi-box-arrow-right"></i><span class="dash-logout-text">Keluar</span>
        </button>
      </div>
    </header>

    <!-- OVERLAY & SIDEBAR -->
    <div class="dash-overlay" :class="{ visible: sidebarOpen && isMobile }" @click="closeSidebar"></div>
    <aside class="dash-sidebar" :class="{ open: sidebarOpen }">
      <div class="dash-sidebar-profile">
        <div class="dash-sidebar-avatar"><i class="bi bi-person-fill"></i></div>
        <div class="dash-sidebar-userinfo">
          <span class="dash-sidebar-name">{{ userName }}</span>
          <!-- Role Switcher -->
          <select v-if="availableRoles.length > 1" v-model="currentActiveRole" class="dash-sidebar-role-select"
            :class="roleBadgeClass">
            <option v-for="role in availableRoles" :key="role.id" :value="role.name">{{ role.name }}</option>
          </select>
          <span v-else class="dash-sidebar-role" :class="roleBadgeClass">{{ currentActiveRole }}</span>
        </div>
      </div>

      <nav class="dash-nav">

        <!-- Dashboard selalu tampil untuk semua role -->
        <router-link to="/dashboard" class="dash-nav-item" active-class="active" exact @click="closeSidebarMobile">
          <i class="bi bi-speedometer2 dash-nav-icon"></i>
          <span>Dashboard</span>
        </router-link>

        <!-- MENU DINAMIS — Render otomatis dari permissions Role baru !-->
        <template v-for="(menuItems, groupName) in dynamicMenuGroups" :key="groupName">

          <!-- Header grup menu -->
          <div class="dash-nav-header">{{ groupName.toUpperCase() }}</div>

          <!-- Item menu dalam grup -->
          <router-link v-for="item in menuItems" :key="item.to" :to="item.to" class="dash-nav-item"
            active-class="active" @click="closeSidebarMobile">
            <i :class="['dash-nav-icon', 'bi', item.icon]"></i>
            <span>{{ item.label }}</span>
            <!-- Badge notifikasi untuk verifikasi pending -->
            <span v-if="item.badge && pendingCount > 0" class="dash-nav-badge">
              {{ pendingCount }}
            </span>
          </router-link>

        </template>

        <!-- PENGATURAN & LAINNYA -->
        <div class="dash-nav-header">PENGATURAN &amp; LAINNYA</div>

        <router-link to="/dashboard/akun" class="dash-nav-item" active-class="active" @click="closeSidebarMobile">
          <i class="bi bi-person-gear dash-nav-icon"></i>
          <span>Pengaturan Akun</span>
        </router-link>

        <router-link v-if="hasPermission('cetak.laporan')" to="/dashboard/laporan" class="dash-nav-item"
          active-class="active" @click="closeSidebarMobile">
          <i class="bi bi-printer-fill dash-nav-icon"></i>
          <span>Cetak Laporan</span>
        </router-link>

        <router-link v-if="hasPermission('view.preview-website')" to="/" target="_blank" class="dash-nav-item"
          rel="noopener noreferrer" @click="closeSidebarMobile">
          <i class="bi bi-eye-fill dash-nav-icon"></i><span>Lihat Website</span>
        </router-link>

        <router-link v-if="hasPermission('view.hubungi-developer')" to="/dashboard/kontak" class="dash-nav-item"
          active-class="active" @click="closeSidebarMobile">
          <i class="bi bi-envelope-fill dash-nav-icon"></i>
          <span>Hubungi Developer</span>
        </router-link>

      </nav>
    </aside>

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