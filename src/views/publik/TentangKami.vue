<template>
  <div class="tentang-kami-page">
    <Navbar />

    <!-- HERO SECTION dengan gambar background -->
    <section class="tk-hero">
      <img src="@/assets/images/tentangKamiPage.png" alt="Tentang Kang Raling" class="tk-hero-bg" loading="eager" />
      <div class="tk-hero-overlay"></div>

      <!-- Class tk-hero-container menggantikan inline style position:relative; z-index:2 -->
      <div class="container tk-hero-container">
        <span class="tk-hero-label">Kenali Lebih Dekat</span>
        <h1 class="tk-hero-title">
          Tentang <span>Kang Raling</span>
        </h1>
        <p class="tk-hero-desc">
          Kampung Ramah Lingkungan Program Kerja Dinas Lingkungan Hidup Kabupaten Garut
          untuk mewujudkan pengelolaan sampah mandiri yang terintegrasi, berkelanjutan,
          dan berbasis masyarakat di seluruh Desa Garut.
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
              pengelolaan sampah mandiri berbasis teknologi digital Provinsi di Jawa Barat.
            </p>
          </div>

          <!-- Statistik singkat (4 kotak) -->
          <div class="tk-tentang-stats">
            <div class="tk-tentang-stat-item">
              <p class="tk-tentang-stat-value">10+</p>
              <p class="tk-tentang-stat-label">Desa Binaan Aktif</p>
            </div>
            <div class="tk-tentang-stat-divider"></div>
            <div class="tk-tentang-stat-item">
              <p class="tk-tentang-stat-value">10+</p>
              <p class="tk-tentang-stat-label">Unit TPS 3R</p>
            </div>
            <div class="tk-tentang-stat-divider"></div>
            <div class="tk-tentang-stat-item">
              <p class="tk-tentang-stat-value">1.000+</p>
              <p class="tk-tentang-stat-label">KK Terlayani</p>
            </div>
            <div class="tk-tentang-stat-divider"></div>
            <div class="tk-tentang-stat-item">
              <p class="tk-tentang-stat-value">900+</p>
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
            <h3 class="tk-tujuan-name">Kurangi Sampah</h3>
            <p class="tk-tujuan-desc">Gunakan wadah sendiri dan hindari plastik sekali pakai untuk mengurangi timbulan sampah dari sumbernya.</p>
          </div>
          <div class="tk-tujuan-card">
            <div class="tk-tujuan-icon blue"><i class="bi bi-tree"></i></div>
            <h3 class="tk-tujuan-name">Pisahkan Sampah</h3>
            <p class="tk-tujuan-desc">Pisahkan sampah organik, anorganik, dan residu agar lebih mudah dikelola dan didaur ulang.</p>
          </div>
          <div class="tk-tujuan-card">
            <div class="tk-tujuan-icon orange"><i class="bi bi-currency-dollar"></i></div>
            <h3 class="tk-tujuan-name">Manfaatkan Sampah</h3>
            <p class="tk-tujuan-desc">Ubah sampah menjadi kompos atau barang daur ulang agar memiliki nilai dan tidak terbuang percuma.</p>
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
          q: 'Mengapa lingkungan RW/Desa kita harus segera memulai pengelolaan sampah mandiri?',
          a: 'Pemerintah melalui KLHK menargetkan bahwa pada tahun 2030 tidak akan ada lagi pembangunan TPA (Tempat Pembuangan Akhir) baru. Oleh karena itu, kita harus segera beralih dari sistem sentralisasi yang hanya membuang sampah ke TPA, menuju sistem desentralisasi di mana sampah dikelola sedekat mungkin dengan sumbernya secara partisipatif.'
        },
        {
          q: 'Apa syarat utama agar sistem pengelolaan sampah kawasan ini bisa sukses?',
          a: 'Kunci sukses yang paling utama adalah kedisiplinan warga dalam melakukan pemilahan sampah langsung dari sumbernya, yaitu dari dalam rumah. Warga setidaknya wajib memisahkan sampah ke dalam kategori organik (sisa makanan/tumbuhan), anorganik (potensi daur ulang), dan sampah residu agar proses pengolahan selanjutnya dapat berjalan lancar.'
        },
        {
          q: 'Mengapa pengelolaan sampah di tingkat kawasan memerlukan landasan hukum berupa Peraturan Desa (Perdes)?',
          a: 'Dalam upaya menanggulangi sampah sedekat mungkin dengan sumbernya, diperlukan kepastian hukum yang kuat melalui pembentukan Perdes Pengelolaan Sampah. Peraturan ini krusial untuk memperjelas tanggung jawab serta kewenangan pemerintah desa, mengatur standar peran serta masyarakat, dan melibatkan dunia usaha agar penyelesaian masalah sampah dapat dilakukan bersama. Selain itu, Perdes menjadi wujud kepatuhan desa terhadap transformasi sistem persampahan nasional yang menuntut peralihan dari sistem sentralisasi (kumpul-angkut-buang) menuju sistem desentralisasi yang partisipatif.'
        },
        {
          q: 'Apa keuntungan Ekonomi Sirkular yang didapat warga dari program ini?',
          a: 'Dengan program Kang Raling, sampah tidak hanya dibuang tetapi diubah menjadi manfaat. Melalui siklus organik (Harum Madu), warga bisa mengolah sampah dapur menjadi kompos atau POC (Pupuk Organik Cair) untuk media tanam. Hasil panen sayurnya kemudian bisa dikonsumsi kembali, sehingga lingkungan menjadi lebih bersih, pengeluaran dapur lebih hemat, dan warga lebih sejahtera.'
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