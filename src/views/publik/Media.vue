<template>
  <div class="media-page">
    <Navbar />

    <!-- HERO SECTION: judul, deskripsi, dan tab switcher -->
    <section class="media-hero">
      <div class="container">
        <span class="media-hero-label">Media & Informasi</span>
        <h1 class="media-hero-title">
          Pusat <span>Media</span> & Informasi
        </h1>
        <p class="media-hero-desc">
          Informasi dan koleksi foto kegiatan seputar pengelolaan sampah di Kampung Ramah Lingkungan
        </p>

        <!-- TOMBOL TAB: menggunakan class binding untuk menandai tab aktif -->
        <div class="media-tabs">
          <button class="media-tab-btn" :class="{ active: activeTab === 'artikel' }" @click="switchTab('artikel')">
            <i class="bi bi-newspaper"></i> Artikel
          </button>
          <button class="media-tab-btn" :class="{ active: activeTab === 'galeri' }" @click="switchTab('galeri')">
            <i class="bi bi-images"></i> Galeri
          </button>
        </div>
      </div>
    </section>

    <!-- KONTEN UTAMA: artikel atau galeri sesuai tab aktif -->
    <section class="media-content">
      <div class="container">

        <!-- ===== TAB ARTIKEL ===== -->
        <div v-if="activeTab === 'artikel'">

          <!-- Skeleton loader: 6 kartu palsu saat data sedang diambil -->
          <div v-if="loadingArtikel" class="artikel-grid">
            <div v-for="n in 6" :key="'sk-artikel-' + n" class="skeleton-card">
              <div class="skeleton-img"></div>
              <div class="skeleton-body">
                <!-- Setiap skeleton-line diberi class khusus untuk margin yang konsisten -->
                <div class="skeleton-line skeleton-line-short skeleton-mb-14"></div>
                <div class="skeleton-line skeleton-line-full"></div>
                <div class="skeleton-line skeleton-line-medium"></div>
                <div class="skeleton-line skeleton-line-full skeleton-mt-8"></div>
                <div class="skeleton-line skeleton-line-short skeleton-mt-18"></div>
              </div>
            </div>
          </div>

          <!-- Empty state: muncul jika artikel tidak ada -->
          <div v-else-if="!loadingArtikel && artikels.length === 0" class="empty-state">
            <i class="bi bi-newspaper empty-state-icon"></i>
            <h3 class="empty-state-title">Belum Ada Artikel</h3>
            <p class="empty-state-desc">
              Artikel dan berita akan segera hadir. Pantau terus halaman ini untuk mendapatkan
              informasi terbaru seputar pengelolaan lingkungan hidup Kabupaten Garut.
            </p>
          </div>

          <!-- Grid artikel: tampilan normal -->
          <div v-else class="artikel-grid">
            <div v-for="artikel in artikels" :key="artikel.id" class="artikel-card" @click="goToArtikel(artikel.slug)">
              <!-- Gambar artikel dengan fallback jika tidak ada -->
              <div class="artikel-card-img-wrap">
                <img v-if="artikel.gambar" :src="getImageUrl(artikel.gambar)" :alt="artikel.judul" loading="lazy"
                  @error="onImgError" />
                <div v-else class="artikel-card-img-placeholder">
                  <i class="bi bi-newspaper"></i>
                </div>
              </div>

              <!-- Isi kartu: tanggal, judul, kutipan, link baca -->
              <div class="artikel-card-body">
                <div class="artikel-card-meta">
                  <i class="bi bi-calendar3"></i>
                  {{ formatTanggal(artikel.created_at) }}
                </div>
                <h3 class="artikel-card-title">{{ artikel.judul }}</h3>
                <p class="artikel-card-excerpt">{{ getExcerpt(artikel.isi_artikel) }}</p>
                <span class="artikel-read-link">
                  Baca Selengkapnya <i class="bi bi-arrow-right"></i>
                </span>
              </div>
            </div>
          </div>

          <!-- Tombol "Muat Lebih Banyak" jika masih ada halaman berikutnya -->
          <!-- Pagination Artikel -->
          <div v-if="!loadingArtikel && artikelTotalPages > 1" class="custom-pagination">
            <div class="pagination-info">
              Menampilkan halaman {{ artikelPage }} dari {{ artikelTotalPages }}
            </div>
            <div class="pagination-actions">
              <button class="page-btn" :disabled="artikelPage === 1" @click="changePageArtikel(artikelPage - 1)">
                <i class="bi bi-chevron-left"></i>
              </button>
              <button v-for="page in artikelTotalPages" :key="page" class="page-btn num-btn"
                :class="{ active: page === artikelPage }" @click="changePageArtikel(page)">
                {{ page }}
              </button>
              <button class="page-btn" :disabled="artikelPage === artikelTotalPages"
                @click="changePageArtikel(artikelPage + 1)">
                <i class="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- ===== TAB GALERI ===== -->
        <div v-if="activeTab === 'galeri'">

          <!-- Skeleton loader galeri -->
          <div v-if="loadingGaleri" class="galeri-grid">
            <div v-for="n in 6" :key="'sk-galeri-' + n" class="skeleton skeleton-galeri-img"></div>
          </div>

          <!-- Empty state galeri -->
          <div v-else-if="!loadingGaleri && galeris.length === 0" class="empty-state">
            <i class="bi bi-images empty-state-icon"></i>
            <h3 class="empty-state-title">Belum Ada Foto Galeri</h3>
            <p class="empty-state-desc">
              Dokumentasi kegiatan dan foto-foto menarik akan segera ditambahkan.
              Kunjungi kembali halaman ini secara berkala.
            </p>
          </div>

          <!-- Grid galeri -->
          <!-- Grid galeri -->
          <div v-else class="galeri-grid">
            <div
              v-for="galeri in galeris"
              :key="galeri.id"
              class="galeri-card"
              @click="goToGaleri(galeri.slug)"
            >
              <!-- Bagian Gambar Galeri -->
              <div class="galeri-card-img-wrap">
                <img
                  v-if="galeri.gambar"
                  :src="getImageUrl(galeri.gambar)"
                  :alt="galeri.keterangan || 'Foto Galeri'"
                  loading="lazy"
                  @error="onImgError"
                />
                <div v-else class="galeri-card-img-placeholder">
                  <i class="bi bi-image"></i>
                </div>
                <!-- Badge kategori jika ada -->
                <span v-if="galeri.kategori" class="galeri-badge">{{ galeri.kategori }}</span>
              </div>

              <!-- Bagian Frame Putih (Tanggal & Caption) -->
              <div class="galeri-card-body">
                <div class="galeri-card-meta">
                  <i class="bi bi-calendar3"></i>
                  {{ formatTanggal(galeri.created_at) }}
                </div>
                <h3 class="galeri-card-title">{{ galeri.keterangan || 'Dokumentasi Kegiatan' }}</h3>
              </div>
            </div>
          </div>

          <!-- Tombol "Muat Lebih Banyak" untuk galeri -->
          <!-- Pagination Galeri -->
          <div v-if="!loadingGaleri && galeriTotalPages > 1" class="custom-pagination mt-4">
            <div class="pagination-info">
              Menampilkan halaman {{ galeriPage }} dari {{ galeriTotalPages }}
            </div>
            <div class="pagination-actions">
              <button class="page-btn" :disabled="galeriPage === 1" @click="changePageGaleri(galeriPage - 1)">
                <i class="bi bi-chevron-left"></i>
              </button>
              <button v-for="page in galeriTotalPages" :key="'gal-' + page" class="page-btn num-btn"
                :class="{ active: page === galeriPage }" @click="changePageGaleri(page)">
                {{ page }}
              </button>
              <button class="page-btn" :disabled="galeriPage === galeriTotalPages"
                @click="changePageGaleri(galeriPage + 1)">
                <i class="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- TOAST NOTIFIKASI: muncul di kanan bawah -->
    <div class="toast-container">
      <div v-for="t in toasts" :key="t.id" class="toast" :class="t.type">
        <i :class="t.type === 'success' ? 'bi bi-check-circle-fill' : 'bi bi-exclamation-circle-fill'"></i>
        {{ t.message }}
      </div>
    </div>

    <Footer />
  </div>
</template>

<script>
// Impor komponen dan script
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import mediaScript from '@/scripts/publik/media.js'
// Impor CSS yang sudah berisi semua gaya termasuk hasil ekstraksi inline style
import '@/assets/css/publik/media.css'

export default {
  name: 'MediaPage',
  components: { Navbar, Footer },
  ...mediaScript
}
</script>