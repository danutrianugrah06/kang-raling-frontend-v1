<template>
  <div class="db-index">

    <!-- BANNER SELAMAT DATANG (role-based) -->
    <div class="db-welcome" :class="isAdmin ? 'welcome-admin' : 'welcome-fasil'">
      <div class="db-welcome-text">
        <h1 class="db-welcome-title">Selamat Datang, {{ isAdmin ? 'Admin' : 'Fasilitator' }} 👋</h1>
        <p class="db-welcome-desc">
          {{ isAdmin
            ? 'Pantau dan kelola seluruh data pengelolaan sampah Kabupaten Garut dari satu tempat.'
            : 'Hari ini adalah kesempatan baru untuk mencatat data sampah dengan lebih akurat dan berkontribusi untuk lingkungan yang lebih baik.'
          }}
        </p>
      </div>
      <div class="db-welcome-illustration" aria-hidden="true">
        <i class="bi bi-recycle"></i>
      </div>
    </div>

    <!-- SKELETON LOADER -->
    <div v-if="loading" class="db-skeleton-wrap">
      <div class="db-stat-grid">
        <div v-for="n in 4" :key="n" class="db-stat-card db-skeleton-card">
          <div class="db-skel-line short"></div>
          <div class="db-skel-line long"></div>
          <div class="db-skel-line medium"></div>
        </div>
      </div>
    </div>

    <!-- KONTEN UTAMA (setelah loading selesai) -->
    <template v-else>

      <!-- RINGKASAN UMUM (semua role) -->
      <div class="db-section-label">Ringkasan Umum</div>
      <div class="db-stat-grid">

        <div class="db-stat-card">
          <div class="db-stat-header">
            <span class="db-stat-badge badge-blue">Lokasi</span>
            <div class="db-stat-icon icon-blue"><i class="bi bi-building"></i></div>
          </div>
          <div class="db-stat-value">{{ stats.total_tps ?? '-' }}</div>
          <div class="db-stat-label">Total TPS 3R</div>
          <div class="db-stat-sub"><i class="bi bi-geo-alt-fill"></i><span>Aktif beroperasi</span></div>
        </div>

        <div class="db-stat-card">
          <div class="db-stat-header">
            <span class="db-stat-badge badge-orange">Total Volume</span>
            <div class="db-stat-icon icon-orange"><i class="bi bi-trash3-fill"></i></div>
          </div>
          <div class="db-stat-value">
            {{ stats.volume_sampah != null ? stats.volume_sampah.toLocaleString('id-ID') : '-' }}
            <span class="db-stat-unit">Kg</span>
          </div>
          <div class="db-stat-label">Volume Sampah</div>
          <div class="db-stat-sub"><i class="bi bi-calendar-month"></i><span>Bulan ini</span></div>
        </div>

        <div class="db-stat-card">
          <div class="db-stat-header">
            <span class="db-stat-badge badge-green">Terkelola</span>
            <div class="db-stat-icon icon-green"><i class="bi bi-recycle"></i></div>
          </div>
          <div class="db-stat-value">
            {{ stats.sampah_terkelola != null ? stats.sampah_terkelola.toLocaleString('id-ID') : '-' }}
            <span class="db-stat-unit">Kg</span>
          </div>
          <div class="db-stat-label">Sampah Terkelola</div>
          <div class="db-stat-sub"><i class="bi bi-arrow-up-circle-fill text-success"></i><span>Dari total input</span></div>
        </div>

        <div class="db-stat-card">
          <div class="db-stat-header">
            <span class="db-stat-badge badge-purple">Masyarakat</span>
            <div class="db-stat-icon icon-purple"><i class="bi bi-people-fill"></i></div>
          </div>
          <div class="db-stat-value">{{ stats.total_desa ?? '-' }}</div>
          <div class="db-stat-label">Desa Binaan</div>
          <div class="db-stat-sub"><i class="bi bi-star-fill"></i><span>Sangat Aktif</span></div>
        </div>

      </div>

      <!-- STATISTIK BERDASARKAN ROLE -->
      <div class="db-section-label">{{ isAdmin ? 'Status Verifikasi Data' : 'Status Pengajuan Saya' }}</div>
      <div class="db-stat-grid">

        <!-- FASILITATOR -->
        <template v-if="!isAdmin">
          <div class="db-stat-card">
            <div class="db-stat-header">
              <span class="db-stat-badge badge-blue">Pengajuan</span>
              <div class="db-stat-icon icon-blue"><i class="bi bi-send-fill"></i></div>
            </div>
            <div class="db-stat-value">{{ stats.total_pengajuan ?? '-' }}</div>
            <div class="db-stat-label">Total Pengajuan</div>
            <div class="db-stat-sub"><i class="bi bi-info-circle"></i><span>Data yang dikirim</span></div>
          </div>

          <div class="db-stat-card">
            <div class="db-stat-header">
              <span class="db-stat-badge badge-green">Diterima</span>
              <div class="db-stat-icon icon-green"><i class="bi bi-check-circle-fill"></i></div>
            </div>
            <div class="db-stat-value">{{ stats.diterima ?? '-' }}</div>
            <div class="db-stat-label">Data Diterima</div>
            <div class="db-stat-sub"><i class="bi bi-patch-check-fill text-success"></i><span>Terverifikasi</span></div>
          </div>

          <div class="db-stat-card">
            <div class="db-stat-header">
              <span class="db-stat-badge badge-orange">Dikembalikan</span>
              <div class="db-stat-icon icon-orange"><i class="bi bi-arrow-counterclockwise"></i></div>
            </div>
            <div class="db-stat-value">{{ stats.dikembalikan ?? '-' }}</div>
            <div class="db-stat-label">Dikembalikan</div>
            <div class="db-stat-sub"><i class="bi bi-exclamation-circle text-warning"></i><span>Perlu diperbaiki</span></div>
          </div>

          <div class="db-stat-card">
            <div class="db-stat-header">
              <span class="db-stat-badge badge-red">Pending</span>
              <div class="db-stat-icon icon-red"><i class="bi bi-hourglass-split"></i></div>
            </div>
            <div class="db-stat-value">{{ stats.belum_diverifikasi ?? '-' }}</div>
            <div class="db-stat-label">Belum Diverifikasi</div>
            <div class="db-stat-sub"><i class="bi bi-clock text-danger"></i><span>Menunggu review</span></div>
          </div>
        </template>

        <!-- ADMINISTRATOR -->
        <template v-if="isAdmin">
          <div class="db-stat-card">
            <div class="db-stat-header">
              <span class="db-stat-badge badge-blue">Input</span>
              <div class="db-stat-icon icon-blue"><i class="bi bi-database-fill"></i></div>
            </div>
            <div class="db-stat-value">{{ stats.data_terinput ?? '-' }}</div>
            <div class="db-stat-label">Data Terinput</div>
            <div class="db-stat-sub"><i class="bi bi-file-earmark-text"></i><span>Total entri</span></div>
          </div>

          <div v-if="stats.verifikasi_tertunda > 0" class="db-stat-card card-alert">
            <div class="db-stat-header">
              <span class="db-stat-badge badge-red">Segera!</span>
              <div class="db-stat-icon icon-red"><i class="bi bi-patch-exclamation-fill"></i></div>
            </div>
            <div class="db-stat-value text-danger">{{ stats.verifikasi_tertunda ?? '-' }}</div>
            <div class="db-stat-label">Verifikasi Tertunda</div>
            <div class="db-stat-sub"><i class="bi bi-arrow-right-circle text-danger"></i><span>Segera tindak lanjuti</span></div>
          </div>
          <div v-else class="db-stat-card">
            <div class="db-stat-header">
              <span class="db-stat-badge badge-red">Pending</span>
              <div class="db-stat-icon icon-red"><i class="bi bi-patch-exclamation-fill"></i></div>
            </div>
            <div class="db-stat-value">0</div>
            <div class="db-stat-label">Verifikasi Tertunda</div>
            <div class="db-stat-sub"><i class="bi bi-check-circle text-success"></i><span>Semua sudah ditangani</span></div>
          </div>

          <div class="db-stat-card">
            <div class="db-stat-header">
              <span class="db-stat-badge badge-green">Diterima</span>
              <div class="db-stat-icon icon-green"><i class="bi bi-check-circle-fill"></i></div>
            </div>
            <div class="db-stat-value">{{ stats.diterima ?? '-' }}</div>
            <div class="db-stat-label">Data Diterima</div>
            <div class="db-stat-sub"><i class="bi bi-patch-check-fill text-success"></i><span>Terverifikasi</span></div>
          </div>

          <div class="db-stat-card">
            <div class="db-stat-header">
              <span class="db-stat-badge badge-orange">Dikembalikan</span>
              <div class="db-stat-icon icon-orange"><i class="bi bi-arrow-counterclockwise"></i></div>
            </div>
            <div class="db-stat-value">{{ stats.dikembalikan ?? '-' }}</div>
            <div class="db-stat-label">Dikembalikan</div>
            <div class="db-stat-sub"><i class="bi bi-exclamation-circle text-warning"></i><span>Perlu perbaikan</span></div>
          </div>
        </template>

      </div>

      <!-- BARIS BAWAH: GRAFIK + AKSI CEPAT & BANTUAN -->
      <div class="db-bottom-row">

        <!-- GRAFIK BATANG -->
        <div class="db-chart-card">
          <div class="db-chart-header">
            <div>
              <div class="db-chart-title">Grafik Pengumpulan Sampah</div>
              <div class="db-chart-subtitle">Data volume sampah bulanan (Kg)</div>
            </div>
            <select class="db-chart-select" v-model="selectedYear" @change="loadChartData">
              <option v-for="y in availableYears" :key="y" :value="y">{{ y }}</option>
            </select>
          </div>

          <!-- Tampilan grafik jika ada data -->
          <div class="db-chart-area" v-if="chartData.length > 0">
            <div class="db-bar-chart">
              <div v-for="(item, index) in chartData" :key="index" class="db-bar-col">
                <div class="db-bar-wrap">
                  <!-- Binding style untuk tinggi batang (dinamis, tidak bisa dipindahkan ke CSS) -->
                  <div class="db-bar-fill" :style="{ height: getBarHeight(item.jumlah) + '%' }" :title="item.bulan + ': ' + item.jumlah.toLocaleString('id-ID') + ' Kg'"></div>
                </div>
                <div class="db-bar-label">{{ item.bulan_singkat }}</div>
              </div>
            </div>
            <div class="db-chart-legend">
              <span class="db-legend-dot dot-primary"></span>
              <span>Volume Terkelola</span>
            </div>
          </div>

          <!-- Empty state grafik -->
          <div class="db-chart-empty" v-else>
            <i class="bi bi-bar-chart-line"></i>
            <span>Belum ada data grafik untuk tahun {{ selectedYear }}</span>
          </div>
        </div>

        <!-- KOLOM KANAN (aksi cepat + bantuan) -->
        <div class="db-right-col">

          <!-- AKSI CEPAT -->
          <div class="db-quick-card">
            <div class="db-quick-title"><i class="bi bi-lightning-charge-fill"></i> Aksi Cepat</div>
            <div class="db-quick-list">
              <template v-if="isAdmin">
                <router-link to="/dashboard/verifikasi" class="db-quick-item quick-red">
                  <i class="bi bi-patch-check-fill"></i><span>Verifikasi Data Sampah</span>
                  <span v-if="stats.verifikasi_tertunda > 0" class="db-quick-badge">{{ stats.verifikasi_tertunda }}</span>
                </router-link>
                <router-link to="/dashboard/input-sampah" class="db-quick-item"><i class="bi bi-clipboard-plus-fill"></i><span>Input Data Sampah</span></router-link>
                <router-link to="/dashboard/input-pengelolaan" class="db-quick-item"><i class="bi bi-clipboard-check-fill"></i><span>Input Data Pengelolaan</span></router-link>
                <router-link to="/dashboard/users" class="db-quick-item"><i class="bi bi-people-fill"></i><span>Manajemen User</span></router-link>
                <router-link to="/dashboard/laporan" class="db-quick-item"><i class="bi bi-printer-fill"></i><span>Cetak Laporan</span></router-link>
              </template>
              <template v-else>
                <router-link to="/dashboard/input-sampah" class="db-quick-item quick-primary"><i class="bi bi-clipboard-plus-fill"></i><span>Input Data Sampah</span></router-link>
                <router-link to="/dashboard/input-pengelolaan" class="db-quick-item"><i class="bi bi-clipboard-check-fill"></i><span>Input Data Pengelolaan</span></router-link>
                <router-link to="/dashboard/laporan" class="db-quick-item"><i class="bi bi-printer-fill"></i><span>Cetak Laporan</span></router-link>
              </template>
            </div>
          </div>

          <!-- PUSAT BANTUAN (unduh PDF panduan) -->
          <div class="db-help-card">
            <div class="db-help-icon"><i class="bi bi-question-circle-fill"></i></div>
            <div class="db-help-title">Pusat Bantuan</div>
            <div class="db-help-desc">Unduh panduan terbaru untuk mempermudah proses input dan verifikasi data di lapangan.</div>
            <button class="db-help-btn" @click="downloadPanduan" :disabled="downloadingPdf">
              <i class="bi bi-download"></i><span>{{ downloadingPdf ? 'Menyiapkan...' : 'Unduh PDF Panduan' }}</span>
            </button>
          </div>

        </div>
      </div>

    </template>

    <!-- TOAST NOTIFIKASI -->
    <div class="db-toast" :class="{ show: toast.show, 'toast-success': toast.type === 'success', 'toast-error': toast.type === 'error' }">
      <i :class="toast.type === 'success' ? 'bi bi-check-circle-fill' : 'bi bi-x-circle-fill'"></i>
      <span>{{ toast.message }}</span>
    </div>

  </div>
</template>

<script>
import dashboardIndexScript from '@/scripts/dashboard/dashboardIndex.js'
export default {
  name: 'DashboardIndex',
  ...dashboardIndexScript
}
</script>

<style scoped>
@import '@/assets/css/dashboard/dashboardIndex.css';
</style>