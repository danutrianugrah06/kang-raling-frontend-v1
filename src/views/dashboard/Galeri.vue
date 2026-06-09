<template>
  <div class="gl-page-content">
    <link
      href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />

    <div class="gl-page-header">
      <div>
        <h1 class="gl-page-title">Kelola Galeri</h1>
        <p class="gl-page-subtitle">
          Manajemen foto kegiatan lingkungan Kabupaten Garut
        </p>
      </div>
      <button class="gl-btn-add" @click="bukaModalTambah">
        <i class="bi bi-plus-lg"></i> Tambah Gambar
      </button>
    </div>

    <div class="gl-table-card">

      <!-- Filter bar (search) -->
      <div class="gl-filter-bar">
        <div class="gl-search-wrap">
          <i class="bi bi-search"></i>
          <input
            v-model="searchQuery"
            @input="onSearch"
            type="text"
            class="gl-search-input"
            placeholder="Cari keterangan foto..."
            aria-label="Cari foto"
          />
        </div>
      </div>

      <div class="gl-table-wrap">
        <table class="gl-table" role="table" aria-label="Daftar foto galeri">
          <thead>
            <tr>
              <!-- Class lebar kolom (menggantikan inline style width) -->
              <th class="gl-th-gambar">Gambar</th>
              <th class="gl-th-keterangan">Keterangan</th>
              <th class="gl-th-tanggal">Tanggal Unggah</th>
              <th class="gl-th-aksi">Aksi</th>
            </tr>
          </thead>
          <tbody>

            <!-- Skeleton loading -->
            <template v-if="loading">
              <tr v-for="n in 6" :key="'sk-'+n" class="gl-skeleton-row">
                <td><div class="gl-skel gl-skel-foto"></div></td>
                <td>
                  <div class="gl-skel gl-skel-text"></div>
                  <div class="gl-skel gl-skel-text-s"></div>
                </td>
                <td><div class="gl-skel gl-skel-date"></div></td>
                <td>
                  <div class="gl-aksi">
                    <div class="gl-skel gl-skel-btn"></div>
                    <div class="gl-skel gl-skel-btn"></div>
                  </div>
                </td>
              </tr>
            </template>

            <!-- Empty state -->
            <template v-else-if="galeris.length === 0">
              <tr>
                <td colspan="4">
                  <div class="gl-empty">
                    <div class="gl-empty-icon">
                      <i class="bi bi-images"></i>
                    </div>
                    <p class="gl-empty-title">Belum ada foto di galeri</p>
                    <p class="gl-empty-desc">
                      {{ searchQuery
                        ? 'Tidak ada foto yang cocok dengan pencarian ini.'
                        : 'Mulai unggah foto kegiatan lingkungan.' }}
                    </p>
                    <button
                      v-if="!searchQuery"
                      class="gl-btn-add"
                      @click="bukaModalTambah"
                    >
                      <i class="bi bi-plus-lg"></i> Tambah Gambar
                    </button>
                  </div>
                </td>
              </tr>
            </template>

            <!-- Data galeri normal -->
            <template v-else>
              <tr v-for="item in galeris" :key="item.id">
                <td>
                  <img
                    v-if="getGambarUrl(item.gambar)"
                    :src="getGambarUrl(item.gambar)"
                    :alt="item.keterangan || 'Foto galeri'"
                    class="gl-foto"
                    loading="lazy"
                  />
                  <div v-else class="gl-foto-placeholder" aria-hidden="true">
                    <i class="bi bi-image"></i>
                  </div>
                </td>
                <td>
                  <p class="gl-keterangan">{{ item.keterangan || '-' }}</p>
                </td>
                <td>{{ formatTanggal(item.created_at) }}</td>
                <td>
                  <div class="gl-aksi">
                    <button
                      class="gl-btn-icon gl-btn-edit"
                      @click="bukaModalEdit(item)"
                      :aria-label="'Edit foto ' + (item.keterangan || '')"
                      title="Edit"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      class="gl-btn-icon gl-btn-hapus"
                      @click="bukaModalHapus(item)"
                      :aria-label="'Hapus foto ' + (item.keterangan || '')"
                      title="Hapus"
                    >
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
      <div v-if="!loading && galeris.length > 0" class="gl-table-footer">
        <p class="gl-pagination-info">
          Menampilkan {{ (currentPage - 1) * perPage + 1 }}–{{ Math.min(currentPage * perPage, total) }}
          dari {{ total.toLocaleString('id-ID') }} foto
        </p>
        <div class="gl-pagination" role="navigation" aria-label="Navigasi halaman">
          <button
            class="gl-page-btn"
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            aria-label="Halaman sebelumnya"
          >
            <i class="bi bi-chevron-left"></i>
          </button>
          <button
            v-for="pg in pageNumbers"
            :key="pg"
            :class="['gl-page-btn', { active: pg === currentPage }]"
            @click="goToPage(pg)"
            :aria-label="'Halaman ' + pg"
            :aria-current="pg === currentPage ? 'page' : undefined"
          >
            {{ pg }}
          </button>
          <button
            class="gl-page-btn"
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === lastPage"
            aria-label="Halaman berikutnya"
          >
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>

    </div>

    <!-- MODAL TAMBAH / EDIT -->
    <div
      v-if="showModal"
      class="gl-modal-overlay"
      @click.self="tutupModal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gl-modal-title"
    >
      <div class="gl-modal">
        <div class="gl-modal-header">
          <h2 class="gl-modal-title" id="gl-modal-title">
            {{ isEdit ? 'Edit Foto Galeri' : 'Tambah Foto Baru' }}
          </h2>
          <button class="gl-modal-close" @click="tutupModal" aria-label="Tutup modal">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="gl-modal-body">

          <div class="gl-form-group">
            <label class="gl-form-label">Foto <span>*</span></label>
            <div v-if="previewGambar" class="gl-preview-wrap">
              <img :src="previewGambar" alt="Preview foto galeri" class="gl-preview-img" />
              <button
                type="button"
                class="gl-preview-remove"
                @click="hapusPreviewGambar"
                aria-label="Hapus foto"
              >
                <i class="bi bi-x"></i>
              </button>
            </div>
            <div v-else class="gl-upload-area">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                @change="onGambarChange"
                aria-label="Upload foto galeri"
              />
              <i class="bi bi-cloud-upload gl-upload-icon"></i>
              <p class="gl-upload-text"><strong>Klik untuk upload</strong> atau seret file ke sini</p>
              <p class="gl-upload-hint">JPG, PNG, WebP - Maks. 10MB</p>
            </div>
            <p v-if="formErrors.gambar" class="gl-form-error">
              <i class="bi bi-exclamation-circle"></i> {{ formErrors.gambar }}
            </p>
          </div>

          <div class="gl-form-group">
            <label class="gl-form-label" for="gl-keterangan">Keterangan Foto <span>*</span></label>
            <textarea
              id="gl-keterangan"
              v-model="form.keterangan"
              :class="['gl-form-textarea', { error: formErrors.keterangan }]"
              placeholder="Deskripsikan foto ini..."
            ></textarea>
            <p v-if="formErrors.keterangan" class="gl-form-error">
              <i class="bi bi-exclamation-circle"></i> {{ formErrors.keterangan }}
            </p>
          </div>

        </div>
        <div class="gl-modal-footer">
          <button class="gl-btn-cancel" @click="tutupModal" :disabled="submitting">Batal</button>
          <button class="gl-btn-save" @click="submitForm" :disabled="submitting">
            <i v-if="submitting" class="bi bi-arrow-repeat gl-spin"></i>
            <i v-else class="bi bi-check-lg"></i>
            {{ submitting ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Tambah Foto') }}
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL KONFIRMASI HAPUS -->
    <div
      v-if="showModalHapus"
      class="gl-modal-overlay"
      @click.self="tutupModalHapus"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gl-hapus-title"
    >
      <div class="gl-modal gl-modal-sm">
        <div class="gl-modal-header">
          <h2 class="gl-modal-title" id="gl-hapus-title">Konfirmasi Hapus</h2>
          <button class="gl-modal-close" @click="tutupModalHapus" aria-label="Tutup modal">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="gl-modal-body">
          <div class="gl-confirm-icon" aria-hidden="true">
            <i class="bi bi-trash3"></i>
          </div>
          <p class="gl-confirm-title">Hapus Foto Ini?</p>
          <p class="gl-confirm-desc">
            Kamu akan menghapus foto <strong>"{{ hapusKeterangan }}"</strong>.
            Tindakan ini tidak bisa dibatalkan.
          </p>
        </div>
        <div class="gl-modal-footer">
          <button class="gl-btn-cancel" @click="tutupModalHapus" :disabled="deletingId !== null">Batal</button>
          <button class="gl-btn-hapus-confirm" @click="konfirmasiHapus" :disabled="deletingId !== null">
            <i v-if="deletingId !== null" class="bi bi-arrow-repeat gl-spin"></i>
            <i v-else class="bi bi-trash3"></i>
            {{ deletingId !== null ? 'Menghapus...' : 'Ya, Hapus' }}
          </button>
        </div>
      </div>
    </div>

    <!-- TOAST NOTIFIKASI -->
    <div class="gl-toast-wrap" aria-live="polite">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['gl-toast', 'gl-toast-' + toast.type]"
        role="alert"
      >
        <i :class="['gl-toast-icon bi', toastIcon(toast.type)]"></i>
        <span>{{ toast.message }}</span>
      </div>
    </div>

  </div>
</template>

<script>
import galeriScript from '@/scripts/dashboard/galeri.js'
import '@/assets/css/dashboard/kelolaGaleri.css'

export default {
  name: 'DashboardGaleri',
  ...galeriScript,

  computed: {
    // Nomor halaman yang ditampilkan (maksimal 2 di kiri/kanan halaman aktif)
    pageNumbers() {
      const pages = []
      const start = Math.max(1, this.currentPage - 2)
      const end   = Math.min(this.lastPage, this.currentPage + 2)
      for (let i = start; i <= end; i++) pages.push(i)
      return pages
    }
  }
}
</script>

<style scoped>
/* Animasi spin untuk ikon loading */
.gl-spin {
  animation: spin 0.8s linear infinite;
  display: inline-block;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>