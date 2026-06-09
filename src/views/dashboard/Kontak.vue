<!--
  HALAMAN HUBUNGI DEVELOPER => dashboard/Kontak.vue
  - Tujuan: Menampilkan informasi kontak tim pengembang platform Kang Raling.
  - Fitur:
    • Dua kartu kontak (Taufik dan Danu Tri Anugrah)
    • Masing-masing memiliki tautan WhatsApp dan Email
    • Responsive grid
-->

<template>
  <div class="kt-page-content">
    <link
      href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />

    <!-- Page Header -->
    <div class="kt-page-header">
      <div>
        <h1 class="kt-page-title">Hubungi Developer</h1>
        <p class="kt-page-subtitle">Butuh bantuan teknis? Hubungi tim pengembang di bawah ini.</p>
      </div>
    </div>

    <!-- Cards Grid -->
    <div class="kt-cards">
      
      <!-- Developer 1 -->
      <div class="kt-card">
        <h2 class="kt-name">Taufik</h2>
        <p class="kt-desc">
          Penanggung jawab teknis dari sisi Dinas Lingkungan Hidup Kabupaten Garut.
          Hubungi untuk kebutuhan operasional sistem dan koordinasi instansi.
        </p>
        <div class="kt-contact-list">
          <a href="https://wa.me/6285221747400" target="_blank" rel="noopener noreferrer" class="kt-contact-item">
            <div class="kt-contact-icon wa"><i class="bi bi-whatsapp"></i></div>
            <div class="kt-contact-detail">
              <span class="kt-contact-val">+62 852-2174-7400</span>
              <span class="kt-contact-lbl">WhatsApp</span>
            </div>
          </a>
          <a href="mailto:tipayun@gmail.com" class="kt-contact-item">
            <div class="kt-contact-icon email"><i class="bi bi-envelope"></i></div>
            <div class="kt-contact-detail">
              <span class="kt-contact-val">tipayun@gmail.com</span>
              <span class="kt-contact-lbl">Email</span>
            </div>
          </a>
        </div>
      </div>

      <!-- Developer 2 -->
      <div class="kt-card">
        <h2 class="kt-name">Danu Tri Anugrah</h2>
        <p class="kt-desc">
          Pengembang utama platform Kang Raling. Hubungi untuk laporan bug,
          permintaan fitur baru, atau kendala teknis pada aplikasi.
        </p>
        <div class="kt-contact-list">
          <a href="https://wa.me/6289693773669" target="_blank" rel="noopener noreferrer" class="kt-contact-item">
            <div class="kt-contact-icon wa"><i class="bi bi-whatsapp"></i></div>
            <div class="kt-contact-detail">
              <span class="kt-contact-val">+62 896-9377-3669</span>
              <span class="kt-contact-lbl">WhatsApp</span>
            </div>
          </a>
          <a href="mailto:danu3anugrah@gmail.com" class="kt-contact-item">
            <div class="kt-contact-icon email"><i class="bi bi-envelope"></i></div>
            <div class="kt-contact-detail">
              <span class="kt-contact-val">danu3anugrah@gmail.com</span>
              <span class="kt-contact-lbl">Email</span>
            </div>
          </a>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: 'DashboardKontak',
}
</script>

<style scoped>
@import '@/assets/css/dashboard/kontak.css';
</style>