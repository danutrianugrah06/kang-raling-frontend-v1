<template>
  <div class="ar-page-content">
    <link
      href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />

    <div class="ar-page-header">
      <div>
        <h1 class="ar-page-title">Kelola Artikel</h1>
        <p class="ar-page-subtitle">
          Manajemen konten edukasi dan berita lingkungan Kabupaten Garut
        </p>
      </div>
      <button class="ar-btn-add" @click="bukaModalTambah">
        <i class="bi bi-plus-lg"></i> Tambah Artikel
      </button>
    </div>

    <div class="ar-table-card">

      <!-- Filter bar dengan padding top yang sudah diekstrak ke CSS -->
      <div class="ar-filter-top-padding">
        <div class="ar-filter-bar">
          <div class="ar-search-wrap">
            <i class="bi bi-search"></i>
            <input
              v-model="searchQuery"
              @input="onSearch"
              type="text"
              class="ar-search-input"
              placeholder="Cari artikel..."
              aria-label="Cari artikel"
            />
          </div>
        </div>
      </div>

      <div class="ar-table-wrap">
        <table class="ar-table" role="table" aria-label="Daftar artikel">
          <thead>
            <tr>
              <!-- Class lebar kolom (menggantikan inline style width) -->
              <th class="ar-th-artikel">Artikel</th>
              <th class="ar-th-tanggal">Tanggal Posting</th>
              <th class="ar-th-aksi">Aksi</th>
            </tr>
          </thead>
          <tbody>

            <!-- Skeleton loading -->
            <template v-if="loading">
              <tr v-for="n in 5" :key="'sk-'+n" class="ar-skeleton-row">
                <td>
                  <div class="ar-artikel-cell">
                    <div class="ar-skel ar-skel-thumb"></div>
                    <div>
                      <div class="ar-skel ar-skel-text-lg"></div>
                      <div class="ar-skel ar-skel-text-sm"></div>
                    </div>
                  </div>
                </td>
                <td><div class="ar-skel ar-skel-date"></div></td>
                <td>
                  <div class="ar-aksi">
                    <div class="ar-skel ar-skel-btn"></div>
                    <div class="ar-skel ar-skel-btn"></div>
                  </div>
                </td>
              </tr>
            </template>

            <!-- Empty state (belum ada data) -->
            <template v-else-if="artikels.length === 0">
              <tr>
                <td colspan="3">
                  <div class="ar-empty">
                    <div class="ar-empty-icon">
                      <i class="bi bi-newspaper"></i>
                    </div>
                    <p class="ar-empty-title">Belum ada artikel</p>
                    <p class="ar-empty-desc">
                      {{ searchQuery
                        ? 'Tidak ada artikel yang cocok dengan pencarian ini.'
                        : 'Mulai tambahkan artikel pertama kamu.' }}
                    </p>
                    <button
                      v-if="!searchQuery"
                      class="ar-btn-add"
                      @click="bukaModalTambah"
                    >
                      <i class="bi bi-plus-lg"></i> Tambah Artikel
                    </button>
                  </div>
                </td>
              </tr>
            </template>

            <!-- Data artikel normal -->
            <template v-else>
              <tr v-for="artikel in artikels" :key="artikel.id">
                <td>
                  <div class="ar-artikel-cell">
                    <img
                      v-if="getGambarUrl(artikel.gambar)"
                      :src="getGambarUrl(artikel.gambar)"
                      :alt="artikel.judul"
                      class="ar-thumb"
                      loading="lazy"
                    />
                    <div v-else class="ar-thumb-placeholder" aria-hidden="true">
                      <i class="bi bi-image"></i>
                    </div>
                    <div>
                      <p class="ar-artikel-judul">{{ artikel.judul }}</p>
                      <p class="ar-artikel-penulis">
                        Penulis: {{ artikel.user ? artikel.user.nama : 'Admin' }}
                      </p>
                    </div>
                  </div>
                </td>
                <td>{{ formatTanggal(artikel.created_at) }}</td>
                <td>
                  <div class="ar-aksi">
                    <button
                      class="ar-btn-icon ar-btn-edit"
                      @click="bukaModalEdit(artikel)"
                      :aria-label="'Edit artikel ' + artikel.judul"
                      title="Edit"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      class="ar-btn-icon ar-btn-hapus"
                      @click="bukaModalHapus(artikel)"
                      :aria-label="'Hapus artikel ' + artikel.judul"
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
      <div v-if="!loading && artikels.length > 0" class="ar-table-footer">
        <p class="ar-pagination-info">
          Menampilkan {{ (currentPage - 1) * perPage + 1 }}–{{ Math.min(currentPage * perPage, total) }}
          dari {{ total.toLocaleString('id-ID') }} artikel
        </p>
        <div class="ar-pagination" role="navigation" aria-label="Navigasi halaman">
          <button
            class="ar-page-btn"
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            aria-label="Halaman sebelumnya"
          >
            <i class="bi bi-chevron-left"></i>
          </button>
          <button
            v-for="pg in pageNumbers"
            :key="pg"
            :class="['ar-page-btn', { active: pg === currentPage }]"
            @click="goToPage(pg)"
            :aria-label="'Halaman ' + pg"
            :aria-current="pg === currentPage ? 'page' : undefined"
          >
            {{ pg }}
          </button>
          <button
            class="ar-page-btn"
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
      class="ar-modal-overlay"
      @click.self="tutupModal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ar-modal-title"
    >
      <div class="ar-modal">
        <div class="ar-modal-header">
          <h2 class="ar-modal-title" id="ar-modal-title">
            {{ isEdit ? 'Edit Artikel' : 'Tambah Artikel Baru' }}
          </h2>
          <button class="ar-modal-close" @click="tutupModal" aria-label="Tutup modal">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="ar-modal-body">

          <div class="ar-form-group">
            <label class="ar-form-label" for="ar-judul">Judul Artikel <span>*</span></label>
            <input
              id="ar-judul"
              v-model="form.judul"
              type="text"
              :class="['ar-form-input', { error: formErrors.judul }]"
              placeholder="Masukkan judul artikel..."
              autocomplete="off"
            />
            <p v-if="formErrors.judul" class="ar-form-error">
              <i class="bi bi-exclamation-circle"></i> {{ formErrors.judul }}
            </p>
          </div>

          <div class="ar-form-group">
            <label class="ar-form-label" for="ar-isi">Isi Artikel <span>*</span></label>
            <textarea
              id="ar-isi"
              v-model="form.isi_artikel"
              :class="['ar-form-textarea', { error: formErrors.isi_artikel }]"
              placeholder="Tulis isi artikel di sini..."
            ></textarea>
            <p v-if="formErrors.isi_artikel" class="ar-form-error">
              <i class="bi bi-exclamation-circle"></i> {{ formErrors.isi_artikel }}
            </p>
          </div>

          <div class="ar-form-group">
            <label class="ar-form-label">Gambar Cover</label>
            <div v-if="previewGambar" class="ar-preview-wrap">
              <img :src="previewGambar" alt="Preview gambar artikel" class="ar-preview-img" />
              <button
                type="button"
                class="ar-preview-remove"
                @click="hapusPreviewGambar"
                aria-label="Hapus gambar"
              >
                <i class="bi bi-x"></i>
              </button>
            </div>
            <div v-else class="ar-upload-area">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                @change="onGambarChange"
                aria-label="Upload gambar artikel"
              />
              <i class="bi bi-cloud-upload ar-upload-icon"></i>
              <p class="ar-upload-text"><strong>Klik untuk upload</strong> atau seret file ke sini</p>
              <p class="ar-upload-hint">JPG, PNG, WebP - Maks. 10MB</p>
            </div>
          </div>

        </div>
        <div class="ar-modal-footer">
          <button class="ar-btn-cancel" @click="tutupModal" :disabled="submitting">Batal</button>
          <button class="ar-btn-save" @click="submitForm" :disabled="submitting">
            <i v-if="submitting" class="bi bi-arrow-repeat ar-spin"></i>
            <i v-else class="bi bi-check-lg"></i>
            {{ submitting ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Tambah Artikel') }}
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL KONFIRMASI HAPUS -->
    <div
      v-if="showModalHapus"
      class="ar-modal-overlay"
      @click.self="tutupModalHapus"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ar-hapus-title"
    >
      <div class="ar-modal ar-modal-sm">
        <div class="ar-modal-header">
          <h2 class="ar-modal-title" id="ar-hapus-title">Konfirmasi Hapus</h2>
          <button class="ar-modal-close" @click="tutupModalHapus" aria-label="Tutup modal">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="ar-modal-body">
          <div class="ar-confirm-icon" aria-hidden="true">
            <i class="bi bi-trash3"></i>
          </div>
          <p class="ar-confirm-title">Hapus Artikel Ini?</p>
          <p class="ar-confirm-desc">
            Kamu akan menghapus artikel <strong>"{{ hapusJudul }}"</strong>.
            Tindakan ini tidak bisa dibatalkan.
          </p>
        </div>
        <div class="ar-modal-footer">
          <button class="ar-btn-cancel" @click="tutupModalHapus" :disabled="deletingId !== null">Batal</button>
          <button class="ar-btn-hapus-confirm" @click="konfirmasiHapus" :disabled="deletingId !== null">
            <i v-if="deletingId !== null" class="bi bi-arrow-repeat ar-spin"></i>
            <i v-else class="bi bi-trash3"></i>
            {{ deletingId !== null ? 'Menghapus...' : 'Ya, Hapus' }}
          </button>
        </div>
      </div>
    </div>

    <!-- TOAST NOTIFIKASI -->
    <div class="ar-toast-wrap" aria-live="polite">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['ar-toast', 'ar-toast-' + toast.type]"
        role="alert"
      >
        <i :class="['ar-toast-icon bi', toastIcon(toast.type)]"></i>
        <span>{{ toast.message }}</span>
      </div>
    </div>

  </div>
</template>

<script>
import artikelScript from '@/scripts/dashboard/artikel.js'
import '@/assets/css/dashboard/kelolaArtikel.css'

export default {
  name: 'DashboardArtikel',
  ...artikelScript,
}
</script>

<style scoped>
/* Animasi spin untuk ikon loading */
.ar-spin {
  animation: spin 0.8s linear infinite;
  display: inline-block;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>