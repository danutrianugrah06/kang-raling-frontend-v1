<template>
  <div class="edukasi-page">
    <Navbar />

    <!-- HERO SECTION -->
    <section class="edukasi-hero">
      <div class="container">
        <span class="edukasi-hero-label">Pusat Pembelajaran</span>
        <h1 class="edukasi-hero-title">
          Edukasi <span>Pengelolaan Sampah</span>
        </h1>
        <p class="edukasi-hero-desc">
          Akses koleksi e-book dan video edukatif untuk meningkatkan
          pengetahuan tentang pengelolaan sampah berkelanjutan ala Kang Raling.
        </p>
      </div>
    </section>

    <!-- KONTEN UTAMA -->
    <section class="edukasi-content">
      <div class="container">

        <!-- ===== MODUL EDUKASI ===== -->
        <div class="section-header">
          <h2 class="section-title">Modul Edukasi</h2>
        </div>

        <!-- Skeleton modul -->
        <div v-if="loadingModul" class="modul-grid">
          <div v-for="n in 3" :key="'sk-modul-' + n" class="skeleton-modul-card">
            <div class="sk-img"></div>
            <div class="sk-body">
              <div class="sk-line sk-line-short"></div>
              <div class="sk-line sk-line-full"></div>
              <div class="sk-line sk-line-medium"></div>
              <!-- Class sk-line-mt-6 menggantikan inline style margin-top:6px -->
              <div class="sk-line sk-line-short sk-line-mt-6"></div>
            </div>
          </div>
        </div>

        <!-- Empty state modul -->
        <div v-else-if="moduls.length === 0" class="empty-state">
          <i class="bi bi-journal-text empty-icon"></i>
          <h3 class="empty-title">Belum Ada Modul Edukasi</h3>
          <p class="empty-desc">
            Modul panduan pengelolaan sampah akan segera ditambahkan.
            Pantau terus halaman ini untuk update terbaru.
          </p>
        </div>

        <!-- Grid modul -->
        <div v-else class="modul-grid">
          <div v-for="modul in moduls" :key="modul.id" class="modul-card" @click="bukaModul(modul)">
            <div class="modul-card-img-wrap">
              <img v-if="modul.gambar" :src="getImageUrl(modul.gambar)" :alt="modul.judul" loading="lazy" />
              <div v-else class="modul-card-img-placeholder">
                <i class="bi bi-journal-richtext"></i>
              </div>
              
              <div class="modul-pdf-tag">
                <i class="bi bi-file-earmark-pdf-fill"></i>
              </div>
            </div>
            <div class="modul-card-body">
              <h3 class="modul-card-title">{{ modul.judul }}</h3>
              <p class="modul-card-desc">{{ modul.deskripsi }}</p>
              <div class="modul-card-footer">
                <span class="modul-card-meta">
                  <i class="bi bi-calendar3"></i>
                  {{ formatTanggal(modul.created_at) }}
                </span>
                <span class="modul-open-btn">
                  Buka PDF <i class="bi bi-arrow-right"></i>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Load more modul -->
        <div v-if="!loadingModul && moduls.length > 0" class="custom-pagination">
          <div class="pagination-info">Menampilkan halaman {{ modulPage }} dari {{ modulTotalPages }}</div>
          <div class="pagination-actions">
            <button class="page-btn" :disabled="modulPage === 1" @click="changePageModul(modulPage - 1)">
              <i class="bi bi-chevron-left"></i>
            </button>
            <button v-for="page in modulTotalPages" :key="'m'+page" class="page-btn num-btn" :class="{ active: page === modulPage }" @click="changePageModul(page)">
              {{ page }}
            </button>
            <button class="page-btn" :disabled="modulPage === modulTotalPages" @click="changePageModul(modulPage + 1)">
              <i class="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>

        <hr class="section-divider" />

        <!-- ===== VIDEO EDUKASI ===== -->
        <div class="section-header">
          <h2 class="section-title">Video Edukasi</h2>
        </div>

        <!-- Skeleton Video Baru (Disamakan dengan Modul) -->
        <div v-if="loadingVideo" class="modul-grid">
          <div v-for="n in 3" :key="'sk-vid-' + n" class="skeleton-modul-card">
            <div class="sk-img"></div>
            <div class="sk-body">
              <div class="sk-line sk-line-short"></div>
              <div class="sk-line sk-line-full"></div>
              <div class="sk-line sk-line-medium"></div>
              <div class="sk-line sk-line-short sk-line-mt-6"></div>
            </div>
          </div>
        </div>

        <!-- Empty state video -->
        <div v-else-if="videos.length === 0" class="empty-state">
          <i class="bi bi-play-circle empty-icon"></i>
          <h3 class="empty-title">Belum Ada Video Edukasi</h3>
          <p class="empty-desc">
            Video panduan dan tutorial pengelolaan sampah akan segera hadir.
            Kunjungi kembali halaman ini secara berkala.
          </p>
        </div>

        <!-- Konten Video (Grid disamakan dengan Modul) -->
        <div v-else>
          <div class="modul-grid">
            <div v-for="video in videos" :key="video.id" class="modul-card" @click="bukaVideo(video)">
              <!-- Gambar Video -->
              <div class="modul-card-img-wrap">
                <img v-if="getVideoImage(video)" :src="getVideoImage(video)" :alt="video.judul" loading="lazy" />
                <div v-else class="modul-card-img-placeholder">
                  <i class="bi bi-play-circle"></i>
                </div>
                
                <div class="video-card-thumb-overlay">
                  <div class="video-card-play">
                    <i class="bi bi-play-fill"></i>
                  </div>
                </div>
              </div>
              
              <!-- Teks Video -->
              <div class="modul-card-body">
                <h3 class="modul-card-title">{{ video.judul }}</h3>
                <p class="modul-card-desc">{{ video.deskripsi || 'Video panduan edukasi lingkungan dan tata kelola sampah.' }}</p>
                <div class="modul-card-footer">
                  <span class="modul-card-meta">
                    <i class="bi bi-calendar3"></i>
                    {{ formatTanggal(video.created_at) }}
                  </span>
                  <span class="modul-open-btn video-open-btn">
                    Tonton <i class="bi bi-play-circle-fill"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination Video -->
          <div v-if="!loadingVideo && videos.length > 0" class="custom-pagination mt-4">
            <div class="pagination-info">Menampilkan halaman {{ videoPage }} dari {{ videoTotalPages }}</div>
            <div class="pagination-actions">
              <button class="page-btn" :disabled="videoPage === 1" @click="changePageVideo(videoPage - 1)">
                <i class="bi bi-chevron-left"></i>
              </button>
              <button v-for="page in videoTotalPages" :key="'v'+page" class="page-btn num-btn" :class="{ active: page === videoPage }" @click="changePageVideo(page)">
                {{ page }}
              </button>
              <button class="page-btn" :disabled="videoPage === videoTotalPages" @click="changePageVideo(videoPage + 1)">
                <i class="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- TOAST NOTIFIKASI -->
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
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import edukasiScript from '@/scripts/publik/edukasi.js'
import '@/assets/css/publik/edukasi.css'

export default {
  name: 'EdukasiPage',
  components: { Navbar, Footer },
  ...edukasiScript
}
</script>

<!-- 
  CATATAN: 
  - Semua style (termasuk keyframes spin) sudah dipindahkan ke file edukasi.css.
  - Tidak ada inline style statis tersisa di template.
-->