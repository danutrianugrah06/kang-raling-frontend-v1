<template>
  <div class="js-page-content">
    <link
      href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />

    <!-- Page Header -->
    <div class="js-page-header">
      <div>
        <h1 class="js-page-title">Kelola Jenis Sampah</h1>
        <p class="js-page-subtitle">Master data jenis sampah untuk referensi input data</p>
      </div>
      <button class="js-btn-add" @click="bukaModalTambah" :disabled="loadingSubmit">
        <i class="bi bi-plus-lg"></i> Tambah Jenis Sampah
      </button>
    </div>

    <!-- Table Card -->
    <div class="js-table-card">

      <!-- Search Bar -->
      <div class="js-search-bar">
        <div class="js-search-wrap">
          <i class="bi bi-search"></i>
          <input
            v-model="keyword"
            @input="filterData"
            type="text"
            class="js-search-input"
            placeholder="Cari nama jenis sampah atau deskripsi..."
            aria-label="Cari jenis sampah"
          />
        </div>
      </div>

      <!-- Table -->
      <div class="js-table-wrap">
        <table class="js-table" role="table" aria-label="Daftar jenis sampah">
          <thead>
            <tr>
              <!-- Class lebar kolom menggantikan inline style width -->
              <th class="js-th-no">No</th>
              <th class="js-th-nama">Nama Jenis</th>
              <th class="js-th-deskripsi">Deskripsi</th>
              <th class="js-th-aksi">Aksi</th>
            </tr>
          </thead>
          <tbody>

            <!-- Skeleton Loader -->
            <template v-if="loading">
              <tr v-for="n in 4" :key="'sk-'+n">
                <td><div class="js-skel js-skel-no"></div></td>
                <td><div class="js-skel js-skel-nama"></div></td>
                <td>
                  <div class="js-skel js-skel-desk-full"></div>
                  <div class="js-skel js-skel-desk-half"></div>
                </td>
                <td>
                  <div class="js-aksi">
                    <div class="js-skel js-skel-btn"></div>
                    <div class="js-skel js-skel-btn"></div>
                  </div>
                </td>
              </tr>
            </template>

            <!-- Empty State -->
            <template v-else-if="dataFilter.length === 0">
              <tr>
                <td colspan="4">
                  <div class="js-empty">
                    <div class="js-empty-icon"><i class="bi bi-archive"></i></div>
                    <p class="js-empty-title">Belum ada jenis sampah</p>
                    <p class="js-empty-desc">
                      {{ keyword ? 'Tidak ada data yang cocok dengan pencarian ini.' : 'Mulai tambahkan jenis sampah pertama.' }}
                    </p>
                  </div>
                </td>
              </tr>
            </template>

            <!-- Data Rows -->
            <template v-else>
              <tr v-for="(item, index) in dataFilter" :key="item.id" class="js-data-row">
                <td class="js-td-center">{{ index + 1 }}</td>
                <td><p class="js-td-nama">{{ item.nama }}</p></td>
                <td><p class="js-td-desk">{{ item.deskripsi || '-' }}</p></td>
                <td>
                  <div class="js-aksi">
                    <button class="js-btn-icon js-btn-edit" @click="bukaModalEdit(item)" title="Edit">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="js-btn-icon js-btn-hapus" @click="konfirmasiHapus(item)" title="Hapus">
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
      class="js-modal-overlay"
      @click.self="tutupModalForm"
      role="dialog"
      aria-modal="true"
    >
      <!-- Class js-modal-form menggantikan inline style max-width:500px; -->
      <div class="js-modal js-modal-form">
        <div class="js-modal-header">
          <h2 class="js-modal-title">
            {{ modeEdit ? 'Edit Jenis Sampah' : 'Tambah Jenis Sampah' }}
          </h2>
          <button class="js-modal-close" @click="tutupModalForm" aria-label="Tutup modal">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="js-modal-body">

          <div class="js-form-group">
            <label class="js-form-label" for="js-nama">Nama Jenis <span>*</span></label>
            <input
              id="js-nama"
              v-model="form.nama"
              type="text"
              :class="['js-form-input', { error: errors.nama }]"
              placeholder="Contoh: Organik, Anorganik..."
              autocomplete="off"
            />
            <p v-if="errors.nama" class="js-form-error">
              <i class="bi bi-exclamation-circle"></i> {{ errors.nama }}
            </p>
          </div>

          <div class="js-form-group">
            <label class="js-form-label" for="js-deskripsi">Deskripsi</label>
            <textarea
              id="js-deskripsi"
              v-model="form.deskripsi"
              class="js-form-textarea"
              placeholder="Tulis deskripsi singkat tentang jenis sampah ini..."
            ></textarea>
          </div>

        </div>
        <div class="js-modal-footer">
          <button class="js-btn-cancel" @click="tutupModalForm" :disabled="loadingSubmit">Batal</button>
          <button class="js-btn-save" @click="simpanData" :disabled="loadingSubmit">
            <i v-if="loadingSubmit" class="bi bi-arrow-repeat js-spin"></i>
            <i v-else class="bi bi-check-lg"></i>
            {{ loadingSubmit ? 'Menyimpan...' : (modeEdit ? 'Simpan Perubahan' : 'Tambah Data') }}
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL KONFIRMASI HAPUS -->
    <div
      v-if="showModalHapus"
      class="js-modal-overlay"
      @click.self="tutupModalHapus"
      role="dialog"
      aria-modal="true"
    >
      <div class="js-modal js-modal-sm">
        <div class="js-modal-header">
          <h2 class="js-modal-title">Konfirmasi Hapus</h2>
          <button class="js-modal-close" @click="tutupModalHapus" aria-label="Tutup modal">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="js-modal-body">
          <div class="js-confirm-icon" aria-hidden="true">
            <i class="bi bi-trash3"></i>
          </div>
          <p class="js-confirm-title">Hapus Jenis Sampah?</p>
          <p class="js-confirm-desc">
            Kamu akan menghapus data <strong>"{{ modalHapus.nama }}"</strong>.
            Tindakan ini tidak bisa dibatalkan.
          </p>
        </div>
        <div class="js-modal-footer">
          <button class="js-btn-cancel" @click="tutupModalHapus" :disabled="loadingHapus">Batal</button>
          <button class="js-btn-hapus-confirm" @click="hapusData" :disabled="loadingHapus">
            <i v-if="loadingHapus" class="bi bi-arrow-repeat js-spin"></i>
            <i v-else class="bi bi-trash3"></i>
            {{ loadingHapus ? 'Menghapus...' : 'Ya, Hapus' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toast Notifikasi -->
    <div class="js-toast-wrap" aria-live="polite">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['js-toast', 'js-toast-' + toast.type]"
        role="alert"
      >
        <i :class="['js-toast-icon bi', toastIcon(toast.type)]"></i>
        <span>{{ toast.message }}</span>
      </div>
    </div>

  </div>
</template>

<script>
import jenisSampahScript from '@/scripts/dashboard/jenisSampah.js'
import '@/assets/css/dashboard/jenisSampah.css'

export default {
  name: 'DashboardJenisSampah',
  ...jenisSampahScript,
}
</script>

<style scoped>
.js-spin {
  animation: spin 0.8s linear infinite;
  display: inline-block;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>