<template>
  <div class="al-page-content">
    <link
      href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />

    <!-- Page Header -->
    <div class="al-page-header">
      <div>
        <h1 class="al-page-title">Activity Log</h1>
        <p class="al-page-subtitle">Rekam jejak seluruh aktivitas pengguna sistem</p>
      </div>
    </div>

    <!-- Table Card -->
    <div class="al-table-card">
      
      <!-- Toolbar (Search) -->
      <div class="al-toolbar">
        <div class="al-search-wrap">
          <i class="bi bi-search"></i>
          <input
            v-model="searchQuery"
            type="text"
            class="al-search-input"
            placeholder="Cari deskripsi aktivitas..."
            @input="onSearch"
          />
          <button v-if="searchQuery" class="al-btn-clear" @click="clearSearch" title="Hapus pencarian">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="al-table-wrap">
        <table class="al-table">
          <thead>
            <tr>
              <!-- Class lebar kolom (menggantikan inline style width) -->
              <th class="al-th-no">No</th>
              <th class="al-th-waktu">Waktu</th>
              <th class="al-th-user-ip">User & IP</th>
              <th class="al-th-aksi">Aksi</th>
              <th class="al-th-deskripsi">Deskripsi Aktivitas</th>
            </tr>
          </thead>
          <tbody>
            
            <!-- Skeleton Loader -->
            <template v-if="loading">
              <tr v-for="n in 6" :key="'skel-'+n">
                <td><div class="al-skel al-skel-no"></div></td>
                <td><div class="al-skel al-skel-waktu"></div></td>
                <td>
                  <div class="al-skel al-skel-user"></div>
                  <div class="al-skel al-skel-ip"></div>
                </td>
                <td><div class="al-skel al-skel-aksi"></div></td>
                <td>
                  <div class="al-skel al-skel-deskripsi-full"></div>
                  <div class="al-skel al-skel-deskripsi-half"></div>
                </td>
              </tr>
            </template>

            <!-- Empty State -->
            <template v-else-if="logs.length === 0">
              <tr>
                <td colspan="5">
                  <div class="al-empty">
                    <div class="al-empty-icon"><i class="bi bi-journal-x"></i></div>
                    <p class="al-empty-title">Tidak ada log ditemukan</p>
                    <p class="al-empty-desc">Coba sesuaikan kata kunci pencarian Anda.</p>
                  </div>
                </td>
              </tr>
            </template>

            <!-- Data Rows -->
            <template v-else>
              <tr v-for="(log, index) in logs" :key="log.id" class="al-data-row">
                <td class="al-td-center">{{ (currentPage - 1) * perPage + index + 1 }}</td>
                <td><span class="al-td-time">{{ formatDate(log.created_at) }}</span></td>
                <td>
                  <p class="al-td-user">{{ log.user ? log.user.nama : 'Sistem' }}</p>
                  <p class="al-td-ip"><i class="bi bi-hdd-network"></i> {{ log.ip_address }}</p>
                </td>
                <td><span class="al-text-action">{{ getActionLabel(log.action) }}</span></td>
                <td>
                  <p class="al-td-desc">{{ log.deskripsi }}</p>
                  <p v-if="log.model" class="al-td-model">Ref: {{ log.model }} #{{ log.model_id }}</p>
                </td>
              </tr>
            </template>

          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="al-table-footer">
        <p class="al-pagination-info">Menampilkan halaman {{ currentPage }} dari {{ totalPages }}</p>
        <div class="al-pagination">
          <button class="al-page-btn" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
            <i class="bi bi-chevron-left"></i>
          </button>
          <button
            v-for="p in pageNumbers"
            :key="p"
            class="al-page-btn"
            :class="{ active: p === currentPage, 'is-ellipsis': p === '...' }"
            :disabled="p === '...'"
            @click="p !== '...' && goToPage(p)"
          >
            {{ p }}
          </button>
          <button class="al-page-btn" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- TOAST -->
    <div class="al-toast-wrap" aria-live="polite">
      <div v-for="t in toasts" :key="t.id" :class="['al-toast', 'al-toast-' + t.type]">
        <i :class="['al-toast-icon bi', t.type === 'success' ? 'bi-check-circle-fill' : 'bi-x-circle-fill']"></i>
        <span>{{ t.message }}</span>
      </div>
    </div>

  </div>
</template>

<script>
import activityLogScript from '@/scripts/dashboard/activityLog.js'
import '@/assets/css/dashboard/activityLog.css'

export default {
  name: 'DashboardActivityLog',
  ...activityLogScript,
  computed: {
    pageNumbers() {
      const pages = []
      const total = this.totalPages
      const current = this.currentPage
      if (total <= 7) {
        for (let i = 1; i <= total; i++) pages.push(i)
      } else {
        pages.push(1)
        if (current > 3) pages.push('...')
        for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i)
        if (current < total - 2) pages.push('...')
        pages.push(total)
      }
      return pages
    }
  }
}
</script>