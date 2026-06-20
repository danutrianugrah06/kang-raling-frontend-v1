<template>
  <div class="faq-page">
    <Navbar />

    <!-- HERO SECTION -->
    <section class="faq-hero">
      <div class="container">
        <span class="faq-hero-label">Pusat Bantuan</span>
        <h1 class="faq-hero-title">
          Pertanyaan yang Sering <span>Ditanyakan</span>
        </h1>
        <p class="faq-hero-desc">
          Temukan jawaban atas pertanyaan umum seputar program Kang Raling,
          pengelolaan sampah, dan cara menggunakan platform ini.
        </p>
      </div>
    </section>

    <!-- KONTEN FAQ -->
    <section class="faq-content">
      <div class="container">
        <div class="faq-inner">

          <!-- KATEGORI 1: TENTANG PROGRAM -->
          <div class="faq-kategori">
            <div class="faq-kategori-icon green">
              <i class="bi bi-info-circle-fill"></i>
            </div>
            <span class="faq-kategori-label">Tentang Program dan Pengelolaan Sampah</span>
          </div>

          <div class="faq-list">
            <div v-for="(faq, idx) in kategori1" :key="'k1-' + idx" class="faq-item"
              :class="{ open: openIdx === 'k1-' + idx }">
              <button class="faq-question" @click="toggle('k1-' + idx)" :aria-expanded="openIdx === 'k1-' + idx">
                <div class="faq-question-left">
                  <span class="faq-question-number">{{ idx + 1 }}</span>
                  <span class="faq-question-text">{{ faq.q }}</span>
                </div>
                <i class="bi bi-chevron-down faq-chevron"></i>
              </button>
              <div v-if="openIdx === 'k1-' + idx" class="faq-answer">
                <p v-for="(par, pi) in faq.a" :key="pi">{{ par }}</p>
              </div>
            </div>
          </div>

          <!-- KATEGORI 2: PERAN & TATA KELOLA -->
          <div class="faq-kategori">
            <div class="faq-kategori-icon orange">
              <i class="bi bi-people-fill"></i>
            </div>
            <span class="faq-kategori-label">Peran & Tata Kelola</span>
          </div>

          <div class="faq-list">
            <div v-for="(faq, idx) in kategori2" :key="'k2-' + idx" class="faq-item"
              :class="{ open: openIdx === 'k2-' + idx }">
              <button class="faq-question" @click="toggle('k2-' + idx)" :aria-expanded="openIdx === 'k2-' + idx">
                <div class="faq-question-left">
                  <span class="faq-question-number">{{ kategori1.length + idx + 1 }}</span>
                  <span class="faq-question-text">{{ faq.q }}</span>
                </div>
                <i class="bi bi-chevron-down faq-chevron"></i>
              </button>
              <div v-if="openIdx === 'k2-' + idx" class="faq-answer">
                <p v-for="(par, pi) in faq.a" :key="pi">{{ par }}</p>
              </div>
            </div>
          </div>

          <!-- KATEGORI 3: DATA & PLATFORM -->
          <div class="faq-kategori">
            <div class="faq-kategori-icon blue">
              <i class="bi bi-bar-chart-line-fill"></i>
            </div>
            <span class="faq-kategori-label">Data & Platform</span>
          </div>

          <div class="faq-list">
            <div v-for="(faq, idx) in kategori3" :key="'k3-' + idx" class="faq-item"
              :class="{ open: openIdx === 'k3-' + idx }">
              <button class="faq-question" @click="toggle('k3-' + idx)" :aria-expanded="openIdx === 'k3-' + idx">
                <div class="faq-question-left">
                  <span class="faq-question-number">
                    {{ kategori1.length + kategori2.length + idx + 1 }}
                  </span>
                  <span class="faq-question-text">{{ faq.q }}</span>
                </div>
                <i class="bi bi-chevron-down faq-chevron"></i>
              </button>
              <div v-if="openIdx === 'k3-' + idx" class="faq-answer">
                <p v-for="(par, pi) in faq.a" :key="pi">{{ par }}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <Footer />
  </div>
</template>

<script>
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import '@/assets/css/publik/faq.css'

export default {
  name: 'FaqPage',
  components: { Navbar, Footer },

  data() {
    return {
      openIdx: null, // Menyimpan indeks FAQ yang sedang terbuka (null = semua tertutup)

      // KATEGORI 1: TENTANG PROGRAM
      kategori1: [
        {
          q: 'Apa itu program Kang Raling?',
          a: [
            'Program Kampung Ramah Lingkungan (Kang Raling) merupakan sebuah program peningkatan peran serta masyarakat dalam pengelolaan sampah dan perbaikan lingkungan dengan membangun model pengelolaan sampah yang berkelanjutan di tingkat kawasan setingkat RW.'
          ]
        },
        {
          q: 'Apa saja tujuan utama dari Program Kang Raling?',
          a: [
            '- Mengedukasi masyarakat agar mampu memilah sampah dari rumah.',
            '- Meningkatkan partisipasi masyarakat dalam mengelola sampah (terutama organik) dan menata lingkungan.',
            '- Membangun model pengelolaan sampah yang berkelanjutan di kawasan setingkat RW atau Desa'
          ]
        },
        {
          q: 'Bagaimana tahapan awal untuk membuat program ini di lingkungan saya?',
          a: [
            'Pembuatan Kang Raling dimulai dengan memilih RW model yang sudah memiliki sistem dasar, kemudian membentuk Kelompok Penggerak. Setelah itu, dilakukan pemetaan potensi wilayah, dilanjutkan dengan diskusi antar pihak untuk menyepakati sistem pengelolaan sampah yang sesuai.'
          ]
        },
        {
          q: 'Siapa sajakah yang memegang peranan penting agar program ini berhasil?',
          a: [
            'Keberhasilan Kang Raling memerlukan kolaborasi multi-pihak, mulai dari individu yang memilah sampah, Kelompok Penggerak yang mengedukasi warga, RT/RW yang membuat sistem dan memonitor, hingga Pemerintah dan Dinas Lingkungan Hidup yang membuat kebijakan dan mendukung sarana.'
          ]
        },
        {
          q: 'Apa dampak positif yang akan didapatkan warga jika menerapkan pengelolaan sampah ala Kang Raling?',
          a: [
            'Program ini dirancang untuk tidak sekadar menyelesaikan masalah sampah, tetapi juga memberi dampak positif lintas dimensi. Masyarakat akan mendapatkan lingkungan yang lebih bersih, terciptanya sumber pendapatan baru melalui inovasi daur ulang, serta terserapnya tenaga kerja bagi petugas persampahan lokal.'
          ]
        },
        {
          q: 'Apa kunci sukses paling utama dalam pengelolaan sampah di kawasan?',
          a: [
            'Kunci sukses yang paling utama dan menjadi syarat mutlak adalah pemilahan sampah langsung dari sumbernya (rumah tangga). Pemilahan sejak awal ini akan sangat mengurangi beban transportasi sampah dan jumlah sampah yang dibuang ke TPA.'
          ]
        },
        {
          q: 'Bagaimana panduan dasar pemilahan sampah ala Kang Raling?',
          a: [
            '- Organik: Sisa makanan dan tumbuhan yang diselesaikan di rumah atau kawasan.',
            '- Anorganik: Sampah berpotensi daur ulang yang bisa disalurkan ke Bank Sampah.',
            '- Residu: Sampah lainnya yang tidak bisa diolah dan akan ditangani oleh pemerintah untuk dibuang ke TPA.'
          ]
        },
        {
          q: 'Apa yang harus kami lakukan terhadap sampah organik dari dapur?',
          a: [
            'Sampah organik sebaiknya diolah sedekat mungkin dengan sumbernya. Anda dapat melakukan pengomposan mandiri, menjadikannya pakan binatang (seperti maggot, bebek, atau ayam), atau mengolahnya menjadi Pupuk Organik Cair (POC) / MOL.'
          ]
        },
        {
          q: 'Bagaimana langkah awal yang baik untuk mengurangi timbulan sampah sehari-hari?',
          a: [
            'Kita bisa mulai dengan mencegah food waste (sampah makanan) melalui perencanaan menu dan daftar belanja sesuai kebutuhan. Selain itu, kurangi pemakaian plastik dengan membawa tas belanja, menggunakan botol minum/tumbler sendiri, memakai wadah makanan guna ulang, dan mengganti tisu dengan sapu tangan.'
          ]
        },
        {
          q: 'Apa yang terjadi jika sampah tidak dipilah dan tercampur begitu saja?',
          a: [
            'Sampah yang tercampur akan menjadi tumpukan sampah yang bau dan berpenyakit, menurunkan kualitas lingkungan, serta tidak bisa dimanfaatkan kembali melalui siklus organik maupun anorganik (daur ulang).'
          ]
        },
      ],

      // KATEGORI 2: DATA & PLATFORM
      kategori2: [
        {
          q: 'Apa sebenarnya peran saya dan keluarga dalam sistem ini?',
          a: [
            'Peran paling krusial dari individu dan keluarga adalah disiplin memisahkan sampah secara mandiri dari dalam rumah dan tertib membayar retribusi/iuran kebersihan setiap bulannya.'
          ]
        },
        {
          q: 'Apa yang dimaksud dengan Kelompok Penggerak?',
          a: [
            'Kelompok Penggerak adalah sekelompok warga setempat—bisa dari unsur RT, RW, tokoh masyarakat, Karang Taruna, kader posyandu, atau PKK yang mampu bergerak dan mengajak warga lainnya untuk mau terlibat aktif dalam pengelolaan sampah.'
          ]
        },
        {
          q: 'Bagaimana jika ada warga yang enggan memilah sampah?',
          a: [
            'Kelompok Penggerak akan terus melakukan pendekatan dan pendampingan. Edukasi dapat dilakukan dengan mendatangi rumah warga untuk memastikan mereka paham sistem pemilahan, atau melalui sosialisasi tentang pengelolaan sampah.'
          ]
        },
        {
          q: 'Dari mana sumber biaya operasional pengelolaan sampah didapatkan?',
          a: [
            'Sumber pemasukan utama berasal dari iuran warga per bulan yang sebaiknya dikoordinir oleh RT/RW agar lebih terkontrol. Pendapatan tambahan juga bisa diperoleh dari hasil penjualan sampah daur ulang, penjualan kompos.'
          ]
        },
        {
          q: 'Mengapa pengelolaan sampah di tingkat Desa membutuhkan Peraturan Desa (Perdes)?',
          a: [
            'Perdes sangat diperlukan untuk memberikan kepastian hukum dan kejelasan kewenangan antara pemerintah desa dan masyarakat. Perdes memastikan setiap warga tunduk pada sistem yang disepakati, guna menjamin kelestarian alam dan kesehatan masyarakat setempat.'
          ]
        }
      ],

      // KATEGORI 3: PARTISIPASI MASYARAKAT
      kategori3: [
        {
          q: 'Benarkah pemerintah akan berhenti membangun Tempat Pembuangan Akhir (TPA)?',
          a: [
            'Benar. Berdasarkan target Kementerian Lingkungan Hidup dan Kehutanan (KLHK), pada tahun 2030 tidak akan ada lagi pembangunan TPA baru di Indonesia. Penggunaan TPA eksisting hanya akan dilanjutkan sampai masa operasionalnya berakhir.'
          ]
        },
        {
          q: 'Mengapa paradigma "Kumpul-Angkut-Buang" harus ditinggalkan?',
          a: [
            'Berdasarkan amanat UU No 18 Tahun 2008, kita harus bertransformasi dari sistem sentralisasi menuju desentralisasi. Artinya, sampah tidak lagi semuanya dikirim ke TPA, melainkan harus dikelola dan diolah sedekat mungkin dengan sumbernya secara partisipatif di tingkat rumah, RW, atau desa.'
          ]
        },
        {
          q: 'Apakah Dana Desa bisa dialokasikan untuk program pengelolaan sampah?',
          a: [
            'Bisa dan sangat dianjurkan. Berdasarkan Peraturan Menteri Desa Nomor 7 Tahun 2023, Dana Desa dapat diprioritaskan untuk mewujudkan "Desa Peduli Lingkungan Darat". Dana ini sah digunakan untuk pengelolaan limbah rumah tangga, bank sampah desa, kendaraan pengangkut sampah, hingga mesin pengolah sampah.'
          ]
        },
        {
          q: 'Informasi apa saja yang bisa saya akses secara bebas di website ini?',
          a: [
            'Melalui website resmi Kang Raling (https://kangraling.dlhgarut.id/), Anda dapat mempelajari konsep teknis pengelolaan kawasan, serta mengakses E-Book interaktif. Tersedia Buku Saku Budi Daya Maggot, Buku Saku Kompos, Buku Saku Ecoenzyme, dan Buku Saku Pemilahan. serta bisa melihat data sampah yang ada di Desa Binaan Kang Raling'
          ]
        },
        {
          q: 'Bagaimana jika Desa kami butuh pendampingan untuk memulai program ini?',
          a: [
            'Jika wilayah Anda sudah memiliki embrio pengelolaan sampah dan berencana membangun sistem ala Kang Raling, Anda dapat mengontak kami melalui informasi kontak dan media sosial (@kangraling) yang tertera di website ini untuk koordinasi lebih lanjut terkait edukasi dan kolaborasi.'
          ]
        },
      ]
    }
  },

  methods: {
    /**
     * Toggle accordion FAQ
     * @param {string} idx - Kunci unik untuk item FAQ (contoh: 'k1-0')
     * Jika idx sama dengan yang sedang terbuka, tutup; jika berbeda, buka yang baru.
     */
    toggle(idx) {
      this.openIdx = this.openIdx === idx ? null : idx
    }
  }
}
</script>

<!-- 
  CATATAN: 
  - Semua style sudah dipisahkan ke file faq.css.
  - Tidak ada inline style tersisa di template.
-->