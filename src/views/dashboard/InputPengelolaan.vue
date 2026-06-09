<template>
  <div class="ip-page-content">
    <link
      href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />

    <!-- Page Header -->
    <div class="ip-page-header">
      <div>
        <h1 class="ip-page-title">Data Pengelolaan Sampah</h1>
        <p class="ip-page-subtitle">Pencatatan rincian pengelolaan untuk data sampah yang sudah diverifikasi</p>
      </div>
      <button class="ip-btn-add" @click="bukaModalForm" :disabled="loadingSubmit">
        <i class="bi bi-plus-lg"></i> Tambah Pengelolaan
      </button>
    </div>

    <!-- Table Card -->
    <div class="ip-table-card">
      <!-- Search Bar -->
      <div class="ip-search-bar">
        <div class="ip-search-wrap">
          <i class="bi bi-search"></i>
          <input
            v-model="searchQuery"
            type="text"
            class="ip-search-input"
            placeholder="Cari desa, jenis sampah, atau pengelolaan..."
            aria-label="Cari data pengelolaan"
          />
        </div>
      </div>

      <!-- Table -->
      <div class="ip-table-wrap">
        <table class="ip-table" role="table" aria-label="Daftar data pengelolaan">
          <thead>
            <tr>
              <!-- Class lebar kolom (menggantikan inline style) -->
              <th class="ip-th-no">No</th>
              <th class="ip-th-tanggal">Tanggal Input</th>
              <th class="ip-th-sumber">Sumber Sampah</th>
              <th class="ip-th-jenis">Jenis Pengelolaan</th>
              <th class="ip-th-jumlah">Jumlah</th>
              <th class="ip-th-keterangan">Keterangan</th>
              <th class="ip-th-aksi">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <!-- Skeleton Loader -->
            <template v-if="loading">
              <tr v-for="n in 5" :key="'sk-'+n">
                <td><div class="ip-skel ip-skel-no"></div></td>
                <td><div class="ip-skel ip-skel-tanggal"></div></td>
                <td>
                  <div class="ip-skel ip-skel-sumber"></div>
                  <div class="ip-skel ip-skel-sumber-sub"></div>
                </td>
                <td><div class="ip-skel ip-skel-jenis"></div></td>
                <td><div class="ip-skel ip-skel-jumlah"></div></td>
                <td><div class="ip-skel ip-skel-keterangan"></div></td>
                <td>
                  <div class="ip-aksi">
                    <div class="ip-skel ip-skel-btn"></div>
                    <div class="ip-skel ip-skel-btn"></div>
                  </div>
                </td>
              </tr>
            </template>

            <!-- Empty State -->
            <template v-else-if="filteredData.length === 0">
              <tr>
                <td colspan="7">
                  <div class="ip-empty">
                    <div class="ip-empty-icon"><i class="bi bi-recycle"></i></div>
                    <p class="ip-empty-title">Belum ada data pengelolaan</p>
                    <p class="ip-empty-desc">
                      {{ searchQuery ? 'Tidak ada data yang cocok dengan pencarian ini.' : 'Mulai catat pengelolaan untuk data sampah yang telah diverifikasi.' }}
                    </p>
                    <button v-if="!searchQuery" class="ip-btn-add" @click="bukaModalForm">
                      <i class="bi bi-plus-lg"></i> Tambah Pengelolaan
                    </button>
                  </div>
                </td>
              </tr>
            </template>

            <!-- Data Rows -->
            <template v-else>
              <tr v-for="(item, index) in filteredData" :key="item.id" class="ip-data-row">
                <td class="ip-td-center">{{ (currentPage - 1) * perPage + index + 1 }}</td>
                <td>{{ formatTanggal(item.created_at) }}</td>
                <td>
                  <p class="ip-td-nama">{{ item.data_sampah?.desa?.nama_desa || '-' }}</p>
                  <p class="ip-td-sub"><i class="bi bi-box-seam"></i> {{ item.data_sampah?.jenis_sampah?.nama || '-' }}</p>
                </td>
                <td>
                  <span class="ip-text-kelola">{{ item.jenis_pengelolaan?.nama || '-' }}</span>
                </td>
                <td><strong class="ip-text-jumlah">{{ formatAngka(item.jumlah) }} Kg</strong></td>
                <td>
                  <span class="ip-text-keterangan">{{ item.keterangan || '-' }}</span>
                </td>
                <td>
                  <div class="ip-aksi">
                    <button class="ip-btn-icon ip-btn-edit" @click="bukaModalEdit(item)" title="Edit">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="ip-btn-icon ip-btn-hapus" @click="konfirmasiHapus(item)" title="Hapus">
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
      <div v-if="!loading && dataList.length > 0" class="ip-table-footer">
        <p class="ip-pagination-info">
          Menampilkan halaman {{ currentPage }} dari {{ lastPage }}
        </p>
        <div class="ip-pagination" role="navigation">
          <button class="ip-page-btn" @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">
            <i class="bi bi-chevron-left"></i>
          </button>
          <button
            v-for="pg in pageNumbers"
            :key="pg"
            :class="['ip-page-btn', { active: pg === currentPage }]"
            @click="goToPage(pg)"
          >
            {{ pg }}
          </button>
          <button class="ip-page-btn" @click="goToPage(currentPage + 1)" :disabled="currentPage === lastPage">
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL FORM TAMBAH / EDIT -->
    <div v-if="showModalForm" class="ip-modal-overlay" @click.self="tutupModalForm">
      <!-- Class ip-modal-form menggantikan inline style max-width:550px; -->
      <div class="ip-modal ip-modal-form">
        <div class="ip-modal-header">
          <h2 class="ip-modal-title">
            {{ modeEdit ? 'Edit Data Pengelolaan' : 'Tambah Data Pengelolaan' }}
          </h2>
          <button class="ip-modal-close" @click="tutupModalForm"><i class="bi bi-x-lg"></i></button>
        </div>
        <div class="ip-modal-body">
          
          <div class="ip-form-group">
            <label class="ip-form-label">Data Sampah Terverifikasi <span>*</span></label>
            <div v-if="loadingDropdown" class="ip-loading-text"><i class="bi bi-hourglass-split ip-spin"></i> Memuat data...</div>
            <select
              v-else
              v-model="form.data_sampah_id"
              :class="['ip-form-select', { error: errors.data_sampah_id }]"
              :disabled="modeEdit"
            >
              <option value="" disabled> Pilih Data Sampah </option>
              <option v-for="ds in listDataSampah" :key="ds.id" :value="ds.id">
                {{ ds.desa?.nama_desa }} - {{ ds.jenis_sampah?.nama }} ({{ formatAngka(ds.jumlah) }} kg)
              </option>
            </select>
            <p v-if="errors.data_sampah_id" class="ip-form-error"><i class="bi bi-exclamation-circle"></i> {{ errors.data_sampah_id }}</p>
            <p v-if="!loadingDropdown && listDataSampah.length === 0 && !modeEdit" class="ip-form-hint error">
              <i class="bi bi-info-circle"></i> Tidak ada antrean data sampah terverifikasi.
            </p>
          </div>

          <div class="ip-form-row">
            <div class="ip-form-group">
              <label class="ip-form-label">Jenis Pengelolaan <span>*</span></label>
              <div v-if="loadingJenisPengelolaan" class="ip-loading-text"><i class="bi bi-hourglass-split ip-spin"></i> Memuat...</div>
              <select
                v-else
                v-model="form.jenis_pengelolaan_id"
                :class="['ip-form-select', { error: errors.jenis_pengelolaan_id }]"
              >
                <option value="" disabled> Pilih Pengelolaan </option>
                <option v-for="jp in listJenisPengelolaan" :key="jp.id" :value="jp.id">
                  {{ jp.nama }}
                </option>
              </select>
              <p v-if="errors.jenis_pengelolaan_id" class="ip-form-error"><i class="bi bi-exclamation-circle"></i> {{ errors.jenis_pengelolaan_id }}</p>
            </div>
            
            <!-- Class ip-form-group-jumlah menggantikan inline style max-width:150px; -->
            <div class="ip-form-group ip-form-group-jumlah">
              <label class="ip-form-label">Jumlah (Kg) <span>*</span></label>
              <input 
                v-model="form.jumlah" 
                type="number" 
                step="0.01" 
                min="0"
                placeholder="0"
                :class="['ip-form-input', { error: errors.jumlah }]" 
              />
              <p v-if="errors.jumlah" class="ip-form-error"><i class="bi bi-exclamation-circle"></i> {{ errors.jumlah }}</p>
            </div>
          </div>

          <div class="ip-form-group">
            <label class="ip-form-label">Keterangan Tambahan</label>
            <textarea
              v-model="form.keterangan"
              class="ip-form-textarea"
              placeholder="Tuliskan keterangan jika ada..."
            ></textarea>
          </div>

        </div>
        <div class="ip-modal-footer">
          <button class="ip-btn-cancel" @click="tutupModalForm" :disabled="loadingSubmit">Batal</button>
          <button class="ip-btn-save" @click="simpanData" :disabled="loadingSubmit">
            <i v-if="loadingSubmit" class="bi bi-arrow-repeat ip-spin"></i>
            <i v-else class="bi bi-check-lg"></i>
            {{ loadingSubmit ? 'Menyimpan...' : 'Simpan Data' }}
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL KONFIRMASI HAPUS -->
    <div v-if="showModalHapus" class="ip-modal-overlay" @click.self="tutupModalHapus">
      <div class="ip-modal ip-modal-sm">
        <div class="ip-modal-header">
          <h2 class="ip-modal-title">Konfirmasi Hapus</h2>
          <button class="ip-modal-close" @click="tutupModalHapus"><i class="bi bi-x-lg"></i></button>
        </div>
        <div class="ip-modal-body">
          <div class="ip-confirm-icon"><i class="bi bi-trash3"></i></div>
          <p class="ip-confirm-title">Hapus Riwayat Pengelolaan?</p>
          <p class="ip-confirm-desc">Data pengelolaan ini akan dihapus secara permanen.</p>
        </div>
        <div class="ip-modal-footer">
          <button class="ip-btn-cancel" @click="tutupModalHapus" :disabled="loadingHapus">Batal</button>
          <button class="ip-btn-hapus-confirm" @click="hapusData" :disabled="loadingHapus">
            <i v-if="loadingHapus" class="bi bi-arrow-repeat ip-spin"></i>
            <i v-else class="bi bi-trash3"></i> Ya, Hapus
          </button>
        </div>
      </div>
    </div>

    <!-- Toast Notifikasi -->
    <div class="ip-toast-wrap" aria-live="polite">
      <div v-for="toast in toasts" :key="toast.id" :class="['ip-toast', 'ip-toast-' + toast.type]">
        <i :class="['ip-toast-icon bi', toastIcon(toast.type)]"></i>
        <span>{{ toast.message }}</span>
      </div>
    </div>

  </div>
</template>

<script>
import inputPengelolaanScript from '@/scripts/dashboard/inputPengelolaan.js'
import '@/assets/css/dashboard/inputPengelolaan.css'

export default {
  name: 'DashboardInputPengelolaan',
  ...inputPengelolaanScript,
}
</script>

<style scoped>
.ip-spin { 
  animation: spin 0.8s linear infinite; 
  display: inline-block; 
}
@keyframes spin { 
  to { transform: rotate(360deg); } 
}
</style>