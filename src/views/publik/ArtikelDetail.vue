<template>
  <div class="detail-wrapper">
    <Navbar />

    <!-- TOP BAR: tombol kembali dan bagikan -->
    <div class="detail-topbar">
      <div class="detail-topbar-inner">
        <router-link to="/media" class="detail-back-link">
          <i class="bi bi-arrow-left"></i> Kembali ke Artikel
        </router-link>
        <button class="detail-share-btn" @click="shareArtikel">
          <i class="bi bi-share"></i> Bagikan
        </button>
      </div>
    </div>

    <!-- SKELETON LOADER: tampil saat data sedang diambil -->
    <div v-if="loading" class="detail-article detail-article-loading">
      <div class="skeleton-title"></div>
      <!-- Class skeleton-line-meta menggabungkan width:55%; height:13px; border-radius:6px; margin-bottom:28px -->
      <div class="skeleton-line skeleton-line-meta"></div>
      <div class="skeleton-detail-cover"></div>
      <!-- Dynamic width untuk skeleton paragraph tetap menggunakan :style karena tergantung nilai n -->
      <div v-for="n in 5" :key="n">
        <div class="skeleton-paragraph" :style="{ width: n % 3 === 0 ? '80%' : '100%' }"></div>
      </div>
    </div>

    <!-- ERROR STATE: ditampilkan jika artikel tidak ditemukan (404) atau gagal dimuat -->
    <!-- Semua inline style diganti dengan class -->
    <div v-else-if="error" class="detail-article detail-error-container">
      <i class="bi bi-exclamation-triangle-fill detail-error-icon"></i>
      <h2 class="detail-error-title">Artikel Tidak Ditemukan</h2>
      <p class="detail-error-desc">Artikel yang kamu cari mungkin sudah dihapus atau tidak tersedia.</p>
      <router-link to="/media" class="detail-error-btn">
        <i class="bi bi-arrow-left"></i> Kembali ke Media
      </router-link>
    </div>

    <!-- KONTEN ARTIKEL: judul, meta, gambar utama, isi, dan rekomendasi -->
    <div v-else-if="artikel">
      <article class="detail-article">
        <!-- Judul artikel -->
        <h1 class="detail-article-title">{{ artikel.judul }}</h1>

        <!-- Info penulis dan tanggal -->
        <div class="detail-article-meta">
          <span>
            <i class="bi bi-calendar3"></i>
            {{ formatTanggal(artikel.created_at) }}
          </span>
          <span v-if="artikel.user">
            <i class="bi bi-person-circle"></i>
            {{ artikel.user.nama || artikel.user.name }}
          </span>
        </div>

        <!-- Gambar cover artikel, fallback ke placeholder jika tidak ada -->
        <img
          v-if="artikel.gambar"
          :src="getImageUrl(artikel.gambar)"
          :alt="artikel.judul"
          class="detail-article-cover"
          loading="lazy"
        />
        <div v-else class="detail-article-cover-placeholder">
          <i class="bi bi-newspaper"></i>
        </div>

        <!-- Isi artikel dari backend (HTML) -->
        <div class="detail-article-body" v-html="artikel.isi_artikel"></div>
      </article>

      <!-- BACA JUGA: rekomendasi artikel lain, maksimal 3 -->
      <div class="detail-article baca-juga" v-if="artikelLainnya.length > 0">
        <h2 class="baca-juga-title">Baca Juga</h2>
        <div class="baca-juga-grid">
          <router-link
            v-for="item in artikelLainnya"
            :key="item.id"
            :to="'/artikel/' + item.slug"
            class="baca-juga-card"
          >
            <div class="baca-juga-card-img">
              <img
                v-if="item.gambar"
                :src="getImageUrl(item.gambar)"
                :alt="item.judul"
                loading="lazy"
              />
              <i v-else class="bi bi-newspaper"></i>
            </div>
            <div class="baca-juga-card-body">
              <p class="baca-juga-card-title">{{ item.judul }}</p>
              <span class="baca-juga-card-date">
                <!-- Class baca-juga-calendar-icon menggantikan style="font-size:11px;" -->
                <i class="bi bi-calendar3 baca-juga-calendar-icon"></i>
                {{ formatTanggal(item.created_at) }}
              </span>
            </div>
          </router-link>
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
import artikelDetailScript from '@/scripts/publik/artikelDetail.js'
// Mengimpor CSS yang sama seperti halaman Media (sudah diperluas dengan class untuk ArtikelDetail)
import '@/assets/css/publik/media.css'

export default {
  name: 'ArtikelDetail',
  components: { Navbar, Footer },
  ...artikelDetailScript
}
</script>