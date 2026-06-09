<template>
  <div class="tentang-kami-page">
    <Navbar />

    <!-- HERO SECTION dengan gambar background -->
    <section class="tk-hero">
      <img src="@/assets/images/tentangKamiPage.png" alt="Tentang Kang Raling" class="tk-hero-bg" loading="eager" />
      <div class="tk-hero-overlay"></div>

      <!-- Class tk-hero-container menggantikan inline style position:relative; z-index:2 -->
      <div class="container tk-hero-container">
        <span class="tk-hero-label">✦ Kenali Lebih Dekat</span>
        <h1 class="tk-hero-title">
          Tentang <span>Kang Raling</span>
        </h1>
        <p class="tk-hero-desc">
          Kampung Ramah Lingkungan — inisiatif Dinas Lingkungan Hidup Kabupaten Garut
          untuk mewujudkan pengelolaan sampah mandiri yang terintegrasi, berkelanjutan,
          dan berbasis masyarakat di seluruh pelosok Garut.
        </p>
        <div class="tk-hero-btns">
          <a href="https://wa.me/628122456107" target="_blank" rel="noopener noreferrer" class="tk-btn-primary">
            <i class="bi bi-whatsapp"></i> Chat via WhatsApp
          </a>
          <router-link to="/faq" class="tk-btn-outline">
            <i class="bi bi-question-circle"></i> Pelajari Lebih Lanjut
          </router-link>
        </div>
      </div>
    </section>

    <!-- TENTANG / APA ITU KANG RALING -->
    <section class="tk-tentang">
      <div class="container">
        <div class="tk-section-header">
          <span class="tk-section-label">Tentang Program</span>
          <h2 class="tk-section-title">Apa Itu <span>Kang Raling?</span></h2>
        </div>
        <div class="tk-tentang-body">
          <p class="tk-tentang-text">
            <strong>Kang Raling</strong> (Kampung Ramah Lingkungan) adalah program unggulan
            Dinas Lingkungan Hidup Kabupaten Garut yang dirancang untuk mengintegrasikan
            sistem pengelolaan sampah berbasis komunitas di tingkat desa.
          </p>
          <p class="tk-tentang-text">
            Program ini hadir sebagai solusi nyata atas permasalahan persampahan di
            Kabupaten Garut, dengan mengedepankan prinsip <em>Reduce, Reuse, dan Recycle</em>
            (3R) yang diimplementasikan melalui TPS 3R yang tersebar di berbagai desa binaan.
          </p>
          <p class="tk-tentang-text">
            Melalui platform digital Kang Raling, masyarakat dapat memantau data sampah
            secara transparan, mengakses edukasi lingkungan, dan berpartisipasi aktif dalam
            menjaga kebersihan dan kelestarian lingkungan hidup Kabupaten Garut.
          </p>
          <div class="tk-tentang-highlight">
            <i class="bi bi-lightbulb-fill"></i>
            <p>
              Kang Raling berkomitmen menjadikan Kabupaten Garut sebagai kabupaten percontohan
              pengelolaan sampah mandiri berbasis teknologi digital di Jawa Barat pada tahun 2025.
            </p>
          </div>

          <!-- Statistik singkat (4 kotak) -->
          <div class="tk-tentang-stats">
            <div class="tk-tentang-stat-item">
              <p class="tk-tentang-stat-value">8+</p>
              <p class="tk-tentang-stat-label">Desa Binaan Aktif</p>
            </div>
            <div class="tk-tentang-stat-divider"></div>
            <div class="tk-tentang-stat-item">
              <p class="tk-tentang-stat-value">12</p>
              <p class="tk-tentang-stat-label">Unit TPS 3R</p>
            </div>
            <div class="tk-tentang-stat-divider"></div>
            <div class="tk-tentang-stat-item">
              <p class="tk-tentang-stat-value">1.200+</p>
              <p class="tk-tentang-stat-label">KK Terlayani</p>
            </div>
            <div class="tk-tentang-stat-divider"></div>
            <div class="tk-tentang-stat-item">
              <p class="tk-tentang-stat-value">2.500+</p>
              <p class="tk-tentang-stat-label">Ton Sampah Terkelola</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- TUJUAN PROGRAM -->
    <section class="tk-tujuan">
      <div class="container">
        <div class="tk-section-header">
          <span class="tk-section-label">Tujuan</span>
          <h2 class="tk-section-title">Tujuan Program</h2>
          <p class="tk-section-desc">
            Mewujudkan Kabupaten Garut yang bersih dan bebas masalah sampah
            melalui tiga pilar utama yang terukur dan berkelanjutan.
          </p>
        </div>
        <div class="tk-tujuan-grid">
          <div class="tk-tujuan-card">
            <div class="tk-tujuan-icon green"><i class="bi bi-recycle"></i></div>
            <h3 class="tk-tujuan-name">Pengurangan Residu</h3>
            <p class="tk-tujuan-desc">Meminimalkan volume sampah residu yang tidak dapat didaur ulang hingga di bawah standar nasional 15%.</p>
          </div>
          <div class="tk-tujuan-card">
            <div class="tk-tujuan-icon blue"><i class="bi bi-tree"></i></div>
            <h3 class="tk-tujuan-name">Lingkungan Sehat</h3>
            <p class="tk-tujuan-desc">Menciptakan ekosistem sanitasi lingkungan yang mendukung kualitas hidup masyarakat secara berkelanjutan.</p>
          </div>
          <div class="tk-tujuan-card">
            <div class="tk-tujuan-icon orange"><i class="bi bi-currency-dollar"></i></div>
            <h3 class="tk-tujuan-name">Ekonomi Sirkular</h3>
            <p class="tk-tujuan-desc">Mendorong pengembangan ekonomi berbasis daur ulang sampah yang menguntungkan masyarakat di pedesaan.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- PILAR DAN MISI -->
    <section class="tk-pilar">
      <div class="container">
        <div class="tk-section-header">
          <span class="tk-section-label">Fondasi Program</span>
          <h2 class="tk-section-title">Pilar dan Misi</h2>
          <p class="tk-section-desc">Empat pilar utama yang menjadi fondasi kuat program Kang Raling dalam mewujudkan pengelolaan sampah mandiri.</p>
        </div>
        <div class="tk-pilar-grid">
          <div class="tk-pilar-item">
            <div class="tk-pilar-icon green"><i class="bi bi-people-fill"></i></div>
            <div class="tk-pilar-content">
              <h4 class="tk-pilar-name">Edukasi & Sosialisasi</h4>
              <p class="tk-pilar-desc">Membangun kesadaran masyarakat dan peningkatan kapasitas fasilitator desa dalam mengelola sampah organik dan anorganik secara tepat melalui pelatihan dan modul edukasi berkelanjutan.</p>
            </div>
          </div>
          <div class="tk-pilar-item">
            <div class="tk-pilar-icon blue"><i class="bi bi-building-gear"></i></div>
            <div class="tk-pilar-content">
              <h4 class="tk-pilar-name">Infrastruktur Terpadu</h4>
              <p class="tk-pilar-desc">Pembangunan dan pemeliharaan fasilitas TPS 3R yang memadai dan terintegrasi dengan sistem pengangkutan sampah serta bank sampah terpusat berstandar daerah.</p>
            </div>
          </div>
          <div class="tk-pilar-item">
            <div class="tk-pilar-icon orange"><i class="bi bi-graph-up-arrow"></i></div>
            <div class="tk-pilar-content">
              <h4 class="tk-pilar-name">Pemberdayaan Masyarakat</h4>
              <p class="tk-pilar-desc">Memberdayakan kelompok masyarakat dan kader lingkungan yang aktif dalam program pilah sampah, bank sampah, dan pengelolaan kompos skala rumah tangga hingga desa.</p>
            </div>
          </div>
          <div class="tk-pilar-item">
            <div class="tk-pilar-icon purple"><i class="bi bi-shield-check"></i></div>
            <div class="tk-pilar-content">
              <h4 class="tk-pilar-name">Kebijakan & Sinergi</h4>
              <p class="tk-pilar-desc">Memperkuat program Kang Raling dengan dukungan regulasi daerah dan sinergi lintas OPD, lembaga pendidikan, serta sektor swasta dalam mewujudkan ekosistem pengelolaan sampah terpadu.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- HUBUNGI KAMI (tanpa form, langsung kontak + peta) -->
    <section class="tk-hubungi" id="hubungi">
      <div class="container">
        <div class="tk-section-header">
          <span class="tk-section-label">Kontak</span>
          <h2 class="tk-section-title">Hubungi Kami</h2>
          <p class="tk-section-desc">Ada pertanyaan atau ingin berkolaborasi? Kami siap membantu Anda melalui berbagai saluran komunikasi berikut.</p>
        </div>
        <div class="tk-hubungi-inner">
          <!-- Kolom kiri: info kontak -->
          <div class="tk-kontak-wrap">
            <div class="tk-kontak-list">
              <div class="tk-kontak-item">
                <div class="tk-kontak-icon"><i class="bi bi-geo-alt-fill"></i></div>
                <div>
                  <p class="tk-kontak-label">Alamat Kantor</p>
                  <p class="tk-kontak-value">Dinas Lingkungan Hidup Kabupaten Garut<br>Jl. Terusan Pahlawan No. 20, Tarogong Kidul,<br>Kabupaten Garut, Jawa Barat 44151</p>
                </div>
              </div>
              <div class="tk-kontak-item">
                <div class="tk-kontak-icon"><i class="bi bi-telephone-fill"></i></div>
                <div>
                  <p class="tk-kontak-label">Telepon</p>
                  <p class="tk-kontak-value"><a href="https://wa.me/628122456107">0812-2456-107</a></p>
                </div>
              </div>
              <div class="tk-kontak-item">
                <div class="tk-kontak-icon"><i class="bi bi-envelope-fill"></i></div>
                <div>
                  <p class="tk-kontak-label">Email</p>
                  <p class="tk-kontak-value"><a href="mailto:dlh@garutkab.go.id">dlh@garutkab.go.id</a></p>
                </div>
              </div>
            </div>
            <!-- Tombol WA besar -->
            <a href="https://wa.me/628122456107" target="_blank" rel="noopener noreferrer" class="tk-btn-primary">
              <i class="bi bi-whatsapp"></i> Hubungi Kami
            </a>
          </div>

          <!-- Kolom kanan: peta -->
          <div class="tk-maps-wrap">
            <iframe 
              src="https://maps.google.com/maps?q=Dinas+Lingkungan+Hidup+Kabupaten+Garut&t=&z=15&ie=UTF8&iwloc=&output=embed"
              allowfullscreen="" 
              loading="lazy" 
              referrerpolicy="no-referrer-when-downgrade"
              title="Lokasi DLH Kabupaten Garut">
            </iframe>
            <div class="tk-maps-footer">
              <i class="bi bi-geo-alt-fill"></i>
              <span>Dinas Lingkungan Hidup Kabupaten Garut</span>
              <a href="https://www.google.com/maps/search/?api=1&query=Dinas+Lingkungan+Hidup+Kabupaten+Garut" target="_blank" rel="noopener noreferrer" class="tk-maps-open">Buka Maps <i class="bi bi-box-arrow-up-right"></i></a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ MINI (accordion) -->
    <section class="tk-faq">
      <div class="container">
        <div class="tk-section-header">
          <span class="tk-section-label">FAQ</span>
          <h2 class="tk-section-title">Pertanyaan yang Sering Ditanyakan</h2>
          <p class="tk-section-desc">Temukan jawaban atas pertanyaan umum seputar program Kang Raling.</p>
        </div>
        <div class="tk-faq-grid">
          <div v-for="(faq, idx) in faqs" :key="idx" class="tk-faq-item" :class="{ open: openFaq === idx }" @click="toggleFaq(idx)">
            <div class="tk-faq-q">
              <span class="tk-faq-q-text">{{ faq.q }}</span>
              <i class="bi bi-chevron-down tk-faq-chevron"></i>
            </div>
            <div class="tk-faq-a">{{ faq.a }}</div>
          </div>
        </div>
        <div class="tk-faq-cta">
          <p class="tk-faq-cta-text">Masih punya pertanyaan lain?</p>
          <router-link to="/faq" class="tk-btn-primary tk-faq-btn">
            <i class="bi bi-question-circle"></i> Lihat Semua FAQ
          </router-link>
        </div>
      </div>
    </section>

    <Footer />
  </div>
</template>

<script>
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import '@/assets/css/publik/tentangKami.css'

export default {
  name: 'TentangKami',
  components: { Navbar, Footer },

  data() {
    return {
      openFaq: null, // Menyimpan indeks FAQ yang sedang terbuka
      faqs: [
        {
          q: 'Apa itu TPS 3R dan bagaimana cara kerjanya?',
          a: 'TPS 3R (Tempat Pengolahan Sampah Reduce, Reuse, Recycle) adalah fasilitas pengelolaan sampah berbasis komunitas yang memilah sampah organik, anorganik, dan residu sebelum diangkut ke TPA. Sampah organik diolah menjadi kompos, anorganik didaur ulang, sedangkan residu dibuang ke TPA.'
        },
        {
          q: 'Bagaimana cara bergabung sebagai desa binaan Kang Raling?',
          a: 'Desa yang ingin bergabung dapat mengajukan permohonan melalui Dinas Lingkungan Hidup Kabupaten Garut. Syarat utamanya adalah komitmen kepala desa, ketersediaan lahan untuk TPS 3R, dan minimal 50 KK yang bersedia berpartisipasi aktif.'
        },
        {
          q: 'Siapa yang bisa mengakses data sampah di website ini?',
          a: 'Data sampah publik dapat diakses oleh siapa saja tanpa perlu login. Data ini menampilkan rekapitulasi timbulan sampah dari setiap desa binaan secara transparan untuk mendukung akuntabilitas publik.'
        },
        {
          q: 'Apa perbedaan peran Fasilitator dan Administrator?',
          a: 'Fasilitator adalah petugas lapangan yang bertugas mencatat data sampah harian di desa masing-masing. Administrator adalah pengelola sistem dari DLH Garut yang bertugas memverifikasi data, mengelola pengguna, dan mengakses seluruh fitur sistem.'
        }
      ]
    }
  },

  methods: {
    // Toggle accordion FAQ: buka jika tertutup, tutup jika terbuka
    toggleFaq(idx) {
      this.openFaq = this.openFaq === idx ? null : idx
    }
  }
}
</script>