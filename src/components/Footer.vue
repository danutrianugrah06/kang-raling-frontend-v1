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
          <li>
            <a href="https://www.garutkab.go.id/" target="_blank" rel="noopener noreferrer">Regulasi</a>
          </li>
          <li>
            <a href="https://www.garutkab.go.id/" target="_blank" rel="noopener noreferrer">Pemerintah Kabupaten Garut</a>
          </li>
          <li>
            <router-link to="/tentang-kami">Kontak Kami</router-link>
          </li>
          <li>
            <router-link to="/faq">FAQ</router-link>
          </li>
        </ul>
      </div>

      <!-- KOLOM 4: MEDIA SOSIAL -->
      <div class="footer-col">
        <h4>Ikuti Kami</h4>
        <ul>
          <li>
            <a href="https://www.facebook.com/search/top?q=Kang+Raling" target="_blank" rel="noopener noreferrer">Facebook</a>
          </li>
          <li>
            <a href="https://www.youtube.com/results?search_query=Kang+Raling" target="_blank" rel="noopener noreferrer">Youtube</a>
          </li>
          <li>
            <a href="https://www.instagram.com/explore/search/keyword/?q=Kang+Raling" target="_blank" rel="noopener noreferrer">Instagram</a>
          </li>
          <li>
            <a href="https://www.tiktok.com/search?q=Kang+Raling" target="_blank" rel="noopener noreferrer">Tiktok</a>
          </li>
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