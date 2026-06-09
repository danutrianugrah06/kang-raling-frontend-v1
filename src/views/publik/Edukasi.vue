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
              <span class="modul-badge modul">Modul</span>
              <div class="modul-pdf-tag">
                <i class="bi bi-file-earmark-pdf-fill"></i>
              </div>
            </div>
            <div class="modul-card-body">
              <h3 class="modul-card-title">{{ modul.judul }}</h3>
              <p class="modul-card-desc">{{ modul.deskripsi || 'Panduan lengkap tersedia dalam format PDF.' }}</p>
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
        <div v-if="!loadingModul && moduls.length > 0 && hasMoreModul">
          <button class="btn-load-more" :disabled="loadingMoreModul" @click="loadMoreModul">
            <i class="bi" :class="loadingMoreModul ? 'bi-arrow-repeat spinning' : 'bi-plus-circle'"></i>
            {{ loadingMoreModul ? 'Memuat...' : 'Muat Lebih Banyak' }}
          </button>
        </div>

        <hr class="section-divider" />

        <!-- ===== VIDEO EDUKASI ===== -->
        <div class="section-header">
          <h2 class="section-title">Video Edukasi</h2>
        </div>

        <!-- Skeleton video -->
        <div v-if="loadingVideo">
          <div class="sk-video-featured"></div>
          <div class="video-grid">
            <div v-for="n in 3" :key="'sk-vid-' + n" class="skeleton-video-card">
              <div class="sk-video-thumb"></div>
              <div class="sk-body">
                <div class="sk-line sk-line-short"></div>
                <div class="sk-line sk-line-full"></div>
                <div class="sk-line sk-line-medium"></div>
              </div>
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

        <!-- Konten video (jika ada) -->
        <div v-else>
          <!-- VIDEO FEATURED (video pertama) -->
          <div class="video-featured" @click="bukaVideo(videos[0])">
            <img v-if="getVideoImage(videos[0])" :src="getVideoImage(videos[0])" :alt="videos[0].judul"
              loading="lazy" />
            <div v-else class="video-featured-placeholder">
              <i class="bi bi-play-circle"></i>
            </div>
            <div class="video-featured-overlay"></div>
            <div class="video-play-btn">
              <i class="bi bi-play-fill"></i>
            </div>
            <div class="video-featured-info">
              <span class="video-featured-badge">
                <!-- Class icon-mr-4 menggantikan style="margin-right:4px;" -->
                <i class="bi bi-youtube icon-mr-4"></i> Video
              </span>
              <h2 class="video-featured-title">{{ videos[0].judul }}</h2>
              <div class="video-featured-meta">
                <span>
                  <i class="bi bi-calendar3"></i>
                  {{ formatTanggal(videos[0].created_at) }}
                </span>
                <span v-if="videos[0].user">
                  <i class="bi bi-person-circle"></i>
                  {{ videos[0].user.nama || videos[0].user.name }}
                </span>
              </div>
            </div>
          </div>

          <!-- GRID VIDEO SISANYA (mulai index 1) -->
          <div v-if="videos.length > 1" class="video-grid">
            <div v-for="video in videos.slice(1)" :key="video.id" class="video-card" @click="bukaVideo(video)">
              <div class="video-card-thumb">
                <img v-if="getVideoImage(video)" :src="getVideoImage(video)" :alt="video.judul" loading="lazy" />
                <div v-else class="video-card-thumb-placeholder">
                  <i class="bi bi-play-circle"></i>
                </div>
                <div class="video-card-thumb-overlay">
                  <div class="video-card-play">
                    <i class="bi bi-play-fill"></i>
                  </div>
                </div>
              </div>
              <div class="video-card-body">
                <span class="video-card-badge">Video</span>
                <h3 class="video-card-title">{{ video.judul }}</h3>
                <div class="video-card-meta">
                  <i class="bi bi-calendar3"></i>
                  {{ formatTanggal(video.created_at) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Load more video -->
          <div v-if="hasMoreVideo">
            <button class="btn-load-more" :disabled="loadingMoreVideo" @click="loadMoreVideo">
              <i class="bi" :class="loadingMoreVideo ? 'bi-arrow-repeat spinning' : 'bi-plus-circle'"></i>
              {{ loadingMoreVideo ? 'Memuat...' : 'Muat Lebih Banyak Video' }}
            </button>
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