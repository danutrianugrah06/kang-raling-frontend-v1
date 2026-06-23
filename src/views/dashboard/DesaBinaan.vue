<template>
  <div class="db-page-content">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

    <!-- Header -->
    <div class="db-page-header">
      <div>
        <h1 class="db-page-title">Kelola Desa Binaan</h1>
        <p class="db-page-subtitle">Manajemen data desa binaan dan profil TPS 3R Kabupaten Garut</p>
      </div>
      <button class="db-btn-add" @click="bukaModalTambahDesa">
        <i class="bi bi-plus-lg"></i> Tambah Desa
      </button>
    </div>

    <!-- Table Card -->
    <div class="db-table-card">

      <!-- Search Bar -->
      <div class="db-search-bar">
        <div class="db-search-wrap">
          <i class="bi bi-search"></i>
          <input v-model="searchQuery" @input="onSearch" type="text" class="db-search-input" placeholder="Cari nama desa atau alamat..." aria-label="Cari desa" />
        </div>
      </div>

      <div class="db-table-wrap">
        <table class="db-table" role="table" aria-label="Daftar desa binaan">
          <thead>
            <tr>
              <th class="db-th-no">No</th>
              <th class="db-th-nama">Nama Desa</th>
              <th class="db-th-alamat">Alamat</th>
              <th class="db-th-aksi">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <!-- Skeleton loading -->
            <template v-if="loading">
              <tr v-for="n in 5" :key="'sk-' + n">
                <td><div class="db-skel db-skel-width-24"></div></td>
                <td>
                  <div class="db-skel db-skel-text-lg"></div>
                  <div class="db-skel db-skel-text-sm"></div>
                </td>
                <td><div class="db-skel db-skel-width-160"></div></td>
                <td>
                  <div class="db-aksi">
                    <div class="db-skel db-skel-btn"></div>
                    <div class="db-skel db-skel-btn"></div>
                  </div>
                </td>
              </tr>
            </template>

            <!-- Empty state -->
            <template v-else-if="filteredDesas.length === 0">
              <tr>
                <td colspan="4">
                  <div class="db-empty">
                    <div class="db-empty-icon"><i class="bi bi-geo-alt"></i></div>
                    <p class="db-empty-title">Belum ada desa binaan</p>
                    <p class="db-empty-desc">
                      {{ searchQuery ? 'Tidak ada desa yang cocok dengan pencarian ini.' : 'Mulai tambahkan desa binaan untuk pertama.' }}
                    </p>
                  </div>
                </td>
              </tr>
            </template>

            <!-- Data desa -->
            <template v-else>
              <template v-for="(desa, idx) in filteredDesas" :key="desa.id">
                <!-- Baris desa utama (accordion header) -->
                <tr class="db-desa-row" :class="{ expanded: expandedDesaId === desa.id }" @click="toggleAccordion(desa.id)">
                  <td class="db-cell-no">{{ idx + 1 }}</td>
                  <td class="db-cell-nama">
                    <!-- Class db-desa-flex-row menggantikan inline style display:flex;align-items:center;gap:10px; -->
                    <div class="db-desa-flex-row">
                      <button class="db-expand-btn" :class="{ active: expandedDesaId === desa.id }"
                        :aria-label="expandedDesaId === desa.id ? 'Tutup detail TPS' : 'Lihat detail TPS'"
                        @click.stop="toggleAccordion(desa.id)">
                        <i class="bi bi-chevron-down db-expand-icon" :class="{ rotated: expandedDesaId === desa.id }"></i>
                      </button>
                      <div>
                        <p class="db-desa-nama">{{ desa.nama_desa }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="db-cell-alamat">
                    <p class="db-desa-alamat">{{ desa.alamat || '-' }}</p>
                  </td>
                  <td class="db-cell-aksi">
                    <div class="db-aksi" @click.stop>
                      <button class="db-btn-icon db-btn-edit" @click="bukaModalEditDesa(desa)" title="Edit Desa" aria-label="Edit desa">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="db-btn-icon db-btn-hapus" @click="bukaModalHapusDesa(desa)" title="Hapus Desa" aria-label="Hapus desa">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>

                <!-- Baris accordion (konten TPS) -->
                <tr v-if="expandedDesaId === desa.id" class="db-accordion-row">
                  <td colspan="4">
                    <div class="db-accordion-content">
                      <div class="db-accordion-header">
                        <p class="db-accordion-title">
                          <i class="bi bi-building"></i> Profil TPS - {{ desa.nama_desa }}
                        </p>
                        <button class="db-btn-add-tps" @click="bukaModalTambahTps(desa)" :disabled="getTps(desa).length >= 1"
                          :title="getTps(desa).length >= 1 ? 'Setiap desa hanya boleh memiliki 1 TPS' : 'Tambah profil TPS'">
                          <i class="bi bi-plus-lg"></i> Tambah Profil TPS
                        </button>
                      </div>

                      <!-- Tidak ada TPS -->
                      <div v-if="getTps(desa).length === 0" class="db-no-tps">
                        <div class="db-no-tps-icon"><i class="bi bi-building-slash"></i></div>
                        <p class="db-no-tps-text">Desa ini belum memiliki profil TPS. Klik tombol di atas untuk menambahkan.</p>
                      </div>

                      <!-- Ada TPS (maksimal 1) -->
                      <div v-else>
                        <div v-for="tps in getTps(desa)" :key="tps.id" class="db-tps-card">
                          <div class="db-tps-card-header">
                            <p class="db-tps-card-title">
                              <i class="bi bi-building" style="color:#4CAF50;margin-right:6px;"></i>
                              {{ tps.nama_tps }}
                            </p>
                            <div class="db-tps-card-aksi">
                              <button class="db-btn-icon db-btn-edit" @click="bukaModalEditTps(tps, desa)" title="Edit TPS">
                                <i class="bi bi-pencil"></i>
                              </button>
                              <button class="db-btn-icon db-btn-hapus" @click="bukaModalHapusTps(tps)" title="Hapus TPS">
                                <i class="bi bi-trash"></i>
                              </button>
                            </div>
                          </div>
                          <div class="db-tps-card-body">
                            <div class="db-tps-grid">
                              <div>
                                <p class="db-tps-field-label">Nama Pengelola</p>
                                <p class="db-tps-field-value">{{ tps.nama_pengelola || '-' }}</p>
                              </div>
                              <div>
                                <p class="db-tps-field-label">Nama Fasilitator</p>
                                <p class="db-tps-field-value">{{ tps.nama_fasilitator || '-' }}</p>
                              </div>
                              <div>
                                <p class="db-tps-field-label">Jumlah Warga Terlayani</p>
                                <p class="db-tps-field-value">{{ tps.jumlah_warga_terlayani ? tps.jumlah_warga_terlayani.toLocaleString('id-ID') + ' KK' : '-' }}</p>
                              </div>
                              <div>
                                <p class="db-tps-field-label">Nomor Telepon</p>
                                <p class="db-tps-field-value">{{ tps.telepon || '-' }}</p>
                              </div>
                              <!-- Class db-grid-full menggantikan inline style grid-column: 1 / -1; -->
                              <div class="db-grid-full">
                                <p class="db-tps-field-label">Kegiatan TPS</p>
                                <p class="db-tps-field-value">{{ tps.kegiatan_tps || '-' }}</p>
                              </div>
                            </div>
                            <!-- Class db-mt-16 menggantikan inline style margin-top:16px; -->
                            <div v-if="tps.gambar" class="db-mt-16">
                              <p class="db-tps-field-label">Gambar Cover TPS</p>
                              <img :src="getGambarUrl(tps.gambar)" :alt="'Foto TPS ' + tps.nama_tps" class="db-tps-foto" loading="lazy" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Footer (info jumlah) -->
      <div v-if="!loading && filteredDesas.length > 0" class="db-table-footer">
        <p class="db-pagination-info">Menampilkan {{ filteredDesas.length }} dari {{ desas.length }} desa</p>
      </div>
    </div>

    <!-- MODAL TAMBAH / EDIT DESA -->
    <div v-if="showModalDesa" class="db-modal-overlay" @click.self="tutupModalDesa" role="dialog" aria-modal="true">
      <!-- Class db-modal-desa menggantikan inline style max-width:480px; -->
      <div class="db-modal db-modal-desa">
        <div class="db-modal-header">
          <h2 class="db-modal-title">{{ isEditDesa ? 'Edit Data Desa' : 'Tambah Desa Baru' }}</h2>
          <button class="db-modal-close" @click="tutupModalDesa" aria-label="Tutup modal"><i class="bi bi-x-lg"></i></button>
        </div>
        <div class="db-modal-body">
          <div class="db-form-group">
            <label class="db-form-label" for="db-nama-desa">Nama Desa <span>*</span></label>
            <input id="db-nama-desa" v-model="formDesa.nama_desa" type="text" :class="['db-form-input', { error: formDesaErrors.nama_desa }]" placeholder="Contoh: Cibunar" autocomplete="off" />
            <p v-if="formDesaErrors.nama_desa" class="db-form-error"><i class="bi bi-exclamation-circle"></i> {{ formDesaErrors.nama_desa }}</p>
          </div>
          <div class="db-form-group">
            <label class="db-form-label" for="db-alamat-desa">Alamat Desa</label>
            <input id="db-alamat-desa" v-model="formDesa.alamat" type="text" class="db-form-input" placeholder="Contoh: Kab. Garut, Jawa Barat" autocomplete="off" />
          </div>
        </div>
        <div class="db-modal-footer">
          <button class="db-btn-cancel" @click="tutupModalDesa" :disabled="submitting">Batal</button>
          <button class="db-btn-save" @click="submitDesa" :disabled="submitting">
            <i v-if="submitting" class="bi bi-arrow-repeat db-spin"></i>
            <i v-else class="bi bi-check-lg"></i>
            {{ submitting ? 'Menyimpan...' : (isEditDesa ? 'Simpan Perubahan' : 'Tambah Desa') }}
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL TAMBAH / EDIT TPS -->
    <div v-if="showModalTps" class="db-modal-overlay" @click.self="tutupModalTps" role="dialog" aria-modal="true">
      <div class="db-modal">
        <div class="db-modal-header">
          <h2 class="db-modal-title">{{ isEditTps ? 'Edit Profil TPS' : 'Tambah Profil TPS' }}</h2>
          <button class="db-modal-close" @click="tutupModalTps" aria-label="Tutup modal"><i class="bi bi-x-lg"></i></button>
        </div>
        <div class="db-modal-body">
          <p class="db-section-divider"><i class="bi bi-geo-alt-fill"></i> Milik Desa: {{ tpsDesaNama }}</p>
          <div class="db-form-row">
            <div class="db-form-group">
              <label class="db-form-label" for="db-nama-tps">Nama TPS <span>*</span></label>
              <input id="db-nama-tps" v-model="formTps.nama_tps" type="text" :class="['db-form-input', { error: formTpsErrors.nama_tps }]" placeholder="Contoh: TPS 3R Binangkit" autocomplete="off" />
              <p v-if="formTpsErrors.nama_tps" class="db-form-error"><i class="bi bi-exclamation-circle"></i> {{ formTpsErrors.nama_tps }}</p>
            </div>
            <div class="db-form-group">
              <label class="db-form-label" for="db-jumlah-warga">Warga Terlayani (KK) <span>*</span></label>
              <input id="db-jumlah-warga" v-model="formTps.jumlah_warga_terlayani" type="number" min="0" :class="['db-form-input', { error: formTpsErrors.jumlah_warga_terlayani }]" placeholder="Contoh: 120" />
              <p v-if="formTpsErrors.jumlah_warga_terlayani" class="db-form-error"><i class="bi bi-exclamation-circle"></i> {{ formTpsErrors.jumlah_warga_terlayani }}</p>
            </div>
          </div>
          <div class="db-form-row">
            <div class="db-form-group">
              <label class="db-form-label" for="db-nama-pengelola">Nama Pengelola <span>*</span></label>
              <input id="db-nama-pengelola" v-model="formTps.nama_pengelola" type="text" :class="['db-form-input', { error: formTpsErrors.nama_pengelola }]" placeholder="Nama penanggung jawab TPS" autocomplete="off" />
              <p v-if="formTpsErrors.nama_pengelola" class="db-form-error"><i class="bi bi-exclamation-circle"></i> {{ formTpsErrors.nama_pengelola }}</p>
            </div>
            <div class="db-form-group">
              <label class="db-form-label" for="db-nama-fasilitator">Nama Fasilitator</label>
              <input id="db-nama-fasilitator" v-model="formTps.nama_fasilitator" type="text" class="db-form-input" placeholder="Nama fasilitator desa" autocomplete="off" />
            </div>
          </div>
          <div class="db-form-group">
            <label class="db-form-label" for="db-kegiatan">Kegiatan TPS</label>
            <textarea id="db-kegiatan" v-model="formTps.kegiatan_tps" class="db-form-textarea" placeholder="Sebutkan kegiatan di TPS (misal: Kompos Organik, Bank Sampah, dll)"></textarea>
          </div>
          <div class="db-form-group">
            <label class="db-form-label" for="db-telepon">Nomor Telepon TPS</label>
            <input id="db-telepon" v-model="formTps.telepon" type="tel" class="db-form-input" placeholder="Contoh: 0812-3456-7890" autocomplete="off" />
          </div>
          <div class="db-form-group">
            <label class="db-form-label">Gambar Cover TPS</label>
            <div v-if="previewTpsGambar" class="db-preview-wrap">
              <img :src="previewTpsGambar" alt="Preview foto TPS" class="db-preview-img" />
              <button type="button" class="db-preview-remove" @click="hapusPreviewGambarTps" aria-label="Hapus foto"><i class="bi bi-x"></i></button>
            </div>
            <div v-else class="db-upload-area">
              <input type="file" accept="image/jpeg,image/png,image/webp" @change="onGambarTpsChange" aria-label="Upload foto TPS" />
              <i class="bi bi-cloud-upload db-upload-icon"></i>
              <p class="db-upload-text"><strong>Klik untuk upload</strong> atau seret ke sini</p>
              <p class="db-upload-hint">JPG, PNG, WebP - Maks. 10MB</p>
            </div>
          </div>
        </div>
        <div class="db-modal-footer">
          <button class="db-btn-cancel" @click="tutupModalTps" :disabled="submitting">Batal</button>
          <button class="db-btn-save" @click="submitTps" :disabled="submitting">
            <i v-if="submitting" class="bi bi-arrow-repeat db-spin"></i>
            <i v-else class="bi bi-check-lg"></i>
            {{ submitting ? 'Menyimpan...' : (isEditTps ? 'Simpan Perubahan' : 'Tambah TPS') }}
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL KONFIRMASI HAPUS -->
    <div v-if="showModalHapus" class="db-modal-overlay" @click.self="tutupModalHapus" role="dialog" aria-modal="true">
      <div class="db-modal db-modal-sm">
        <div class="db-modal-header">
          <h2 class="db-modal-title">Konfirmasi Hapus</h2>
          <button class="db-modal-close" @click="tutupModalHapus" aria-label="Tutup modal"><i class="bi bi-x-lg"></i></button>
        </div>
        <div class="db-modal-body">
          <div class="db-confirm-icon" aria-hidden="true"><i class="bi bi-trash3"></i></div>
          <p class="db-confirm-title">Hapus {{ hapusMode === 'desa' ? 'Desa' : 'Profil TPS' }} Ini?</p>
          <p class="db-confirm-desc">
            Kamu akan menghapus <strong>"{{ hapusNama }}"</strong>.
            <template v-if="hapusMode === 'desa'"><br />Semua data profil TPS pada desa ini juga akan ikut terhapus.</template>
            Tindakan ini tidak bisa dibatalkan.
          </p>
        </div>
        <div class="db-modal-footer">
          <button class="db-btn-cancel" @click="tutupModalHapus" :disabled="deletingId !== null">Batal</button>
          <button class="db-btn-hapus-confirm" @click="konfirmasiHapus" :disabled="deletingId !== null">
            <i v-if="deletingId !== null" class="bi bi-arrow-repeat db-spin"></i>
            <i v-else class="bi bi-trash3"></i>
            {{ deletingId !== null ? 'Menghapus...' : 'Ya, Hapus' }}
          </button>
        </div>
      </div>
    </div>

    <!-- TOAST NOTIFIKASI -->
    <div class="db-toast-wrap" aria-live="polite">
      <div v-for="toast in toasts" :key="toast.id" :class="['db-toast', 'db-toast-' + toast.type]" role="alert">
        <i :class="['db-toast-icon bi', toastIcon(toast.type)]"></i>
        <span>{{ toast.message }}</span>
      </div>
    </div>

  </div>
</template>

<script>
import desaBinaanScript from '@/scripts/dashboard/desaBinaan.js'
import '@/assets/css/dashboard/kelolaDesaBinaan.css'

export default {
  name: 'DashboardDesaBinaan',
  ...desaBinaanScript,
}
</script>

<style scoped>
/* Animasi spin untuk ikon loading */
.db-spin {
  animation: spin 0.8s linear infinite;
  display: inline-block;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>