<template>
  <section class="not-found-wrapper">
    <div class="circle circle-green"></div>
    <div class="circle circle-orange"></div>

    <div class="not-found-content">
      <h1 class="error-code">404</h1>
      <h2 class="error-title">Halaman Tidak Ditemukan</h2>
      <p class="error-desc">
        Mohon maaf, halaman yang Anda tuju tidak tersedia, telah dipindahkan, atau alamat URL yang Anda masukkan tidak valid. Silakan kembali ke halaman utama sistem informasi Kang Raling (Kampung Ramah Lingkungan).
      </p>
      
      <router-link to="/" class="btn-back-home">
        <i class="bi bi-house-door-fill me-2"></i> Kembali ke Beranda
      </router-link>
    </div>
  </section>
</template>

<script setup>
// Tidak butuh logika JS yang rumit untuk halaman 404 ini
</script>

<style scoped>
/* ── BUNGKUSAN UTAMA ── */
.not-found-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa;
  position: relative;
  overflow: hidden;
  text-align: center;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  padding: 20px;
}

/* ── KONTEN TENGAH ── */
.not-found-content {
  position: relative;
  z-index: 10;
  max-width: 650px; /* Diperlebar sedikit agar teks formal lebih rapi */
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  padding: 50px 45px;
  border-radius: 16px; /* Sudut sedikit lebih kaku agar berkesan formal */
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 1);
}

/* ── TEKS 404 ANIMASI ── */
.error-code {
  font-size: 120px;
  font-weight: 800;
  margin: 0;
  line-height: 1;
  background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
  -webkit-text-fill-color: transparent;
  animation: floatUpDown 3s ease-in-out infinite;
}

/* ── JUDUL & DESKRIPSI ── */
.error-title {
  font-size: 26px;
  font-weight: 700;
  color: #212529;
  margin: 24px 0 16px;
  letter-spacing: -0.5px;
}

.error-desc {
  font-size: 16px;
  color: #495057;
  line-height: 1.7;
  margin-bottom: 32px;
}

/* ── TOMBOL KEMBALI ── */
.btn-back-home {
  display: inline-block;
  background-color: #F57C00;
  color: white;
  font-weight: 600;
  font-size: 15px;
  padding: 12px 28px;
  border-radius: 6px; /* Disesuaikan agar lebih pantas untuk web instansi */
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(245, 124, 0, 0.2);
}

.btn-back-home:hover {
  background-color: #E65100;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(245, 124, 0, 0.3);
  color: white;
}

/* ── HIASAN LINGKARAN BACKGROUND ── */
.circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  z-index: 1;
  animation: floatAround 10s infinite alternate ease-in-out;
}

.circle-green {
  width: 400px;
  height: 400px;
  background-color: rgba(76, 175, 80, 0.15);
  top: -100px;
  left: -100px;
}

.circle-orange {
  width: 300px;
  height: 300px;
  background-color: rgba(245, 124, 0, 0.12);
  bottom: -50px;
  right: -50px;
  animation-delay: -5s;
}

/* ── KEYFRAMES ANIMASI ── */
@keyframes floatUpDown {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

@keyframes floatAround {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(30px, 50px) scale(1.1); }
}

/* Responsif untuk layar HP */
@media (max-width: 768px) {
  .error-code { font-size: 80px; }
  .error-title { font-size: 22px; }
  .not-found-content { padding: 40px 24px; }
}
</style>