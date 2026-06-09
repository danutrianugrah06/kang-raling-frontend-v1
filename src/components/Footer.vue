<template>
  <footer class="footer">
    <!-- KONTAINER UTAMA -->
    <div class="footer-container">
      
      <!-- KOLOM 1: IDENTITAS BRAND -->
      <div class="footer-brand">
        <img src="../assets/icons/logoKangRaling.png" alt="Kang Raling" class="footer-logo" />
        <p class="footer-desc">
          <strong>Kantor Dinas Lingkungan Hidup<br>Kabupaten Garut</strong>
        </p>
        <p class="footer-address">
          <strong>Jl. Tarusan Pahlawan, Sukagalih,<br>
          Kec. Tarogong Kidul, Kabupaten<br>
          Garut, Jawa Barat 44151</strong>
        </p>
      </div>

      <!-- KOLOM 2: MENU NAVIGASI -->
      <div class="footer-col">
        <h4>Menu</h4>
        <ul>
          <li><router-link to="/">Beranda</router-link></li>
          <li><router-link to="/media">Media</router-link></li>
          <li><router-link to="/desa-binaan">Desa Binaan</router-link></li>
          <li><router-link to="/edukasi">Edukasi</router-link></li>
          <li><router-link to="/data-sampah">Data Sampah</router-link></li>
          <li><router-link to="/tentang-kami">Tentang Kami</router-link></li>
        </ul>
      </div>

      <!-- KOLOM 3: INFO LAINNYA -->
      <div class="footer-col">
        <h4>Info Lainnya</h4>
        <ul>
          <li><a href="#">Regulasi</a></li>
          <li><a href="#">Pemerintah Kabupaten Garut</a></li>
          <li><a href="#">Kontak Kami</a></li>
          <li><a href="#">FAQ</a></li>
        </ul>
      </div>

      <!-- KOLOM 4: MEDIA SOSIAL -->
      <div class="footer-col">
        <h4>Ikuti Kami</h4>
        <ul>
          <li><a href="#">Facebook</a></li>
          <li><a href="#">Youtube</a></li>
          <li><a href="#">Instagram</a></li>
          <li><a href="#">Tiktok</a></li>
        </ul>
      </div>
      
    </div>

    <!-- COPYRIGHT SECTION -->
    <div class="footer-bottom">
      <p>© {{ currentYear }} Kampung Ramah Lingkungan (Kang Raling)</p>
    </div>
  </footer>
</template>

<script setup>
import '../assets/css/footer.css'

/* STATE TAHUN COPYRIGHT */
const currentYear = new Date().getFullYear()
</script>