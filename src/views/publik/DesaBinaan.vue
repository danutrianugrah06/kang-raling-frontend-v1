<template>
  <div class="desa-binaan-page">
    <Navbar />

    <!-- HERO SECTION -->
    <section class="desa-hero">
      <div class="container">
        <span class="desa-hero-label">Program Unggulan</span>
        <h1 class="desa-hero-title">
          Desa <span>Binaan</span>
        </h1>
        <p class="desa-hero-desc">
          Mengenal lebih dekat desa-desa yang telah berkomitmen penuh dalam program pengelolaan
          sampah mandiri dan berkelanjutan bersama Dinas Lingkungan Hidup Kabupaten Garut.
        </p>
      </div>
    </section>

    <!-- KONTEN UTAMA -->
    <section class="desa-content">
      <div class="container">

        <!-- SKELETON LOADER: 9 kartu palsu saat data sedang diambil -->
        <div v-if="loading" class="desa-grid">
          <div v-for="n in 9" :key="'sk-'+n" class="skeleton-desa-card">
            <div class="skeleton-desa-img"></div>
            <div class="skeleton-desa-body">
              <!-- 
                Inline style asli: style="height:15px; margin-bottom:12px;"
                Diekstrak ke class: skeleton-line-title
              -->
              <div class="sk-line sk-line-full skeleton-line-title"></div>
              <div class="sk-line sk-line-medium"></div>
            </div>
          </div>
        </div>

        <!-- EMPTY STATE: muncul jika data desa kosong -->
        <div v-else-if="desas.length === 0" class="empty-state">
          <i class="bi bi-houses empty-icon"></i>
          <h3 class="empty-title">Belum Ada Data Desa Binaan</h3>
          <p class="empty-desc">
            Data desa binaan akan segera ditampilkan. Program pengelolaan sampah mandiri
            terus berkembang di Kabupaten Garut.
          </p>
        </div>

        <!-- GRID DESA: tampilan normal -->
        <div v-else class="desa-grid">
          <div
            v-for="desa in desas"
            :key="desa.id"
            class="desa-card"
            @click="goToDetail(desa.slug)"
          >
            <!-- Foto desa (Ambil dari foto TPS pertama jika ada) -->
            <div class="desa-card-img-wrap">
              <img
                v-if="getCoverGambar(desa)"
                :src="getImageUrl(getCoverGambar(desa))"
                :alt="desa.nama_desa"
                loading="lazy"
              />
              <div v-else class="desa-card-img-placeholder">
                <i class="bi bi-tree"></i>
              </div>
            </div>

            <!-- Info desa -->
            <div class="desa-card-body">
              <p class="desa-card-nama">{{ desa.nama_desa }}</p>
              <p class="desa-card-alamat">
                <i class="bi bi-geo-alt-fill"></i>
                {{ desa.alamat || 'Kabupaten Garut' }}
              </p>
            </div>
          </div>
        </div>

        <!-- TOMBOL MUAT LEBIH BANYAK: jika masih ada halaman berikutnya -->
        <!-- PAGINATION: muncul jika lebih dari 1 halaman -->
        <div v-if="!loading && desas.length > 0 && lastPage > 1" class="custom-pagination">
          <div class="pagination-info">
            Menampilkan halaman {{ currentPage }} dari {{ lastPage }}
          </div>
          <div class="pagination-actions">
            <button
              class="page-btn"
              :disabled="currentPage === 1"
              @click="goToPage(currentPage - 1)"
              aria-label="Halaman sebelumnya"
            >
              <i class="bi bi-chevron-left"></i>
            </button>
            <button
              v-for="page in lastPage"
              :key="page"
              class="page-btn num-btn"
              :class="{ active: page === currentPage }"
              @click="goToPage(page)"
              :aria-label="'Halaman ' + page"
              :aria-current="page === currentPage ? 'page' : undefined"
            >
              {{ page }}
            </button>
            <button
              class="page-btn"
              :disabled="currentPage === lastPage"
              @click="goToPage(currentPage + 1)"
              aria-label="Halaman berikutnya"
            >
              <i class="bi bi-chevron-right"></i>
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
import desaBinaanScript from '@/scripts/publik/desaBinaan.js'
import '@/assets/css/publik/desa.css'

export default {
  name: 'DesaBinaan',
  components: { Navbar, Footer },
  ...desaBinaanScript
}
</script>