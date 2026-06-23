<template>
  <div>
    <link
      href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />

    <!-- Page Header -->
    <div class="ed-page-header">
      <div>
        <h1 class="ed-page-title">Kelola Edukasi</h1>
        <p class="ed-page-subtitle">
          Manajemen konten edukasi modul dan video lingkungan Kabupaten Garut
        </p>
      </div>
      <button class="ed-btn-add" @click="bukaModalTambah">
        <i class="bi bi-plus-lg"></i> Tambah Konten
      </button>
    </div>

    <!-- Table Card -->
    <div class="ed-table-card">

      <!-- Filter Bar -->
      <div class="ed-filter-bar">
        <div class="ed-search-wrap">
          <i class="bi bi-search"></i>
          <input
            v-model="searchQuery"
            @input="onSearch"
            type="text"
            class="ed-search-input"
            placeholder="Cari judul konten..."
            aria-label="Cari konten edukasi"
          />
        </div>
        <select
          v-model="filterKategori"
          @change="onFilterKategori"
          class="ed-filter-select"
          aria-label="Filter kategori"
        >
          <option value="">Semua Kategori</option>
          <option value="modul">Modul</option>
          <option value="video">Video</option>
        </select>
      </div>

      <!-- Table -->
      <div class="ed-table-wrap">
        <table class="ed-table" role="table" aria-label="Daftar konten edukasi">
          <thead>
            <tr>
              <th class="ed-th-konten">Konten</th>
              <th class="ed-th-kategori">Kategori</th>
              <th class="ed-th-tanggal">Tanggal Ditambah</th>
              <th class="ed-th-aksi">Aksi</th>
            </tr>
          </thead>
          <tbody>

            <!-- Skeleton Loading -->
            <template v-if="loading">
              <tr v-for="n in 5" :key="'sk-'+n">
                <td>
                  <div class="ed-item-cell">
                    <div class="ed-skel ed-skel-thumb"></div>
                    <div>
                      <div class="ed-skel ed-skel-text-lg"></div>
                      <div class="ed-skel ed-skel-text-sm"></div>
                    </div>
                  </div>
                </td>
                <td><div class="ed-skel ed-skel-badge"></div></td>
                <td><div class="ed-skel ed-skel-date"></div></td>
                <td>
                  <div class="ed-aksi">
                    <div class="ed-skel ed-skel-btn"></div>
                    <div class="ed-skel ed-skel-btn"></div>
                  </div>
                </td>
              </tr>
            </template>

            <!-- Empty State -->
            <template v-else-if="edukasis.length === 0">
              <tr>
                <td colspan="4">
                  <div class="ed-empty">
                    <div class="ed-empty-icon"><i class="bi bi-book"></i></div>
                    <p class="ed-empty-title">Belum ada konten edukasi</p>
                    <p class="ed-empty-desc">
                      {{ searchQuery || filterKategori
                        ? 'Tidak ada konten yang cocok dengan filter ini.'
                        : 'Mulai tambahkan modul atau video edukasi.' }}
                    </p>
                  </div>
                </td>
              </tr>
            </template>

            <!-- Data Asli -->
            <template v-else>
              <tr v-for="item in edukasis" :key="item.id">
                <td>
                  <div class="ed-item-cell">
                    <img
                      v-if="getGambarUrl(item.gambar)"
                      :src="getGambarUrl(item.gambar)"
                      :alt="item.judul"
                      class="ed-thumb"
                      loading="lazy"
                    />
                    <div v-else class="ed-thumb-placeholder" aria-hidden="true">
                      <i :class="item.kategori === 'video' ? 'bi bi-play-circle' : 'bi bi-file-earmark-pdf'"></i>
                    </div>
                    <div>
                      <p class="ed-item-judul">{{ item.judul }}</p>
                      <p class="ed-item-meta">Oleh: {{ item.user ? item.user.nama : 'Admin' }}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span :class="['ed-badge', item.kategori === 'video' ? 'ed-badge-video' : 'ed-badge-modul']">
                    <i :class="item.kategori === 'video' ? 'bi bi-play-circle-fill' : 'bi bi-file-earmark-pdf-fill'"></i>
                    {{ item.kategori === 'video' ? 'Video' : 'Modul' }}
                  </span>
                </td>
                <td>{{ formatTanggal(item.created_at) }}</td>
                <td>
                  <div class="ed-aksi">
                    <button
                      class="ed-btn-icon ed-btn-edit"
                      @click="bukaModalEdit(item)"
                      :aria-label="'Edit ' + item.judul"
                      title="Edit"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      class="ed-btn-icon ed-btn-hapus"
                      @click="bukaModalHapus(item)"
                      :aria-label="'Hapus ' + item.judul"
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
      <div v-if="!loading && edukasis.length > 0" class="ed-table-footer">
        <p class="ed-pagination-info">
          Menampilkan {{ (currentPage - 1) * perPage + 1 }}–{{ Math.min(currentPage * perPage, total) }}
          dari {{ total.toLocaleString('id-ID') }} konten
        </p>
        <div class="ed-pagination" role="navigation" aria-label="Navigasi halaman">
          <button
            class="ed-page-btn"
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            aria-label="Halaman sebelumnya"
          >
            <i class="bi bi-chevron-left"></i>
          </button>
          <button
            v-for="pg in pageNumbers"
            :key="pg"
            :class="['ed-page-btn', { active: pg === currentPage }]"
            @click="goToPage(pg)"
            :aria-label="'Halaman ' + pg"
            :aria-current="pg === currentPage ? 'page' : undefined"
          >
            {{ pg }}
          </button>
          <button
            class="ed-page-btn"
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === lastPage"
            aria-label="Halaman berikutnya"
          >
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>

    </div>

    <!-- MODAL FORM TAMBAH / EDIT -->
    <div
      v-if="showModal"
      class="ed-modal-overlay"
      @click.self="tutupModal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ed-modal-title"
    >
      <div class="ed-modal">
        <div class="ed-modal-header">
          <h2 class="ed-modal-title" id="ed-modal-title">
            {{ isEdit ? 'Edit Konten Edukasi' : 'Tambah Konten Edukasi' }}
          </h2>
          <button class="ed-modal-close" @click="tutupModal" aria-label="Tutup modal">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        
        <div class="ed-modal-body">
          <!-- Judul -->
          <div class="ed-form-group">
            <label class="ed-form-label" for="ed-judul">Judul Konten <span>*</span></label>
            <input
              id="ed-judul"
              v-model="form.judul"
              type="text"
              :class="['ed-form-input', { error: formErrors.judul }]"
              placeholder="Masukkan judul konten edukasi..."
            />
            <p v-if="formErrors.judul" class="ed-form-error"><i class="bi bi-exclamation-circle"></i> {{ formErrors.judul }}</p>
          </div>

          <!-- Pilih Kategori -->
          <div class="ed-form-group">
            <label class="ed-form-label">Pilih Kategori <span>*</span></label>
            <div class="ed-kategori-picker">
              <div :class="['ed-kategori-option', form.kategori === 'modul' ? 'selected' : '']" @click="pilihKategori('modul')">
                <i class="bi bi-file-earmark-pdf-fill ed-kategori-icon ed-kategori-icon-modul"></i>
                <p class="ed-kategori-nama">Modul PDF</p>
                <p class="ed-kategori-desc">Upload file PDF</p>
              </div>
              <div :class="['ed-kategori-option', form.kategori === 'video' ? 'selected-video' : '']" @click="pilihKategori('video')">
                <i class="bi bi-play-circle-fill ed-kategori-icon ed-kategori-icon-video"></i>
                <p class="ed-kategori-nama">Video Lokal</p>
                <p class="ed-kategori-desc">Upload file MP4 dari perangkat</p>
              </div>
            </div>
            <p v-if="formErrors.kategori" class="ed-form-error" style="margin-top:8px;"><i class="bi bi-exclamation-circle"></i> {{ formErrors.kategori }}</p>
          </div>

          <!-- KHUSUS MODUL: Upload PDF -->
          <template v-if="form.kategori === 'modul'">
            <div class="ed-form-group">
              <label class="ed-form-label">File PDF <span>*</span></label>
              <div v-if="formFilePdf || existingPdf" class="ed-file-selected">
                <i class="bi bi-file-earmark-pdf-fill ed-pdf-icon"></i>
                <span class="ed-file-selected-name">{{ formFilePdf ? formFilePdf.name : 'File PDF sudah tersimpan' }}</span>
                <button type="button" class="ed-file-remove" @click="hapusPdf"><i class="bi bi-x"></i></button>
              </div>
              <div v-else class="ed-upload-area">
                <input type="file" accept="application/pdf" @change="onPdfChange" />
                <i class="bi bi-file-earmark-arrow-up ed-upload-icon"></i>
                <p class="ed-upload-text"><strong>Klik untuk upload</strong> file PDF</p>
              </div>
              <p v-if="formErrors.file_pdf" class="ed-form-error"><i class="bi bi-exclamation-circle"></i> {{ formErrors.file_pdf }}</p>
            </div>
          </template>

          <!-- KHUSUS VIDEO: Upload MP4 Lokal -->
          <template v-if="form.kategori === 'video'">
            <div class="ed-form-group">
              <label class="ed-form-label">File Video Lokal <span>*</span></label>
              <div v-if="formFileVideo || existingVideo" class="ed-file-selected" style="background: #FFF3E0; border-color: #FFCC80;">
                <i class="bi bi-film ed-pdf-icon" style="color: #F57C00;"></i>
                <span class="ed-file-selected-name" style="color: #E65100;">{{ formFileVideo ? formFileVideo.name : 'Video sudah tersimpan di server' }}</span>
                <button type="button" class="ed-file-remove" @click="hapusVideo"><i class="bi bi-x"></i></button>
              </div>
              <div v-else class="ed-upload-area">
                <input type="file" accept="video/mp4,video/webm,video/ogg" @change="onVideoChange" />
                <i class="bi bi-camera-video ed-upload-icon"></i>
                <p class="ed-upload-text"><strong>Klik untuk upload</strong> file Video</p>
                <p class="ed-upload-hint">MP4, WebM, OGG — (Disarankan maks. 100MB)</p>
              </div>
              <p v-if="formErrors.link_video" class="ed-form-error"><i class="bi bi-exclamation-circle"></i> {{ formErrors.link_video }}</p>
            </div>
          </template>

          <!-- SHARED: Gambar Cover (Untuk Modul & Video) -->
          <div class="ed-form-group" v-if="form.kategori">
            <label class="ed-form-label">Gambar Thumbnail/Cover</label>
            <div v-if="previewGambar" class="ed-preview-wrap">
              <img :src="previewGambar" alt="Preview" class="ed-preview-img" />
              <button type="button" class="ed-preview-remove" @click="hapusPreviewGambar"><i class="bi bi-x"></i></button>
            </div>
            <div v-else class="ed-upload-area">
              <input type="file" accept="image/jpeg,image/png,image/webp" @change="onGambarChange" />
              <i class="bi bi-image ed-upload-icon"></i>
              <p class="ed-upload-text"><strong>Klik untuk upload</strong> gambar sampul</p>
              <p class="ed-upload-hint">Sangat disarankan untuk video lokal</p>
            </div>
          </div>

          <!-- Deskripsi -->
          <div class="ed-form-group">
            <label class="ed-form-label" for="ed-deskripsi">Deskripsi Singkat</label>
            <textarea id="ed-deskripsi" v-model="form.deskripsi" class="ed-form-textarea" placeholder="Tulis ringkasan..."></textarea>
          </div>

        </div>

        <div class="ed-modal-footer">
          <button class="ed-btn-cancel" @click="tutupModal" :disabled="submitting">Batal</button>
          <button class="ed-btn-save" @click="submitForm" :disabled="submitting">
            <i v-if="submitting" class="bi bi-arrow-repeat ed-spin"></i>
            <i v-else class="bi bi-check-lg"></i>
            {{ submitting ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Tambah Konten') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Konfirmasi Hapus -->
    <div
      v-if="showModalHapus"
      class="ed-modal-overlay"
      @click.self="tutupModalHapus"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ed-hapus-title"
    >
      <div class="ed-modal ed-modal-sm">
        <div class="ed-modal-header">
          <h2 class="ed-modal-title" id="ed-hapus-title">Konfirmasi Hapus</h2>
          <button class="ed-modal-close" @click="tutupModalHapus" aria-label="Tutup modal">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="ed-modal-body">
          <div class="ed-confirm-icon" aria-hidden="true">
            <i class="bi bi-trash3"></i>
          </div>
          <p class="ed-confirm-title">Hapus Konten Ini?</p>
          <p class="ed-confirm-desc">
            Kamu akan menghapus konten
            <strong>"{{ hapusJudul }}"</strong>.
            Tindakan ini tidak bisa dibatalkan.
          </p>
        </div>
        <div class="ed-modal-footer">
          <button class="ed-btn-cancel" @click="tutupModalHapus" :disabled="deletingId !== null">Batal</button>
          <button class="ed-btn-hapus-confirm" @click="konfirmasiHapus" :disabled="deletingId !== null">
            <i v-if="deletingId !== null" class="bi bi-arrow-repeat ed-spin"></i>
            <i v-else class="bi bi-trash3"></i>
            {{ deletingId !== null ? 'Menghapus...' : 'Ya, Hapus' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div class="ed-toast-wrap" aria-live="polite">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['ed-toast', 'ed-toast-' + toast.type]"
        role="alert"
      >
        <i :class="['ed-toast-icon bi', toastIcon(toast.type)]"></i>
        <span>{{ toast.message }}</span>
      </div>
    </div>

  </div>
</template>

<script>
import edukasiScript from '@/scripts/dashboard/edukasi.js'
import '@/assets/css/dashboard/kelolaEdukasi.css'

export default {
  name: 'DashboardEdukasi',
  ...edukasiScript,
}
</script>

<style scoped>
.ed-spin {
  animation: spin 0.8s linear infinite;
  display: inline-block;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>