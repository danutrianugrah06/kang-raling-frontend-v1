<template>
  <div class="vs-page-content">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

    <div class="vs-page-header">
      <div>
        <h1 class="vs-page-title">Verifikasi Data Sampah</h1>
        <p class="vs-page-subtitle">Tinjau dan publikasi entri data sampah dari Fasilitator</p>
      </div>
    </div>

    <div class="vs-table-card">
      <div class="vs-toolbar">
        <div class="vs-search-wrap">
          <i class="bi bi-search"></i>
          <input v-model="searchQuery" type="text" class="vs-search-input" placeholder="Cari desa binaan..." aria-label="Cari data" />
        </div>
        <div class="vs-filter-wrap">
          <select v-model="filterStatus" class="vs-filter-select">
            <option value="">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified (Disetujui)</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div class="vs-table-wrap">
        <table class="vs-table" role="table" aria-label="Daftar verifikasi sampah">
          <thead>
            <tr>
              <th class="vs-th-no">No</th>
              <th class="vs-th-tanggal">Tanggal Entri</th>
              <th class="vs-th-desa">Desa Binaan</th>
              <th class="vs-th-rincian">Rincian Sampah</th>
              <th class="vs-th-status">Status</th>
              <th class="vs-th-aksi">Aksi</th>
            </tr>
          </thead>
          <tbody>
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

            <template v-else>
              <tr v-for="(group, index) in groupedData" :key="group.id" class="vs-data-row">
                <td class="vs-td-center">{{ (currentPage - 1) * 30 + index + 1 }}</td>
                <td>{{ formatTanggal(group.tanggal) }}</td>
                <td>
                  <p class="vs-td-nama">{{ group.desa ? group.desa.nama_desa : '-' }}</p>
                  <p class="vs-td-sub">Oleh: {{ group.user ? group.user.nama : '-' }}</p>
                </td>
                <td>
                  <div class="vs-rincian-list">
                    <div v-for="item in group.items" :key="item.id" class="vs-rincian-item">
                      <span class="vs-rincian-nama">{{ item.jenis_sampah?.nama || '-' }}</span>
                      <span class="vs-rincian-qty">{{ formatAngka(item.jumlah) }} Kg</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span :class="['vs-status-badge', badgeStatus(group.status)]">
                    <i :class="iconStatus(group.status)"></i>
                    {{ capitalize(group.status) }}
                  </span>
                  
                  <div v-if="group.status === 'verified'" class="vs-publish-status" :class="group.is_public ? 'status-public' : 'status-hidden'">
                     <i :class="group.is_public ? 'bi bi-globe' : 'bi bi-lock-fill'"></i>
                     {{ group.is_public ? 'Tayang Publik' : 'Disembunyikan' }}
                  </div>

                  <div v-if="group.status === 'rejected' && group.catatan_penolakan" class="vs-catatan-tooltip">
                    <i class="bi bi-info-circle-fill"></i>
                    <div class="vs-tooltip-text">{{ group.catatan_penolakan }}</div>
                  </div>
                </td>
                <td>
                  <div class="vs-aksi">
                    <template v-if="group.status === 'pending'">
                      <button class="vs-btn-icon vs-btn-verify" @click="bukaModalVerify(group)" title="Setujui Data & Tayangkan" :disabled="loadingAction === group.id">
                        <i v-if="loadingAction === group.id" class="bi bi-arrow-repeat vs-spin"></i>
                        <i v-else class="bi bi-check-lg"></i>
                      </button>
                      <button class="vs-btn-icon vs-btn-reject" @click="bukaModalReject(group)" title="Tolak Entri" :disabled="loadingAction === group.id">
                        <i class="bi bi-x-lg"></i>
                      </button>
                    </template>
                    
                    <template v-else-if="group.status === 'verified'">
                       <!-- Tombol Toggle Publikasi -->
                       <button 
                         class="vs-btn-icon" 
                         :class="group.is_public ? 'vs-btn-published' : 'vs-btn-hidden'" 
                         @click="bukaModalTogglePublish(group)" 
                         :title="group.is_public ? 'Sembunyikan dari Publik' : 'Tayangkan ke Publik'" 
                         :disabled="loadingAction === 'pub'"
                       >
                         <i v-if="loadingAction === 'pub' && groupToTogglePublish?.id === group.id" class="bi bi-arrow-repeat vs-spin"></i>
                         <i v-else :class="group.is_public ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'"></i>
                       </button>
                       <button class="vs-btn-icon vs-btn-cancel-verify" @click="bukaModalCancel(group)" title="Batalkan Verifikasi" :disabled="loadingAction === 'cancel-' + group.id">
                         <i class="bi bi-arrow-counterclockwise"></i>
                       </button>
                    </template>
                    
                    <template v-else>
                       <span class="vs-td-processed"><i class="bi bi-x-circle"></i> Ditolak</span>
                    </template>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <div v-if="!loading && dataList.length > 0" class="vs-table-footer">
        <p class="vs-pagination-info">Menampilkan kelompok data dari total {{ total.toLocaleString('id-ID') }} entri individual</p>
        <div class="vs-pagination" role="navigation">
          <button class="vs-page-btn" @click="goToPage(currentPage - 1)" :disabled="currentPage === 1"><i class="bi bi-chevron-left"></i></button>
          <button v-for="pg in pageNumbers" :key="pg" :class="['vs-page-btn', { active: pg === currentPage }]" @click="goToPage(pg)">{{ pg }}</button>
          <button class="vs-page-btn" @click="goToPage(currentPage + 1)" :disabled="currentPage === lastPage"><i class="bi bi-chevron-right"></i></button>
        </div>
      </div>
    </div>

    <div v-if="showModalReject" class="vs-modal-overlay" @click.self="tutupModalReject">
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
            <textarea v-model="catatanPenolakan" class="vs-form-textarea" placeholder="Beritahu fasilitator mengapa data ini ditolak..." :class="{ error: errorCatatan }"></textarea>
            <p v-if="errorCatatan" class="vs-form-error"><i class="bi bi-exclamation-circle"></i> {{ errorCatatan }}</p>
          </div>
        </div>
        <div class="vs-modal-footer">
          <button class="vs-btn-cancel" @click="tutupModalReject" :disabled="loadingSubmitReject">Batal</button>
          <button class="vs-btn-save-reject" @click="submitReject" :disabled="loadingSubmitReject">
            <i v-if="loadingSubmitReject" class="bi bi-arrow-repeat vs-spin"></i>
            <i v-else class="bi bi-x-circle"></i> {{ loadingSubmitReject ? 'Menyimpan...' : 'Kirim Penolakan' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showModalCancel" class="vs-modal-overlay" @click.self="tutupModalCancel">
      <div class="vs-modal vs-modal-sm">
        <div class="vs-modal-header">
          <h2 class="vs-modal-title">Batalkan Verifikasi</h2>
          <button class="vs-modal-close" @click="tutupModalCancel"><i class="bi bi-x-lg"></i></button>
        </div>
        <div class="vs-modal-body">
          <div class="vs-confirm-icon" style="background: #FFF3E0; color: #F57C00;">
             <i class="bi bi-arrow-counterclockwise"></i>
          </div>
          <p class="vs-confirm-title">Kembalikan ke Pending?</p>
          <p class="vs-confirm-desc">
            Verifikasi data desa <strong>{{ groupToCancel?.desa?.nama_desa }}</strong> akan dibatalkan. 
            Data otomatis disembunyikan dari Publik dan Fasilitator bisa mengeditnya kembali.
          </p>
        </div>
        <div class="vs-modal-footer">
          <button class="vs-btn-cancel" @click="tutupModalCancel" :disabled="loadingAction === 'cancel'">Batal</button>
          <button class="vs-btn-save-reject" style="background: #F57C00;" @click="submitCancelVerify" :disabled="loadingAction === 'cancel'">
            <i v-if="loadingAction === 'cancel'" class="bi bi-arrow-repeat vs-spin"></i>
            <i v-else class="bi bi-arrow-counterclockwise"></i> Ya, Batalkan
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL KONFIRMASI VERIFIKASI -->
    <div v-if="showModalVerify" class="vs-modal-overlay" @click.self="tutupModalVerify">
      <div class="vs-modal vs-modal-sm">
        <div class="vs-modal-header">
          <h2 class="vs-modal-title">Konfirmasi Verifikasi</h2>
          <button class="vs-modal-close" @click="tutupModalVerify"><i class="bi bi-x-lg"></i></button>
        </div>
        <div class="vs-modal-body">
          <div class="vs-confirm-icon" style="background: #E8F5E9; color: #2E7D32;">
             <i class="bi bi-check-circle"></i>
          </div>
          <p class="vs-confirm-title">Setujui & Publikasikan?</p>
          <p class="vs-confirm-desc">
            Data sampah dari desa <strong>{{ groupToVerify?.desa?.nama_desa }}</strong> akan disetujui dan langsung tayang di halaman Web Publik.
          </p>
        </div>
        <div class="vs-modal-footer">
          <button class="vs-btn-cancel" @click="tutupModalVerify" :disabled="loadingAction === 'verify'">Batal</button>
          <button class="vs-btn-save-reject" style="background: #4CAF50;" @click="submitVerify" :disabled="loadingAction === 'verify'">
            <i v-if="loadingAction === 'verify'" class="bi bi-arrow-repeat vs-spin"></i>
            <i v-else class="bi bi-check-lg"></i> Ya, Setujui
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL KONFIRMASI TOGGLE PUBLIKASI -->
    <div v-if="showModalTogglePublish" class="vs-modal-overlay" @click.self="tutupModalTogglePublish">
      <div class="vs-modal vs-modal-sm">
        <div class="vs-modal-header">
          <h2 class="vs-modal-title">
            {{ groupToTogglePublish?.is_public ? 'Sembunyikan Data?' : 'Tayangkan Data?' }}
          </h2>
          <button class="vs-modal-close" @click="tutupModalTogglePublish"><i class="bi bi-x-lg"></i></button>
        </div>
        <div class="vs-modal-body">
          <!-- Ikon akan berwarna Abu-abu jika menyembunyikan, dan Biru jika menayangkan -->
          <div class="vs-confirm-icon" :style="{ background: groupToTogglePublish?.is_public ? '#F3F4F6' : '#E3F2FD', color: groupToTogglePublish?.is_public ? '#6B7280' : '#1E88E5' }">
             <i :class="groupToTogglePublish?.is_public ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'"></i>
          </div>
          <p class="vs-confirm-title">
            {{ groupToTogglePublish?.is_public ? 'Tarik dari Publik?' : 'Tayangkan ke Publik?' }}
          </p>
          <p class="vs-confirm-desc">
            Data desa <strong>{{ groupToTogglePublish?.desa?.nama_desa }}</strong> akan 
            <template v-if="groupToTogglePublish?.is_public">ditarik dan <strong>disembunyikan</strong> dari halaman Web Publik. Masyarakat tidak bisa lagi melihat data ini.</template>
            <template v-else><strong>ditayangkan secara resmi</strong> di halaman Web Publik agar bisa dilihat oleh masyarakat.</template>
          </p>
        </div>
        <div class="vs-modal-footer">
          <button class="vs-btn-cancel" @click="tutupModalTogglePublish" :disabled="loadingAction === 'pub'">Batal</button>
          <!-- Tombol menyesuaikan warna aksi -->
          <button class="vs-btn-save-reject" :style="{ background: groupToTogglePublish?.is_public ? '#6B7280' : '#1E88E5' }" @click="submitTogglePublish" :disabled="loadingAction === 'pub'">
            <i v-if="loadingAction === 'pub'" class="bi bi-arrow-repeat vs-spin"></i>
            <i v-else :class="groupToTogglePublish?.is_public ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'"></i> 
            {{ groupToTogglePublish?.is_public ? 'Ya, Sembunyikan' : 'Ya, Tayangkan' }}
          </button>
        </div>
      </div>
    </div>

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