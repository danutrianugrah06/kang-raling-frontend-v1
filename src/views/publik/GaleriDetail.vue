<template>
  <div class="galeri-detail-wrapper">
    <Navbar />

    <!-- TOP BAR: tombol kembali dan bagikan -->
    <div class="detail-topbar">
      <div class="galeri-detail-topbar">
        <router-link to="/media?tab=galeri" class="detail-back-link">
          <i class="bi bi-arrow-left"></i> Kembali ke Galeri
        </router-link>
        <button class="detail-share-btn" @click="shareGaleri">
          <i class="bi bi-share"></i> Bagikan
        </button>
      </div>
    </div>

    <!-- SKELETON LOADER -->
    <div v-if="loading" class="galeri-skeleton-wrap">
      <div class="skeleton galeri-skeleton-img"></div>
      <div class="skeleton-line galeri-skeleton-title"></div>
      <div class="skeleton-line galeri-skeleton-subtitle"></div>
    </div>

    <!-- ERROR STATE -->
    <div v-else-if="error" class="galeri-error-wrap">
      <i class="bi bi-image galeri-error-icon"></i>
      <h2 class="galeri-error-title">Foto Tidak Ditemukan</h2>
      <p class="galeri-error-desc">Foto yang kamu cari mungkin sudah dihapus atau ada kendala koneksi ke server.</p>
      <router-link to="/media?tab=galeri" class="btn-primary-rounded">
        <i class="bi bi-arrow-left"></i> Kembali ke Galeri
      </router-link>
    </div>

    <!-- KONTEN UTAMA -->
    <div v-else-if="galeri">
      <div class="galeri-detail-hero">
        <div class="galeri-detail-main-img-wrap">
          <img
            v-if="galeri.gambar"
            :src="getImageUrl(galeri.gambar)"
            :alt="galeri.keterangan || 'Foto Galeri'"
            loading="lazy"
          />
          <div v-else class="galeri-detail-placeholder">
            <i class="bi bi-image"></i>
          </div>

          <div class="galeri-detail-caption">
            <h1 class="galeri-detail-caption-title">
              {{ galeri.keterangan || 'Dokumentasi Kegiatan' }}
            </h1>
            <div class="galeri-detail-caption-meta">
              <span>
                <i class="bi bi-calendar3"></i>
                {{ formatTanggal(galeri.created_at) }}
              </span>
              <span v-if="galeri.user">
                <i class="bi bi-person-circle"></i>
                {{ galeri.user.nama || galeri.user.name }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- GALERI LAINNYA (REKOMENDASI) -->
      <div class="galeri-lainnya" v-if="galeriLainnya.length > 0">
        <div class="galeri-lainnya-header">
          <h2 class="galeri-lainnya-title">Galeri Lainnya</h2>
        </div>
        
        <div class="galeri-lainnya-grid">
          <div
            v-for="item in galeriLainnya"
            :key="item.id"
            class="galeri-lainnya-card"
            @click="goToGaleri(item.slug)"
          >
            <img
              v-if="item.gambar"
              :src="getImageUrl(item.gambar)"
              :alt="item.keterangan || 'Foto Galeri'"
              loading="lazy"
            />
            <div v-else class="galeri-lainnya-placeholder">
              <i class="bi bi-image galeri-lainnya-placeholder-icon"></i>
            </div>
            
            <div class="galeri-lainnya-card-info">
              <p class="galeri-lainnya-keterangan">{{ item.keterangan || 'Foto Kegiatan' }}</p>
              <span class="galeri-lainnya-date">{{ formatTanggal(item.created_at) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

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
import galeriDetailScript from '@/scripts/publik/galeriDetail.js'
import '@/assets/css/publik/media.css'

export default {
  name: 'GaleriDetail',
  components: { Navbar, Footer },
  ...galeriDetailScript
}
</script>