<template>
  <div class="beranda">
    <Navbar />

    <!-- SECTION HERO -->
    <section class="hero" aria-label="Hero Beranda">
      <img src="../../assets/images/landingPage.png" alt="Latar Beranda Kang Raling" class="hero-bg" loading="lazy" />
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <div class="hero-badge">
          Program Dinas Lingkungan Hidup Kabupaten Garut
        </div>
        <h1 class="hero-title">Kampung Ramah<br />Lingkungan</h1>
        <p class="hero-subtitle">
          Gerakan bersama membangun desa yang bersih, hijau, dan berkelanjutan
          melalui pengelolaan sampah berbasis masyarakat.
        </p>
        <div class="hero-actions">
          <router-link to="/data-sampah" class="btn-primary">
            Lihat Data Sampah
          </router-link>
          <router-link to="/desa-binaan" class="btn-outline">
            Desa Binaan
          </router-link>
        </div>
      </div>
    </section>

    <!-- SECTION KATA PENGANTAR -->
    <section class="pengantar" aria-label="Kata Pengantar Kepala Dinas">
      <div class="container">
        <div class="pengantar-inner">
          <div class="pengantar-foto-wrap">
            <img src="../../assets/images/pakJujun.png" alt="Kepala Dinas Lingkungan Hidup Kabupaten Garut"
              class="pengantar-foto" loading="lazy" />
            <div class="pengantar-label">
              <strong>Jujun Juansyah Nurhakim, S.T., M.T.</strong>
              <span>Kepala Dinas Lingkungan Hidup<br />Kabupaten Garut</span>
            </div>
          </div>
          <div class="pengantar-teks">
            <span class="badge-section">Kata Pengantar</span>
            <h2 class="judul-section">Pesan dari Kepala Dinas</h2>
            <p class="pengantar-isi">
              <strong>Assalamu’alaikum Warahmatullahi Wabarakatuh</strong>
              <br /><br />
              Puji dan syukur senantiasa kita panjatkan ke hadirat Allah SWT.
              Saat ini, permasalahan pengelolaan sampah telah menjadi tantangan
              besar yang menuntut tindakan nyata dan kolaborasi dari seluruh
              pihak. <br />
              Kehadiran Website Kang Raling hadir sebagai langkah konkret untuk
              berbagi pengalaman dan inspirasi dalam mewujudkan lingkungan yang
              bersih, sehat, dan berkelanjutan. Platform ini dirancang untuk
              mendorong kesadaran masyarakat akan pentingnya pengelolaan sampah
              mandiri yang melibatkan peran aktif warga, pemerintah, dan sektor
              swasta. <br /><br />
              Melalui inisiatif ini, kami berharap masyarakat semakin memahami
              pentingnya pengurangan dan daur ulang sampah rumah tangga. Semoga
              apa yang disajikan dalam website ini dapat menjadi model yang bisa
              diadopsi oleh daerah lain demi mewujudkan Indonesia yang lebih
              hijau. <br />
              Terima kasih kepada semua pihak yang telah berkontribusi dalam
              pengembangan inisiatif ini. Semoga website ini membawa manfaat
              yang luas bagi kelestarian lingkungan kita bersama. <br /><br />
              <strong>Wassalamu’alaikum Warahmatullahi Wabarakatuh.</strong>
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION TENTANG KANG RALING -->
    <section class="tentang" aria-label="Pengenalan Kang Raling">
      <div class="container">
        <div class="tentang-header">
          <span class="badge-section center">Tentang Program</span><br />
          <h2 class="judul-section center">Apa itu Kang Raling?</h2>
          <p class="sub-section">
            Program
            <strong>Kampung Ramah Lingkungan (Kang Raling)</strong> Merupakan
            Program Peningkatan Peran Serta Masyarakat dalam Pengelolaan Sampah
            dan Perbaikan Lingkungan dengan Membangun Model Pengelolaan Sampah
            yang Berkelanjutan di Tingkat Kawasan Setingkat RW
          </p>
        </div>

        <div class="tentang-grid">
          <div class="tentang-card">
            <div class="tentang-icon tentang-icon-hijau-muda">
              <i class="bi bi-recycle"></i>
            </div>
            <h3>Pengelolaan Sampah</h3>
            <p>
              Sistem pengelolaan sampah terpadu berbasis desa dengan pemilahan
              dari sumber, pengomposan, dan daur ulang.
            </p>
          </div>

          <div class="tentang-card">
            <div class="tentang-icon tentang-icon-hijau-muda">
              <i class="bi bi-people"></i>
            </div>
            <h3>Edukasi Masyarakat</h3>
            <p>
              Program edukasi dan pelatihan bagi warga desa tentang pentingnya
              menjaga kebersihan dan pengelolaan sampah.
            </p>
          </div>

          <div class="tentang-card">
            <div class="tentang-icon tentang-icon-hijau-tua">
              <i class="bi bi-building"></i>
            </div>
            <h3>TPS 3R</h3>
            <p>
              Pembangunan dan operasional Tempat Pengelolaan Sampah Reduce,
              Reuse, Recycle di setiap desa binaan.
            </p>
          </div>

          <div class="tentang-card">
            <div class="tentang-icon tentang-icon-hijau-muda">
              <i class="bi bi-bar-chart-line"></i>
            </div>
            <h3>Monitoring Data</h3>
            <p>
              Pencatatan dan pemantauan data timbulan sampah secara digital
              untuk mendukung kebijakan berbasis data.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION LANDASAN HUKUM -->
    <section class="hukum" aria-label="Landasan Hukum dan Kebijakan">
      <div class="container">
        <span class="badge-section center">Dasar Hukum</span><br />
        <h2 class="judul-section center">Landasan Hukum & Kebijakan</h2>
        <p class="sub-section">
          Program Kang Raling berlandaskan regulasi dan kebijakan resmi pemerintah
        </p>
        <div class="hukum-list">
          <div class="hukum-item">
            <div class="hukum-nomor">01</div>
            <div class="hukum-detail">
              <span class="hukum-kode">UU No. 18 Tahun 2008</span>
              <p>Tentang Pengelolaan Sampah.</p>
            </div>
            <span class="hukum-tag">Undang-Undang</span>
          </div>
          <div class="hukum-item">
            <div class="hukum-nomor">02</div>
            <div class="hukum-detail">
              <span class="hukum-kode">PP No. 81 Tahun 2012</span>
              <p>
                Tentang Pengelolaan Sampah Rumah Tangga dan Sampah Sejenis
                Sampah Rumah Tangga.
              </p>
            </div>
            <span class="hukum-tag">PP</span>
          </div>
          <div class="hukum-item">
            <div class="hukum-nomor">03</div>
            <div class="hukum-detail">
              <span class="hukum-kode">Permen LHK No. 14 Tahun 2021</span>
              <p>Tentang Pengelolaan Sampah pada Bank Sampah.</p>
            </div>
            <span class="hukum-tag">Permen</span>
          </div>
          <div class="hukum-item">
            <div class="hukum-nomor">04</div>
            <div class="hukum-detail">
              <span class="hukum-kode">Perda Kab. Garut No. 4 Tahun 2014</span>
              <p>
                Tentang Pengelolaan Sampah Rumah Tangga dan Sampah Sejenis
                Sampah Rumah Tangga.
              </p>
            </div>
            <span class="hukum-tag">Perda</span>
          </div>
          <div class="hukum-item">
            <div class="hukum-nomor">05</div>
            <div class="hukum-detail">
              <span class="hukum-kode">
                SE Bupati Garut No. LH.02.01/4118/DLH Tanggal 25 Oktober 2022
              </span>
              <p>
                Tentang Penyelenggaraan Kebersihan dan Pengalokasian Anggaran
                Desa Untuk Perlindungan dan Pengelolaan Lingkungan Hidup di
                Wilayah.
              </p>
            </div>
            <span class="hukum-tag">SE Bupati</span>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION SDGs DESA -->
    <section class="sdgs" aria-label="Perwujudan SDGs Desa">
      <div class="container">
        <span class="badge-section center light">SDGs Desa</span><br />
        <h2 class="judul-section center light">
          Perwujudan SDGs Desa Peduli Lingkungan
        </h2>
        <p class="sub-section light">
          Kang Raling berkontribusi langsung pada pencapaian Tujuan Pembangunan
          Berkelanjutan
        </p>

        <div class="sdgs-grid">
          <div class="sdgs-card">
            <div class="sdgs-nomor">SDG 7</div>
            <i class="bi bi-sun sdgs-icon"></i>
            <h3>Energi Bersih & Terbarukan</h3>
            <p>
              Pemanfaatan sampah organik menjadi energi biogas untuk kebutuhan
              rumah tangga warga desa binaan.
            </p>
          </div>
          <div class="sdgs-card">
            <div class="sdgs-nomor">SDG 13</div>
            <i class="bi bi-cloud-sun sdgs-icon"></i>
            <h3>Penanganan Perubahan Iklim</h3>
            <p>
              Pengurangan emisi gas rumah kaca melalui pengomposan sampah
              organik dan pengurangan pembakaran sampah.
            </p>
          </div>
          <div class="sdgs-card">
            <div class="sdgs-nomor">SDG 14</div>
            <i class="bi bi-water sdgs-icon"></i>
            <h3>Ekosistem Lautan</h3>
            <p>
              Mencegah sampah plastik masuk ke sungai dan laut melalui program
              pemilahan dan pengelolaan sampah terpadu.
            </p>
          </div>
          <div class="sdgs-card">
            <div class="sdgs-nomor">SDG 15</div>
            <i class="bi bi-tree sdgs-icon"></i>
            <h3>Ekosistem Daratan</h3>
            <p>
              Menjaga dan memulihkan ekosistem darat melalui penghijauan dan
              pengelolaan sampah yang bertanggung jawab.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION HASIL CAPAIAN -->
    <section class="hasil" aria-label="Hasil Program Kang Raling">
      <div class="container">
        <span class="badge-section center">Capaian Program</span><br />
        <h2 class="judul-section center">Hasil Capaian Kang Raling</h2><br />

        <div class="hasil-grid">
          <div class="hasil-card">
            <i class="bi bi-houses hasil-icon"></i>
            <div class="hasil-angka">10+</div>
            <div class="hasil-label">Desa Binaan</div>
            <div class="hasil-sub">Desa aktif program Kang Raling</div>
          </div>
          <div class="hasil-card">
            <i class="bi bi-recycle hasil-icon"></i>
            <div class="hasil-angka">900+</div>
            <div class="hasil-label">Ton Sampah Terkelola</div>
            <div class="hasil-sub">Sampah berhasil dikelola per bulan</div>
          </div>
          <div class="hasil-card">
            <i class="bi bi-people hasil-icon"></i>
            <div class="hasil-angka">500+</div>
            <div class="hasil-label">Warga Teredukasi</div>
            <div class="hasil-sub">Warga mendapat edukasi lingkungan</div>
          </div>
          <div class="hasil-card">
            <i class="bi bi-heart hasil-icon"></i>
            <div class="hasil-angka">30+</div>
            <div class="hasil-label">Warga Diberdayakan</div>
            <div class="hasil-sub">Aktif dalam pengelolaan sampah</div>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION VIDEO DESA MODEL -->
    <section class="desa-model" aria-label="Desa Model Kang Raling">
      <div class="container">
        <span class="badge-section center">Video Dokumentasi</span><br />
        <h2 class="judul-section center">Desa Model Kang Raling</h2>
        <p class="sub-section">
          Saksikan bagaimana desa-desa binaan Kang Raling mengubah cara pandang
          masyarakat dalam mengelola sampah secara mandiri dan berkelanjutan.
        </p>

        <div class="video-wrap">
          <iframe src="https://www.youtube.com/embed/owfQVgHJCPE" title="Desa Model Kang Raling" frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen loading="lazy"></iframe>
        </div>
      </div>
    </section>

    <!-- SECTION PARTNER (BAGIAN DARI) -->
    <section class="partof" aria-label="Bagian dari">
      <div class="container">
        <span class="badge-section center">Program Dinas</span><br />
        <h2 class="judul-section center">Kang Raling Bagian Dari</h2><br />

        <div class="partof-logos">
          <a href="https://dlhkabgarut.id/" target="_blank" rel="noopener noreferrer" class="partof-item">
            <img src="../../assets/icons/logoDLH.png" alt="DLH Kabupaten Garut" class="partof-img" loading="lazy" />
            <span>DLH Kabupaten Garut</span>
          </a>

          <div class="partof-divider"></div>

          <a href="https://www.garutkab.go.id/" target="_blank" rel="noopener noreferrer" class="partof-item">
            <img src="../../assets/icons/logoGarut.png" alt="Pemerintah Kabupaten Garut" class="partof-img"
              loading="lazy" />
            <span>Pemerintah Kabupaten Garut</span>
          </a>
        </div>
      </div>
    </section>

    <Footer />
  </div>
</template>

<script>
import Navbar from '../../components/Navbar.vue'
import Footer from '../../components/Footer.vue'

export default {
  name: 'BerandaView',
  components: { Navbar, Footer },
}
</script>

<style>
@import '../../assets/css/publik/beranda.css';
</style>