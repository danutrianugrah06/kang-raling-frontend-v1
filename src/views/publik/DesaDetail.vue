<template>
  <div class="detail-desa-wrapper">
    <Navbar />

    <!-- TOP BAR -->
    <div class="detail-topbar">
      <div class="detail-topbar-inner">
        <router-link to="/desa-binaan" class="detail-back-link">
          <i class="bi bi-arrow-left"></i> Kembali ke Desa Binaan
        </router-link>
      </div>
    </div>

    <!-- ── SKELETON LOADER ── -->
    <div v-if="loading">
      <div class="skeleton-hero"></div>
      <!-- Class skeleton-container menggantikan inline style max-width/margin/padding -->
      <div class="skeleton-container">
        <div class="detail-info-grid">
          <div v-for="n in 4" :key="'sk-card-' + n" class="skeleton-info-card">
            <div class="sk-title-line"></div>
            <div class="sk-content-line sk-line-full"></div>
            <div class="sk-content-line sk-line-medium"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── ERROR STATE ── -->
    <div v-else-if="error" class="error-state">
      <i class="bi bi-exclamation-triangle-fill"></i>
      <h2>Desa Tidak Ditemukan</h2>
      <p>Data desa yang kamu cari tidak tersedia atau telah dihapus.</p>
      <router-link to="/desa-binaan" class="btn-back-primary">
        <i class="bi bi-arrow-left"></i> Kembali ke Desa Binaan
      </router-link>
    </div>

    <!-- ── KONTEN DETAIL ── -->
    <div v-else-if="desa">

      <!-- HERO / COVER -->
      <div class="detail-desa-hero">
        <img
          v-if="profilTps && profilTps.gambar"
          :src="getImageUrl(profilTps.gambar)"
          :alt="desa.nama_desa"
          class="detail-desa-hero-img"
          loading="lazy"
        />
        <div v-else class="detail-desa-hero-placeholder">
          <i class="bi bi-tree"></i>
        </div>

        <div class="detail-desa-hero-overlay"></div>

        <div class="detail-desa-hero-content">
          <span class="detail-desa-hero-label">
            {{ profilTps ? profilTps.nama_tps : 'TPS 3R' }}
          </span>
          <h1 class="detail-desa-hero-title">{{ desa.nama_desa }}</h1>
          <p class="detail-desa-hero-sub">
            <i class="bi bi-geo-alt-fill"></i>
            {{ desa.alamat || 'Kabupaten Garut' }}
          </p>
        </div>
      </div>

      <!-- BODY INFO -->
      <div class="detail-desa-body">
        <div class="detail-info-grid">

          <!-- 1. Profil TPS 3R -->
          <div class="info-card">
            <div class="info-card-header">
              <div class="info-card-icon">
                <i class="bi bi-person-badge"></i>
              </div>
              <div>
                <p class="info-card-title">Profil TPS 3R</p>
                <p class="info-card-subtitle">Pengelola & Fasilitator</p>
              </div>
            </div>

            <div v-if="profilTps" class="profil-row">
              <div class="profil-item">
                <span class="profil-item-label">Nama TPS</span>
                <span class="profil-item-value">{{ profilTps.nama_tps || '-' }}</span>
              </div>
              <div class="profil-divider"></div>
              <div class="profil-item">
                <span class="profil-item-label">Pengelola TPS</span>
                <span class="profil-item-value">{{ profilTps.nama_pengelola || '-' }}</span>
              </div>
              <div class="profil-divider"></div>
              <div class="profil-item">
                <span class="profil-item-label">Fasilitator Desa</span>
                <span class="profil-item-value">{{ profilTps.nama_fasilitator || '-' }}</span>
              </div>
            </div>

            <!-- Class empty-profil-text menggantikan inline style -->
            <div v-else class="empty-profil-text">
              Profil TPS untuk desa ini belum ditambahkan.
            </div>
          </div>

          <!-- 2. Cakupan Pelayanan -->
          <div class="info-card">
            <div class="info-card-header">
              <div class="info-card-icon orange">
                <i class="bi bi-people-fill"></i>
              </div>
              <div>
                <p class="info-card-title">Cakupan Pelayanan</p>
                <p class="info-card-subtitle">Warga Terlayani</p>
              </div>
            </div>

            <div v-if="profilTps && profilTps.jumlah_warga_terlayani">
              <p class="statistik-besar">
                {{ formatAngka(profilTps.jumlah_warga_terlayani) }}
              </p>
              <p class="statistik-satuan">Kepala Keluarga (KK)</p>
              <p class="statistik-note">
                Telah terlayani oleh program pengelolaan sampah mandiri desa.
              </p>
            </div>

            <div v-else>
              <!-- Class statistik-besar-muted dan statistik-bar-fill-zero -->
              <p class="statistik-besar statistik-besar-muted">—</p>
              <p class="statistik-satuan">Data belum tersedia</p>
              <div class="statistik-bar-wrap">
                <div class="statistik-bar-fill statistik-bar-fill-zero"></div>
              </div>
              <p class="statistik-note statistik-note-muted">
                Data warga terlayani belum ditambahkan.
              </p>
            </div>
          </div>

          <!-- 3. Kegiatan TPS 3R -->
          <div class="info-card">
            <div class="info-card-header">
              <div class="info-card-icon blue">
                <i class="bi bi-recycle"></i>
              </div>
              <div>
                <p class="info-card-title">Kegiatan TPS 3R</p>
                <p class="info-card-subtitle">Program operasional</p>
              </div>
            </div>

            <div v-if="profilTps && profilTps.kegiatan_tps">
              <!-- Class kegiatan-text menggantikan inline style -->
              <p class="kegiatan-text-description">
                {{ profilTps.kegiatan_tps }}
              </p>
            </div>

            <div v-else>
              <p class="empty-kegiatan-text">
                Belum ada deskripsi kegiatan yang ditambahkan.
              </p>
            </div>
          </div>

          <!-- 4. Alamat & Kontak -->
          <div class="info-card">
            <div class="info-card-header">
              <div class="info-card-icon purple">
                <i class="bi bi-telephone-fill"></i>
              </div>
              <div>
                <p class="info-card-title">Alamat & Kontak</p>
                <p class="info-card-subtitle">Informasi lebih lanjut</p>
              </div>
            </div>

            <div class="profil-row">
              <div class="profil-item">
                <span class="profil-item-label">Alamat Desa</span>
                <span class="profil-item-value">
                  {{ desa.alamat || 'Belum tersedia' }}
                </span>
              </div>

              <div class="profil-divider"></div>

              <div class="profil-item">
                <span class="profil-item-label">Nomor Telepon TPS</span>
                <span class="profil-item-value">
                  <a
                    v-if="profilTps && profilTps.telepon"
                    :href="'tel:' + profilTps.telepon"
                    class="telepon-link"
                  >
                    <i class="bi bi-telephone-fill telepon-icon"></i>
                    {{ profilTps.telepon }}
                  </a>
                  <span v-else class="telepon-not-available">Belum tersedia</span>
                </span>
              </div>
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
import desaDetailScript from '@/scripts/publik/desaDetail.js'
import '@/assets/css/publik/desa.css'

export default {
  name: 'DesaDetail',
  components: { Navbar, Footer },
  ...desaDetailScript
}
</script>