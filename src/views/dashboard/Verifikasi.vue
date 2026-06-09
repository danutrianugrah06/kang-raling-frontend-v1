<template>
  <div class="vs-page-content">
    <link
      href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />

    <!-- Page Header -->
    <div class="vs-page-header">
      <div>
        <h1 class="vs-page-title">Verifikasi Data Sampah</h1>
        <p class="vs-page-subtitle">Tinjau dan publikasi entri data sampah dari Fasilitator</p>
      </div>
    </div>

    <!-- Table Card -->
    <div class="vs-table-card">
      <!-- Search & Filter Bar -->
      <div class="vs-toolbar">
        <div class="vs-search-wrap">
          <i class="bi bi-search"></i>
          <input
            v-model="searchQuery"
            type="text"
            class="vs-search-input"
            placeholder="Cari desa binaan..."
            aria-label="Cari data"
          />
        </div>
        <div class="vs-filter-wrap">
          <select v-model="filterStatus" class="vs-filter-select">
            <option value="">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified (Dipublikasi)</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <!-- Table -->
      <div class="vs-table-wrap">
        <table class="vs-table" role="table" aria-label="Daftar verifikasi sampah">
          <thead>
            <tr>
              <!-- Class lebar kolom (menggantikan inline style width) -->
              <th class="vs-th-no">No</th>
              <th class="vs-th-tanggal">Tanggal Entri</th>
              <th class="vs-th-desa">Desa Binaan</th>
              <th class="vs-th-rincian">Rincian Sampah</th>
              <th class="vs-th-status">Status</th>
              <th class="vs-th-aksi">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <!-- Skeleton Loader -->
            <template v-if="loading">
              <tr v-for="n in 5" :key="'sk-'+n">
                <td><div class="vs-skel vs-skel-no"></div></td>
                <td><div class="vs-skel vs-skel-tanggal"></div></td>
                <td>
                  <div class="vs-skel vs-skel-desa"></div>
                  <div class="vs-skel vs-skel-desa-sub"></div>
                </td>
                <td>
                  <div class="vs-skel vs-skel-rincian"></div>
                  <div class="vs-skel vs-skel-rincian-sm"></div>
                </td>
                <td><div class="vs-skel vs-skel-badge"></div></td>
                <td><div class="vs-skel vs-skel-btn"></div></td>
              </tr>
            </template>

            <!-- Empty State -->
            <template v-else-if="groupedData.length === 0">
              <tr>
                <td colspan="6">
                  <div class="vs-empty">
                    <div class="vs-empty-icon"><i class="bi bi-shield-check"></i></div>
                    <p class="vs-empty-title">Tidak ada antrean verifikasi</p>
                    <p class="vs-empty-desc">
                      {{ searchQuery || filterStatus ? 'Tidak ada data yang sesuai dengan pencarian.' : 'Semua entri data sampah sudah diproses.' }}
                    </p>
                  </div>
                </td>
              </tr>
            </template>

            <!-- Data Rows (Grouped) -->
            <template v-else>
              <tr v-for="(group, index) in groupedData" :key="group.id" class="vs-data-row">
                <td class="vs-td-center">{{ index + 1 }}</td>
                <td>{{ formatTanggal(group.tanggal) }}</td>
                <td>
                  <p class="vs-td-nama">{{ group.desa ? group.desa.nama_desa : '-' }}</p>
                  <p class="vs-td-sub">Oleh: {{ group.user ? group.user.nama : '-' }}</p>
                </td>
                <td>
                  <ul class="vs-rincian-list">
                    <li v-for="item in group.items" :key="item.id">
                      <span class="vs-rincian-jenis">{{ item.jenis_sampah?.nama }}</span>
                      <span class="vs-rincian-jumlah">{{ formatAngka(item.jumlah) }} Kg</span>
                    </li>
                  </ul>
                </td>
                <td>
                  <span :class="['vs-status-badge', badgeStatus(group.status)]">
                    <i :class="iconStatus(group.status)"></i>
                    {{ capitalize(group.status) }}
                  </span>
                  <div v-if="group.status === 'rejected' && group.catatan_penolakan" class="vs-catatan-tooltip">
                    <i class="bi bi-info-circle-fill"></i>
                    <div class="vs-tooltip-text">{{ group.catatan_penolakan }}</div>
                  </div>
                </td>
                <td>
                  <div class="vs-aksi">
                    <template v-if="group.status === 'pending'">
                      <button
                        class="vs-btn-icon vs-btn-verify"
                        @click="prosesVerify(group)"
                        title="Verifikasi & Publikasi"
                        :disabled="loadingAction === group.id"
                      >
                        <i v-if="loadingAction === group.id" class="bi bi-arrow-repeat vs-spin"></i>
                        <i v-else class="bi bi-check-lg"></i>
                      </button>
                      <button
                        class="vs-btn-icon vs-btn-reject"
                        @click="bukaModalReject(group)"
                        title="Tolak Entri"
                        :disabled="loadingAction === group.id"
                      >
                        <i class="bi bi-x-lg"></i>
                      </button>
                    </template>
                    <span v-else class="vs-td-processed">
                      <i class="bi bi-check2-all"></i> Diproses
                    </span>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Pagination Info -->
      <div v-if="!loading && dataList.length > 0" class="vs-table-footer">
        <p class="vs-pagination-info">
          Menampilkan kelompok data dari total {{ total.toLocaleString('id-ID') }} entri individual
        </p>
        <div class="vs-pagination" role="navigation">
          <button class="vs-page-btn" @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">
            <i class="bi bi-chevron-left"></i>
          </button>
          <button
            v-for="pg in pageNumbers"
            :key="pg"
            :class="['vs-page-btn', { active: pg === currentPage }]"
            @click="goToPage(pg)"
          >
            {{ pg }}
          </button>
          <button class="vs-page-btn" @click="goToPage(currentPage + 1)" :disabled="currentPage === lastPage">
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL CATATAN PENOLAKAN -->
    <div v-if="showModalReject" class="vs-modal-overlay" @click.self="tutupModalReject">
      <!-- Class vs-modal-reject menggantikan inline style max-width:450px; -->
      <div class="vs-modal vs-modal-reject">
        <div class="vs-modal-header">
          <h2 class="vs-modal-title">Tolak Data Sampah</h2>
          <button class="vs-modal-close" @click="tutupModalReject"><i class="bi bi-x-lg"></i></button>
        </div>
        <div class="vs-modal-body">
          <div class="vs-alert-box vs-alert-danger">
            <strong>Peringatan:</strong> Data yang ditolak tidak akan dipublikasikan. Fasilitator harus memperbaikinya.
          </div>
          
          <div class="vs-form-group">
            <label class="vs-form-label">Catatan Penolakan <span>*</span></label>
            <textarea
              v-model="catatanPenolakan"
              class="vs-form-textarea"
              placeholder="Beritahu fasilitator mengapa data ini ditolak (misal: jumlah tidak masuk akal, salah tanggal)..."
              :class="{ error: errorCatatan }"
            ></textarea>
            <p v-if="errorCatatan" class="vs-form-error"><i class="bi bi-exclamation-circle"></i> {{ errorCatatan }}</p>
          </div>
        </div>
        <div class="vs-modal-footer">
          <button class="vs-btn-cancel" @click="tutupModalReject" :disabled="loadingSubmitReject">Batal</button>
          <button class="vs-btn-save-reject" @click="submitReject" :disabled="loadingSubmitReject">
            <i v-if="loadingSubmitReject" class="bi bi-arrow-repeat vs-spin"></i>
            <i v-else class="bi bi-x-circle"></i>
            {{ loadingSubmitReject ? 'Menyimpan...' : 'Kirim Penolakan' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toast Notifikasi -->
    <div class="vs-toast-wrap" aria-live="polite">
      <div v-for="toast in toasts" :key="toast.id" :class="['vs-toast', 'vs-toast-' + toast.type]">
        <i :class="['vs-toast-icon bi', toastIcon(toast.type)]"></i>
        <span>{{ toast.message }}</span>
      </div>
    </div>

  </div>
</template>

<script>
import verifikasiScript from '@/scripts/dashboard/verifikasi.js'
import '@/assets/css/dashboard/verifikasi.css'

export default {
  name: 'DashboardVerifikasiSampah',
  ...verifikasiScript,
}
</script>

<style scoped>
.vs-spin { 
  animation: spin 0.8s linear infinite; 
  display: inline-block; 
}
@keyframes spin { 
  to { transform: rotate(360deg); } 
}
</style>