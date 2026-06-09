<template>
  <div class="faq-page">
    <Navbar />

    <!-- HERO SECTION -->
    <section class="faq-hero">
      <div class="container">
        <span class="faq-hero-label">💬 Pusat Bantuan</span>
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

          <!-- ===== KATEGORI 1: TENTANG PROGRAM ===== -->
          <div class="faq-kategori">
            <div class="faq-kategori-icon green">
              <i class="bi bi-info-circle-fill"></i>
            </div>
            <span class="faq-kategori-label">Tentang Program</span>
          </div>

          <div class="faq-list">
            <div
              v-for="(faq, idx) in kategori1"
              :key="'k1-'+idx"
              class="faq-item"
              :class="{ open: openIdx === 'k1-'+idx }"
            >
              <button
                class="faq-question"
                @click="toggle('k1-'+idx)"
                :aria-expanded="openIdx === 'k1-'+idx"
              >
                <div class="faq-question-left">
                  <span class="faq-question-number">{{ idx + 1 }}</span>
                  <span class="faq-question-text">{{ faq.q }}</span>
                </div>
                <i class="bi bi-chevron-down faq-chevron"></i>
              </button>
              <div v-if="openIdx === 'k1-'+idx" class="faq-answer">
                <p v-for="(par, pi) in faq.a" :key="pi">{{ par }}</p>
              </div>
            </div>
          </div>

          <!-- ===== KATEGORI 2: DATA & PLATFORM ===== -->
          <div class="faq-kategori">
            <div class="faq-kategori-icon blue">
              <i class="bi bi-bar-chart-line-fill"></i>
            </div>
            <span class="faq-kategori-label">Data & Platform</span>
          </div>

          <div class="faq-list">
            <div
              v-for="(faq, idx) in kategori2"
              :key="'k2-'+idx"
              class="faq-item"
              :class="{ open: openIdx === 'k2-'+idx }"
            >
              <button
                class="faq-question"
                @click="toggle('k2-'+idx)"
                :aria-expanded="openIdx === 'k2-'+idx"
              >
                <div class="faq-question-left">
                  <span class="faq-question-number">{{ kategori1.length + idx + 1 }}</span>
                  <span class="faq-question-text">{{ faq.q }}</span>
                </div>
                <i class="bi bi-chevron-down faq-chevron"></i>
              </button>
              <div v-if="openIdx === 'k2-'+idx" class="faq-answer">
                <p v-for="(par, pi) in faq.a" :key="pi">{{ par }}</p>
              </div>
            </div>
          </div>

          <!-- ===== KATEGORI 3: PARTISIPASI MASYARAKAT ===== -->
          <div class="faq-kategori">
            <div class="faq-kategori-icon orange">
              <i class="bi bi-people-fill"></i>
            </div>
            <span class="faq-kategori-label">Partisipasi Masyarakat</span>
          </div>

          <div class="faq-list">
            <div
              v-for="(faq, idx) in kategori3"
              :key="'k3-'+idx"
              class="faq-item"
              :class="{ open: openIdx === 'k3-'+idx }"
            >
              <button
                class="faq-question"
                @click="toggle('k3-'+idx)"
                :aria-expanded="openIdx === 'k3-'+idx"
              >
                <div class="faq-question-left">
                  <span class="faq-question-number">
                    {{ kategori1.length + kategori2.length + idx + 1 }}
                  </span>
                  <span class="faq-question-text">{{ faq.q }}</span>
                </div>
                <i class="bi bi-chevron-down faq-chevron"></i>
              </button>
              <div v-if="openIdx === 'k3-'+idx" class="faq-answer">
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
            'Kang Raling (Kampung Ramah Lingkungan) adalah program unggulan Dinas Lingkungan Hidup Kabupaten Garut yang dirancang untuk mengintegrasikan sistem pengelolaan sampah berbasis komunitas di tingkat desa.',
            'Program ini mengedepankan prinsip Reduce, Reuse, dan Recycle (3R) yang diimplementasikan melalui TPS 3R di berbagai desa binaan di seluruh Kabupaten Garut.'
          ]
        },
        {
          q: 'Apa itu TPS 3R dan bagaimana cara kerjanya?',
          a: [
            'TPS 3R (Tempat Pengolahan Sampah Reduce, Reuse, Recycle) adalah fasilitas pengelolaan sampah berbasis komunitas yang memilah sampah menjadi tiga jenis: organik, anorganik, dan residu.',
            'Sampah organik diolah menjadi kompos, sampah anorganik dikumpulkan untuk didaur ulang oleh bank sampah, sedangkan sampah residu yang tidak bisa diolah dibuang ke TPA dengan volume yang sudah jauh berkurang.'
          ]
        },
        {
          q: 'Siapa yang mengelola program Kang Raling?',
          a: [
            'Program Kang Raling dikelola langsung oleh Dinas Lingkungan Hidup (DLH) Kabupaten Garut sebagai penanggung jawab utama.',
            'Di lapangan, setiap desa binaan memiliki seorang Fasilitator Desa yang bertugas mencatat dan melaporkan data sampah harian, serta seorang Pengelola TPS yang bertanggung jawab atas operasional TPS 3R sehari-hari.'
          ]
        },
        {
          q: 'Desa mana saja yang sudah bergabung sebagai desa binaan?',
          a: [
            'Saat ini program Kang Raling sudah mencakup beberapa desa binaan aktif di Kabupaten Garut. Kamu bisa melihat daftar lengkap desa binaan beserta profil TPS-nya di halaman Desa Binaan pada website ini.',
            'Jumlah desa binaan terus berkembang seiring bertambahnya desa yang mendaftarkan diri ke program Kang Raling.'
          ]
        }
      ],

      // KATEGORI 2: DATA & PLATFORM
      kategori2: [
        {
          q: 'Apakah data sampah yang ditampilkan di website ini bisa dipercaya?',
          a: [
            'Ya. Semua data sampah yang ditampilkan di halaman publik sudah melalui proses verifikasi oleh Administrator dari Dinas Lingkungan Hidup Kabupaten Garut sebelum dipublikasikan.',
            'Data yang masih berstatus "pending" atau ditolak tidak akan ditampilkan kepada masyarakat umum. Hanya data yang sudah diverifikasi yang bisa dilihat di halaman Data Sampah.'
          ]
        },
        {
          q: 'Siapa saja yang bisa mengakses data di website ini?',
          a: [
            'Data publik seperti statistik sampah, profil desa binaan, artikel, galeri, dan edukasi dapat diakses oleh siapa saja tanpa perlu login.',
            'Untuk mengakses fitur pengelolaan data seperti input data sampah, verifikasi, dan manajemen pengguna, diperlukan akun login dengan peran Fasilitator atau Administrator.'
          ]
        },
        {
          q: 'Bagaimana cara membaca data di halaman Data Sampah?',
          a: [
            'Di halaman Data Sampah, kamu bisa melihat rekapitulasi timbulan sampah dari setiap desa binaan. Gunakan filter Desa, Bulan, dan Tahun untuk menyaring data yang ingin dilihat.',
            'Klik tombol "Detail" pada setiap baris data untuk melihat rincian lengkap termasuk jumlah sampah organik, anorganik, residu, dan persentase sampah yang berhasil dikelola.'
          ]
        }
      ],

      // KATEGORI 3: PARTISIPASI MASYARAKAT
      kategori3: [
        {
          q: 'Bagaimana cara desa saya bergabung menjadi desa binaan Kang Raling?',
          a: [
            'Desa yang ingin bergabung dapat mengajukan permohonan langsung ke Dinas Lingkungan Hidup Kabupaten Garut.',
            'Persyaratan utamanya adalah adanya komitmen dari kepala desa, ketersediaan lahan untuk pembangunan TPS 3R, dan minimal 50 KK yang bersedia berpartisipasi aktif dalam program pemilahan sampah.'
          ]
        },
        {
          q: 'Apa manfaat yang didapat warga dari program ini?',
          a: [
            'Warga mendapatkan lingkungan yang lebih bersih dan sehat karena sampah dikelola dengan baik sejak dari sumbernya. Tidak ada lagi penumpukan sampah yang menimbulkan bau dan penyakit.',
            'Selain itu, warga juga bisa mendapatkan manfaat ekonomi dari bank sampah — sampah anorganik yang dikumpulkan bisa ditukar dengan uang atau sembako melalui program bank sampah yang dikelola TPS 3R.'
          ]
        },
        {
          q: 'Bagaimana cara melaporkan permasalahan atau memberikan masukan?',
          a: [
            'Kamu bisa menghubungi tim Kang Raling langsung melalui WhatsApp di nomor +62 812-2456-107 pada hari kerja Senin–Jumat pukul 08.00–16.00 WIB.',
            'Alternatifnya, kamu juga bisa mengirimkan email ke dlh@garutkab.go.id atau datang langsung ke kantor Dinas Lingkungan Hidup Kabupaten Garut di Jl. Terusan Pahlawan No. 20, Tarogong Kidul, Kabupaten Garut.'
          ]
        }
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