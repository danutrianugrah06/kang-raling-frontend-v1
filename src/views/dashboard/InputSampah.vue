<template>
  <div class="ds-page-content">
    <link
      href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />

    <!-- Page Header -->
    <div class="ds-page-header">
      <div>
        <h1 class="ds-page-title">Kelola Data Sampah</h1>
        <p class="ds-page-subtitle">Pencatatan dan verifikasi volume sampah desa binaan</p>
      </div>
      <button class="ds-btn-add" @click="bukaModalTambah" :disabled="loadingSubmit">
        <i class="bi bi-plus-lg"></i> Entri Data Sampah
      </button>
    </div>

    <!-- Table Card -->
    <div class="ds-table-card">
      <!-- Panel Pesan Penolakan (Fasilitator) -->
      <div v-if="!isAdmin && dataDitolak.length > 0" class="ds-rejection-panel">
        <div class="ds-rejection-panel-header">
          <div class="ds-rejection-panel-title">
            <i class="bi bi-exclamation-triangle-fill"></i>
            <span>Data Sampah Ditolak ({{ dataDitolak.length }})</span>
          </div>
          <button class="ds-rejection-toggle" @click="panelDitolakTerbuka = !panelDitolakTerbuka">
            <i :class="panelDitolakTerbuka ? 'bi bi-chevron-up' : 'bi bi-chevron-down'"></i>
            {{ panelDitolakTerbuka ? 'Sembunyikan' : 'Lihat Detail' }}
          </button>
        </div>
        <p class="ds-rejection-panel-sub">
          Terdapat {{ dataDitolak.length }} data yang ditolak oleh admin. Silakan perbaiki dan kirim ulang.
        </p>

        <div v-if="panelDitolakTerbuka" class="ds-rejection-list">
          <div v-for="item in dataDitolak" :key="'tolak-' + item.id" class="ds-rejection-item">
            <div class="ds-rejection-item-head">
              <div class="ds-rejection-meta">
                <span class="ds-rejection-desa"><i class="bi bi-geo-alt-fill"></i> {{ item.desa?.nama_desa || '-' }}</span>
                <span class="ds-rejection-dot">·</span>
                <span class="ds-rejection-jenis">{{ item.jenis_sampah?.nama || '-' }}</span>
                <span class="ds-rejection-dot">·</span>
                <span class="ds-rejection-jumlah"><i class="bi bi-box-seam"></i> {{ formatAngka(item.jumlah) }} Kg</span>
                <span class="ds-rejection-dot">·</span>
                <span class="ds-rejection-tgl"><i class="bi bi-calendar3"></i> {{ formatTanggal(item.tanggal) }}</span>
              </div>
              <button class="ds-rejection-btn-edit" @click="bukaModalEdit(item)" title="Perbaiki data ini">
                <i class="bi bi-pencil-square"></i> Perbaiki
              </button>
            </div>
            <div class="ds-rejection-catatan">
              <i class="bi bi-chat-square-text-fill"></i>
              <div>
                <p class="ds-rejection-catatan-label">Catatan dari Admin:</p>
                <p class="ds-rejection-catatan-isi">{{ item.catatan_penolakan || 'Tidak ada catatan.' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="ds-search-bar">
        <div class="ds-search-wrap">
          <i class="bi bi-search"></i>
          <input v-model="searchQuery" @input="onSearch" type="text" class="ds-search-input" placeholder="Cari desa atau jenis sampah..." aria-label="Cari data sampah" />
        </div>
      </div>

      <!-- Table -->
      <div class="ds-table-wrap">
        <table class="ds-table" role="table" aria-label="Daftar data sampah">
          <thead>
            <tr>
              <!-- Class lebar kolom (menggantikan inline style) -->
              <th class="ds-th-no">No</th>
              <th class="ds-th-tanggal">Tanggal</th>
              <th class="ds-th-desa">Desa Binaan</th>
              <th class="ds-th-jenis">Jenis Sampah</th>
              <th class="ds-th-jumlah">Jumlah (Kg)</th>
              <th class="ds-th-status">Status</th>
              <th class="ds-th-aksi">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <!-- Skeleton Loader -->
            <template v-if="loading">
              <tr v-for="n in 5" :key="'sk-'+n">
                <td><div class="ds-skel ds-skel-no"></div></td>
                <td><div class="ds-skel ds-skel-tanggal"></div></td>
                <td>
                  <div class="ds-skel ds-skel-desa"></div>
                  <div class="ds-skel ds-skel-desa-sub"></div>
                </td>
                <td><div class="ds-skel ds-skel-jenis"></div></td>
                <td><div class="ds-skel ds-skel-jumlah"></div></td>
                <td><div class="ds-skel ds-skel-badge"></div></td>
                <td>
                  <div class="ds-aksi">
                    <div class="ds-skel ds-skel-btn"></div>
                    <div class="ds-skel ds-skel-btn"></div>
                  </div>
                </td>
              </tr>
            </template>

            <!-- Empty State -->
            <template v-else-if="filteredData.length === 0">
              <tr>
                <td colspan="7">
                  <div class="ds-empty">
                    <div class="ds-empty-icon"><i class="bi bi-clipboard2-data"></i></div>
                    <p class="ds-empty-title">Belum ada data sampah</p>
                    <p class="ds-empty-desc">
                      {{ searchQuery ? 'Tidak ada data yang cocok dengan pencarian ini.' : 'Mulai catat entri data sampah pertama.' }}
                    </p>
                    <button v-if="!searchQuery" class="ds-btn-add" @click="bukaModalTambah">
                      <i class="bi bi-plus-lg"></i> Entri Data Sampah
                    </button>
                  </div>
                </td>
              </tr>
            </template>

            <!-- Data Rows -->
            <template v-else>
              <tr v-for="(item, index) in filteredData" :key="item.id" class="ds-data-row">
                <td class="ds-td-center">{{ (currentPage - 1) * perPage + index + 1 }}</td>
                <td>{{ formatTanggal(item.tanggal) }}</td>
                <td>
                  <p class="ds-td-nama">{{ item.desa ? item.desa.nama_desa : '-' }}</p>
                  <p class="ds-td-sub">Oleh: {{ item.user ? item.user.nama : '-' }}</p>
                </td>
                <td><span class="ds-badge-jenis">{{ item.jenis_sampah ? item.jenis_sampah.nama : '-' }}</span></td>
                <td><strong>{{ formatAngka(item.jumlah) }}</strong></td>
                <td>
                  <span :class="['ds-status-badge', badgeStatus(item.status)]">
                    <i :class="iconStatus(item.status)"></i>
                    {{ capitalize(item.status || 'menunggu') }}
                  </span>
                  <div v-if="item.status === 'ditolak' && item.catatan_penolakan" class="ds-catatan-tooltip">
                    <i class="bi bi-info-circle-fill"></i>
                    <div class="ds-tooltip-text">{{ item.catatan_penolakan }}</div>
                  </div>
                </td>
                <td>
                  <div class="ds-aksi">
                    <button v-if="isAdmin && (item.status === 'menunggu' || item.status === null)" class="ds-btn-icon ds-btn-verifikasi" @click="bukaModalVerifikasi(item)" title="Verifikasi">
                      <i class="bi bi-shield-check"></i>
                    </button>
                    <button v-if="item.status !== 'disetujui' || isAdmin" class="ds-btn-icon ds-btn-edit" @click="bukaModalEdit(item)" title="Edit">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="ds-btn-icon ds-btn-hapus" @click="konfirmasiHapus(item)" title="Hapus">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="!loading && dataList.length > 0" class="ds-table-footer">
        <p class="ds-pagination-info">
          Menampilkan {{ (currentPage - 1) * perPage + 1 }}–{{ Math.min(currentPage * perPage, total) }}
          dari {{ total.toLocaleString('id-ID') }} data
        </p>
        <div class="ds-pagination" role="navigation">
          <button class="ds-page-btn" @click="goToPage(currentPage - 1)" :disabled="currentPage === 1"><i class="bi bi-chevron-left"></i></button>
          <button v-for="pg in pageNumbers" :key="pg" :class="['ds-page-btn', { active: pg === currentPage }]" @click="goToPage(pg)">{{ pg }}</button>
          <button class="ds-page-btn" @click="goToPage(currentPage + 1)" :disabled="currentPage === lastPage"><i class="bi bi-chevron-right"></i></button>
        </div>
      </div>
    </div>

    <!-- MODAL FORM TAMBAH / EDIT -->
    <div v-if="showModalForm" class="ds-modal-overlay" @click.self="tutupModalForm">
      <div class="ds-modal ds-modal-form">
        <div class="ds-modal-header">
          <h2 class="ds-modal-title">{{ modeEdit ? 'Edit Data Sampah' : 'Entri Data Sampah' }}</h2>
          <button class="ds-modal-close" @click="tutupModalForm"><i class="bi bi-x-lg"></i></button>
        </div>
        <div class="ds-modal-body">
          <div class="ds-form-row">
            <div class="ds-form-group">
              <label class="ds-form-label">Desa Binaan <span>*</span></label>
              <select v-model="form.desa_id" :class="['ds-form-select', { error: errors.desa_id }]">
                <option value="" disabled> Pilih Desa </option>
                <option v-for="desa in desasList" :key="desa.id" :value="desa.id">{{ desa.nama_desa }}</option>
              </select>
              <p v-if="errors.desa_id" class="ds-form-error"><i class="bi bi-exclamation-circle"></i> {{ errors.desa_id }}</p>
            </div>
            <div class="ds-form-group">
              <label class="ds-form-label">Tanggal <span>*</span></label>
              <input v-model="form.tanggal" type="date" :class="['ds-form-input', { error: errors.tanggal }]" />
              <p v-if="errors.tanggal" class="ds-form-error"><i class="bi bi-exclamation-circle"></i> {{ errors.tanggal }}</p>
            </div>
          </div>

          <!-- Peringatan jika data ditolak -->
          <div v-if="modeEdit && form.status === 'ditolak'" class="ds-alert-box ds-alert-danger">
            <strong>Catatan Penolakan:</strong> {{ form.catatan_penolakan || 'Tidak ada catatan.' }}
          </div>

          <!-- Dynamic Input Jenis Sampah -->
          <div class="ds-dynamic-section">
            <div class="ds-dynamic-header">
              <label class="ds-form-label">Rincian Sampah <span>*</span></label>
              <button v-if="!modeEdit" class="ds-btn-tambah-baris" @click="tambahBarisSampah">
                <i class="bi bi-plus"></i> Tambah Baris
              </button>
            </div>
            <div v-for="(item, idx) in form.items" :key="idx" class="ds-dynamic-row">
              <div class="ds-dynamic-col ds-dynamic-col-jenis">
                <select v-model="item.jenis_sampah_id" :class="['ds-form-select', { error: errors[`items.${idx}.jenis_sampah_id`] }]">
                  <option value="" disabled> Pilih Jenis </option>
                  <option v-for="jenis in jenisSampahList" :key="jenis.id" :value="jenis.id">{{ jenis.nama }}</option>
                </select>
              </div>
              <div class="ds-dynamic-col ds-dynamic-col-jumlah">
                <input v-model="item.jumlah" type="number" step="0.01" min="0" placeholder="Jumlah (Kg)" :class="['ds-form-input', { error: errors[`items.${idx}.jumlah`] }]" />
              </div>
              <button v-if="!modeEdit && form.items.length > 1" class="ds-btn-hapus-baris" @click="hapusBarisSampah(idx)" title="Hapus baris">
                <i class="bi bi-dash-circle"></i>
              </button>
            </div>
            <p v-if="errors.items" class="ds-form-error"><i class="bi bi-exclamation-circle"></i> {{ errors.items }}</p>
          </div>
        </div>
        <div class="ds-modal-footer">
          <button class="ds-btn-cancel" @click="tutupModalForm" :disabled="loadingSubmit">Batal</button>
          <button class="ds-btn-save" @click="simpanData" :disabled="loadingSubmit">
            <i v-if="loadingSubmit" class="bi bi-arrow-repeat ds-spin"></i>
            <i v-else class="bi bi-check-lg"></i>
            {{ loadingSubmit ? 'Menyimpan...' : (modeEdit ? 'Simpan Perubahan' : 'Kirim Data') }}
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL VERIFIKASI (ADMIN) -->
    <div v-if="showModalVerifikasi" class="ds-modal-overlay" @click.self="tutupModalVerifikasi">
      <div class="ds-modal ds-modal-verify">
        <div class="ds-modal-header">
          <h2 class="ds-modal-title">Verifikasi Data Sampah</h2>
          <button class="ds-modal-close" @click="tutupModalVerifikasi"><i class="bi bi-x-lg"></i></button>
        </div>
        <div class="ds-modal-body">
          <div class="ds-verify-info">
            <p><strong>Desa:</strong> {{ itemVerifikasi?.desa?.nama_desa }}</p>
            <p><strong>Jenis:</strong> {{ itemVerifikasi?.jenis_sampah?.nama }}</p>
            <p><strong>Jumlah:</strong> {{ itemVerifikasi?.jumlah }} Kg</p>
          </div>
          <div class="ds-form-group">
            <label class="ds-form-label">Keputusan Verifikasi <span>*</span></label>
            <div class="ds-radio-group">
              <label class="ds-radio-btn" :class="{ active: formVerifikasi.status === 'disetujui' }">
                <input type="radio" v-model="formVerifikasi.status" value="disetujui">
                <i class="bi bi-check-circle"></i> Setujui
              </label>
              <label class="ds-radio-btn reject" :class="{ active: formVerifikasi.status === 'ditolak' }">
                <input type="radio" v-model="formVerifikasi.status" value="ditolak">
                <i class="bi bi-x-circle"></i> Tolak
              </label>
            </div>
          </div>
          <div v-if="formVerifikasi.status === 'ditolak'" class="ds-form-group">
            <label class="ds-form-label">Catatan Penolakan <span>*</span></label>
            <textarea v-model="formVerifikasi.catatan_penolakan" class="ds-form-textarea" placeholder="Berikan alasan mengapa data ini ditolak agar bisa diperbaiki fasilitator..." :class="{ error: errors.catatan_penolakan }"></textarea>
            <p v-if="errors.catatan_penolakan" class="ds-form-error"><i class="bi bi-exclamation-circle"></i> {{ errors.catatan_penolakan }}</p>
          </div>
        </div>
        <div class="ds-modal-footer">
          <button class="ds-btn-cancel" @click="tutupModalVerifikasi" :disabled="loadingSubmit">Batal</button>
          <button class="ds-btn-save" @click="submitVerifikasi" :disabled="loadingSubmit">
            <i v-if="loadingSubmit" class="bi bi-arrow-repeat ds-spin"></i>
            <i v-else class="bi bi-shield-check"></i>
            {{ loadingSubmit ? 'Memproses...' : 'Proses Verifikasi' }}
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL KONFIRMASI HAPUS -->
    <div v-if="showModalHapus" class="ds-modal-overlay" @click.self="tutupModalHapus">
      <div class="ds-modal ds-modal-sm">
        <div class="ds-modal-header">
          <h2 class="ds-modal-title">Konfirmasi Hapus</h2>
          <button class="ds-modal-close" @click="tutupModalHapus"><i class="bi bi-x-lg"></i></button>
        </div>
        <div class="ds-modal-body">
          <div class="ds-confirm-icon"><i class="bi bi-trash3"></i></div>
          <p class="ds-confirm-title">Hapus Data Sampah?</p>
          <p class="ds-confirm-desc">Tindakan ini tidak bisa dibatalkan.</p>
        </div>
        <div class="ds-modal-footer">
          <button class="ds-btn-cancel" @click="tutupModalHapus" :disabled="loadingHapus">Batal</button>
          <button class="ds-btn-hapus-confirm" @click="hapusData" :disabled="loadingHapus">
            <i v-if="loadingHapus" class="bi bi-arrow-repeat ds-spin"></i>
            <i v-else class="bi bi-trash3"></i> Ya, Hapus
          </button>
        </div>
      </div>
    </div>

    <!-- Toast Notifikasi -->
    <div class="ds-toast-wrap" aria-live="polite">
      <div v-for="toast in toasts" :key="toast.id" :class="['ds-toast', 'ds-toast-' + toast.type]">
        <i :class="['ds-toast-icon bi', toastIcon(toast.type)]"></i>
        <span>{{ toast.message }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import dataSampahScript from '@/scripts/dashboard/dataSampah.js'
import '@/assets/css/dashboard/inputDataSampah.css'

export default {
  name: 'DashboardDataSampah',
  ...dataSampahScript,
  computed: {
    ...dataSampahScript.computed,
    dataDitolak() {
      return this.dataList.filter(item => item.status === 'ditolak' || item.status === 'rejected')
    },
  },
}
</script>

<style scoped>
.ds-spin { animation: spin 0.8s linear infinite; display: inline-block; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>