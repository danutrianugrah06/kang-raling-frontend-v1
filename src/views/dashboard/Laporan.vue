<template>
  <div class="lp-page-content">
    <link
      href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />

    <!-- Page Header -->
    <div class="lp-page-header lp-noprint">
      <div>
        <h1 class="lp-page-title">Cetak Laporan</h1>
        <p class="lp-page-subtitle">Rekapitulasi data sampah dan pengelolaan per desa</p>
      </div>
    </div>

    <!-- Filter Card -->
    <div class="lp-filter-card lp-noprint">
      <div class="lp-filter-grid">
        <div class="lp-form-group">
          <label class="lp-label">Bulan</label>
          <select v-model="filter.bulan" class="lp-select">
            <option value="">Semua Bulan</option>
            <option v-for="b in daftarBulan" :key="b.value" :value="b.value">{{ b.label }}</option>
          </select>
        </div>
        <div class="lp-form-group">
          <label class="lp-label">Tahun</label>
          <select v-model="filter.tahun" class="lp-select">
            <option v-for="t in daftarTahun" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>
        <div v-if="isAdmin" class="lp-form-group">
          <label class="lp-label">Desa Binaan</label>
          <select v-model="filter.desa_id" class="lp-select">
            <option value="">Semua Desa</option>
            <option v-for="d in daftarDesa" :key="d.id" :value="d.id">{{ d.nama_desa }}</option>
          </select>
        </div>
        <!-- Class lp-form-group-action menggantikan inline style justify-content: flex-end -->
        <div class="lp-form-group lp-form-group-action">
          <button class="lp-btn-generate" :disabled="generating" @click="generateLaporan">
            <i v-if="generating" class="bi bi-arrow-repeat lp-spin"></i>
            <i v-else class="bi bi-search"></i>
            {{ generating ? 'Memuat Data...' : 'Tampilkan Laporan' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Skeleton -->
    <div v-if="generating" class="lp-skeleton-wrap lp-noprint">
      <div class="lp-skel lp-skel-title"></div>
      <div class="lp-skel lp-skel-table"></div>
    </div>

    <!-- Area Cetak Laporan -->
    <div v-else-if="laporanReady" id="lp-print-area" class="lp-result-wrap">

      <!-- Kop Laporan -->
      <div class="lp-kop">
        <div class="lp-kop-logo-wrap">
          <img src="@/assets/icons/logoDLH.png" alt="Logo DLH" class="lp-kop-logo" />
          <img src="@/assets/icons/logoKangRaling.png" alt="Logo Kang Raling" class="lp-kop-logo" />
        </div>
        <div class="lp-kop-text">
          <p class="lp-kop-instansi">DINAS LINGKUNGAN HIDUP KABUPATEN GARUT</p>
          <h2 class="lp-kop-judul">LAPORAN PENGELOLAAN SAMPAH</h2>
          <p class="lp-kop-sub">Program Kampung Ramah Lingkungan (Kang Raling)</p>
          <p class="lp-kop-periode">
            Periode: {{ labelPeriode }} &nbsp;|&nbsp; Dicetak: {{ formatDate(new Date()) }}
          </p>
        </div>
      </div>
      <div class="lp-kop-garis"></div>

      <!-- 5 Kotak Statistik -->
      <div class="lp-stats-row">
        <div class="lp-stat-box">
          <p class="lp-stat-val">{{ formatAngka(ringkasan.total_sampah) }} <span>Kg</span></p>
          <p class="lp-stat-lbl">Total Sampah Masuk</p>
        </div>
        <div class="lp-stat-box">
          <p class="lp-stat-val">{{ formatAngka(ringkasan.total_dikelola) }} <span>Kg</span></p>
          <p class="lp-stat-lbl">Total Terkelola</p>
        </div>
        <div class="lp-stat-box">
          <p class="lp-stat-val">{{ formatAngka(ringkasan.organik) }} <span>Kg</span></p>
          <p class="lp-stat-lbl">Total Organik</p>
        </div>
        <div class="lp-stat-box">
          <p class="lp-stat-val">{{ formatAngka(ringkasan.anorganik) }} <span>Kg</span></p>
          <p class="lp-stat-lbl">Total Anorganik</p>
        </div>
        <div class="lp-stat-box">
          <p class="lp-stat-val">{{ formatAngka(ringkasan.residu) }} <span>Kg</span></p>
          <p class="lp-stat-lbl">Total Residu</p>
        </div>
      </div>

      <!-- Tabel Data Sampah -->
      <div class="lp-section">
        <h3 class="lp-section-title">Rincian Timbulan Sampah</h3>
        <div class="lp-table-wrap">
          <table class="lp-table">
            <thead>
              <tr>
                <!-- Class lebar kolom dan alignment (menggantikan inline style) -->
                <th class="lp-th-no">No</th>
                <th class="lp-th-desa">Desa</th>
                <th class="lp-th-tanggal">Tanggal</th>
                <th class="lp-th-number lp-text-right">Organik (Kg)</th>
                <th class="lp-th-number lp-text-right">Anorganik (Kg)</th>
                <th class="lp-th-number lp-text-right">Residu (Kg)</th>
                <th class="lp-th-number lp-text-right">Total (Kg)</th>
                <th class="lp-th-status lp-text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="tabelSampah.length === 0">
                <td colspan="8" class="lp-td-empty">Tidak ada data sampah pada periode ini.</td>
              </tr>
              <tr v-else v-for="(row, idx) in tabelSampah" :key="'ds-'+idx">
                <td class="lp-text-center">{{ idx + 1 }}</td>
                <td>{{ row.desa }}</td>
                <td>{{ formatTanggal(row.tanggal) }}</td>
                <td class="lp-text-right">{{ formatAngka(row.organik) }}</td>
                <td class="lp-text-right">{{ formatAngka(row.anorganik) }}</td>
                <td class="lp-text-right">{{ formatAngka(row.residu) }}</td>
                <td class="lp-text-right lp-td-total">{{ formatAngka(row.total) }}</td>
                <td class="lp-text-center">{{ labelStatus(row.status) }}</td>
              </tr>
            </tbody>
            <tfoot v-if="tabelSampah.length > 0">
              <tr class="lp-tr-total">
                <td colspan="3" class="lp-text-right">Total Keseluruhan</td>
                <td class="lp-text-right">{{ formatAngka(ringkasan.organik) }}</td>
                <td class="lp-text-right">{{ formatAngka(ringkasan.anorganik) }}</td>
                <td class="lp-text-right">{{ formatAngka(ringkasan.residu) }}</td>
                <td class="lp-text-right lp-td-total">{{ formatAngka(ringkasan.total_sampah) }}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Tabel Data Pengelolaan -->
      <div class="lp-section">
        <h3 class="lp-section-title">Rincian Data Pengelolaan</h3>
        <div class="lp-table-wrap">
          <table class="lp-table">
            <thead>
              <tr>
                <th class="lp-th-no">No</th>
                <th class="lp-th-desa-pengelolaan">Desa</th>
                <th class="lp-th-tanggal">Tanggal</th>
                <th class="lp-th-jenis-pengelolaan">Jenis Pengelolaan</th>
                <th class="lp-th-number lp-text-right">Total Dikelola (Kg)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="tabelPengelolaan.length === 0">
                <td colspan="5" class="lp-td-empty">Tidak ada data pengelolaan pada periode ini.</td>
              </tr>
              <tr v-else v-for="(row, idx) in tabelPengelolaan" :key="'dp-'+idx">
                <td class="lp-text-center">{{ idx + 1 }}</td>
                <td>{{ row.desa }}</td>
                <td>{{ formatTanggal(row.tanggal) }}</td>
                <td>{{ row.keterangan || '-' }}</td>
                <td class="lp-text-right lp-td-total">{{ formatAngka(row.total) }}</td>
              </tr>
            </tbody>
            <tfoot v-if="tabelPengelolaan.length > 0">
              <tr class="lp-tr-total">
                <td colspan="4" class="lp-text-right">Total Sampah Terkelola</td>
                <td class="lp-text-right lp-td-total">{{ formatAngka(ringkasan.total_dikelola) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Tanda Tangan -->
      <div class="lp-ttd-row">
        <div class="lp-ttd-box">
          <p class="lp-ttd-kota">Garut, {{ formatDate(new Date()) }}</p>
          <p class="lp-ttd-jabatan">Dibuat oleh,</p>
          <p class="lp-ttd-jabatan">Petugas / Fasilitator</p>
          <div class="lp-ttd-space"></div>
          <p class="lp-ttd-nama">( {{ namaUser || '__________________________' }} )</p>
        </div>
      </div>

    </div>

    <!-- Tombol Aksi Print/PDF -->
    <div v-if="laporanReady" class="lp-action-bar lp-noprint">
      <button class="lp-btn-print" @click="cetakLaporan">
        <i class="bi bi-printer"></i> Cetak Dokumen
      </button>
      <button class="lp-btn-pdf" @click="exportPdf">
        <i class="bi bi-download"></i> Unduh PDF
      </button>
    </div>

    <!-- Toast -->
    <div class="lp-toast-wrap lp-noprint" aria-live="polite">
      <div v-for="t in toasts" :key="t.id" :class="['lp-toast', 'lp-toast-' + t.type]">
        <i :class="['lp-toast-icon bi', t.type === 'success' ? 'bi-check-circle-fill' : (t.type === 'info' ? 'bi-info-circle-fill' : 'bi-x-circle-fill')]"></i>
        <span>{{ t.message }}</span>
      </div>
    </div>

  </div>
</template>

<script>
import laporanScript from '@/scripts/dashboard/laporan.js'
import '@/assets/css/dashboard/laporan.css'

export default {
  name: 'DashboardLaporan',
  ...laporanScript,
}
</script>

<style scoped>
.lp-spin { animation: spin 0.8s linear infinite; display: inline-block; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>