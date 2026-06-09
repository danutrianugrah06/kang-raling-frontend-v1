<template>
  <div class="jp-page-content">
    <link
      href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />

    <!-- Page Header -->
    <div class="jp-page-header">
      <div>
        <h1 class="jp-page-title">Kelola Jenis Pengelolaan</h1>
        <p class="jp-page-subtitle">Master data jenis pengelolaan untuk referensi input data</p>
      </div>
      <button class="jp-btn-add" @click="bukaModalTambah" :disabled="loadingSubmit">
        <i class="bi bi-plus-lg"></i> Tambah Pengelolaan
      </button>
    </div>

    <!-- Table Card -->
    <div class="jp-table-card">

      <!-- Search Bar -->
      <div class="jp-search-bar">
        <div class="jp-search-wrap">
          <i class="bi bi-search"></i>
          <input
            v-model="keyword"
            @input="filterData"
            type="text"
            class="jp-search-input"
            placeholder="Cari nama jenis pengelolaan atau deskripsi..."
            aria-label="Cari jenis pengelolaan"
          />
        </div>
      </div>

      <!-- Table -->
      <div class="jp-table-wrap">
        <table class="jp-table" role="table" aria-label="Daftar jenis pengelolaan">
          <thead>
            <tr>
              <!-- Class lebar kolom menggantikan inline style width -->
              <th class="jp-th-no">No</th>
              <th class="jp-th-nama">Nama Jenis</th>
              <th class="jp-th-deskripsi">Deskripsi</th>
              <th class="jp-th-aksi">Aksi</th>
            </tr>
          </thead>
          <tbody>

            <!-- Skeleton Loader -->
            <template v-if="loading">
              <tr v-for="n in 4" :key="'sk-'+n">
                <td><div class="jp-skel jp-skel-no"></div></td>
                <td><div class="jp-skel jp-skel-nama"></div></td>
                <td>
                  <div class="jp-skel jp-skel-desk-full"></div>
                  <div class="jp-skel jp-skel-desk-half"></div>
                </td>
                <td>
                  <div class="jp-aksi">
                    <div class="jp-skel jp-skel-btn"></div>
                    <div class="jp-skel jp-skel-btn"></div>
                  </div>
                </td>
              </tr>
            </template>

            <!-- Empty State -->
            <template v-else-if="dataFilter.length === 0">
              <tr>
                <td colspan="4">
                  <div class="jp-empty">
                    <div class="jp-empty-icon"><i class="bi bi-recycle"></i></div>
                    <p class="jp-empty-title">Belum ada jenis pengelolaan</p>
                    <p class="jp-empty-desc">
                      {{ keyword ? 'Tidak ada data yang cocok dengan pencarian ini.' : 'Mulai tambahkan jenis pengelolaan pertama.' }}
                    </p>
                    <button v-if="!keyword" class="jp-btn-add" @click="bukaModalTambah">
                      <i class="bi bi-plus-lg"></i> Tambah Pengelolaan
                    </button>
                  </div>
                </td>
              </tr>
            </template>

            <!-- Data Rows -->
            <template v-else>
              <tr v-for="(item, index) in dataFilter" :key="item.id" class="jp-data-row">
                <td class="jp-td-center">{{ index + 1 }}</td>
                <td><p class="jp-td-nama">{{ item.nama }}</p></td>
                <td><p class="jp-td-desk">{{ item.deskripsi || '-' }}</p></td>
                <td>
                  <div class="jp-aksi">
                    <button class="jp-btn-icon jp-btn-edit" @click="bukaModalEdit(item)" title="Edit">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="jp-btn-icon jp-btn-hapus" @click="konfirmasiHapus(item)" title="Hapus">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </template>

          </tbody>
        </table>
      </div>

    </div>

    <!-- MODAL FORM TAMBAH / EDIT -->
    <div
      v-if="showModalForm"
      class="jp-modal-overlay"
      @click.self="tutupModalForm"
      role="dialog"
      aria-modal="true"
    >
      <!-- Class jp-modal-form menggantikan inline style max-width:500px; -->
      <div class="jp-modal jp-modal-form">
        <div class="jp-modal-header">
          <h2 class="jp-modal-title">
            {{ modeEdit ? 'Edit Jenis Pengelolaan' : 'Tambah Jenis Pengelolaan' }}
          </h2>
          <button class="jp-modal-close" @click="tutupModalForm" aria-label="Tutup modal">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="jp-modal-body">

          <div class="jp-form-group">
            <label class="jp-form-label" for="jp-nama">Nama Jenis <span>*</span></label>
            <input
              id="jp-nama"
              v-model="form.nama"
              type="text"
              :class="['jp-form-input', { error: errors.nama }]"
              placeholder="Contoh: Dikompos, Didaur Ulang..."
              autocomplete="off"
            />
            <p v-if="errors.nama" class="jp-form-error">
              <i class="bi bi-exclamation-circle"></i> {{ errors.nama }}
            </p>
          </div>

          <div class="jp-form-group">
            <label class="jp-form-label" for="jp-deskripsi">Deskripsi</label>
            <textarea
              id="jp-deskripsi"
              v-model="form.deskripsi"
              class="jp-form-textarea"
              placeholder="Tulis deskripsi singkat tentang pengelolaan ini..."
            ></textarea>
          </div>

        </div>
        <div class="jp-modal-footer">
          <button class="jp-btn-cancel" @click="tutupModalForm" :disabled="loadingSubmit">Batal</button>
          <button class="jp-btn-save" @click="simpanData" :disabled="loadingSubmit">
            <i v-if="loadingSubmit" class="bi bi-arrow-repeat jp-spin"></i>
            <i v-else class="bi bi-check-lg"></i>
            {{ loadingSubmit ? 'Menyimpan...' : (modeEdit ? 'Simpan Perubahan' : 'Tambah Data') }}
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL KONFIRMASI HAPUS -->
    <div
      v-if="showModalHapus"
      class="jp-modal-overlay"
      @click.self="tutupModalHapus"
      role="dialog"
      aria-modal="true"
    >
      <div class="jp-modal jp-modal-sm">
        <div class="jp-modal-header">
          <h2 class="jp-modal-title">Konfirmasi Hapus</h2>
          <button class="jp-modal-close" @click="tutupModalHapus" aria-label="Tutup modal">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="jp-modal-body">
          <div class="jp-confirm-icon" aria-hidden="true">
            <i class="bi bi-trash3"></i>
          </div>
          <p class="jp-confirm-title">Hapus Jenis Pengelolaan?</p>
          <p class="jp-confirm-desc">
            Kamu akan menghapus data <strong>"{{ modalHapus.nama }}"</strong>.
            Tindakan ini tidak bisa dibatalkan.
          </p>
        </div>
        <div class="jp-modal-footer">
          <button class="jp-btn-cancel" @click="tutupModalHapus" :disabled="loadingHapus">Batal</button>
          <button class="jp-btn-hapus-confirm" @click="hapusData" :disabled="loadingHapus">
            <i v-if="loadingHapus" class="bi bi-arrow-repeat jp-spin"></i>
            <i v-else class="bi bi-trash3"></i>
            {{ loadingHapus ? 'Menghapus...' : 'Ya, Hapus' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toast Notifikasi -->
    <div class="jp-toast-wrap" aria-live="polite">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['jp-toast', 'jp-toast-' + toast.type]"
        role="alert"
      >
        <i :class="['jp-toast-icon bi', toastIcon(toast.type)]"></i>
        <span>{{ toast.message }}</span>
      </div>
    </div>

  </div>
</template>

<script>
import pengelolaanScript from '@/scripts/dashboard/pengelolaan.js'
import '@/assets/css/dashboard/pengelolaan.css'

export default {
  name: 'DashboardPengelolaan',
  ...pengelolaanScript,
}
</script>

<style scoped>
.jp-spin {
  animation: spin 0.8s linear infinite;
  display: inline-block;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>