<template>
  <div class="data-sampah-page">
    <Navbar />

    <!-- HERO SECTION -->
    <section class="ds-hero">
      <div class="container ds-hero-container">
        <span class="ds-hero-label">Data Publik</span>
        <h1 class="ds-hero-title">Statistik Data Sampah</h1>
        <p class="ds-hero-desc">
          Data timbulan sampah di desa-desa binaan Kang Raling secara real-time di Kabupaten Garut.
        </p>
      </div>
    </section>

    <!-- KONTEN UTAMA -->
    <section class="ds-content">
      <div class="container">

        <!-- INDIKATOR BANNER -->
        <div class="ds-indikator">
          <i class="bi bi-shield-check"></i>
          <p class="ds-indikator-text">
            <span>Indikator Pengawasan, Pembinaan TPS 3R, dan Pengelolaan Sampah</span><br>
            Data berikut merupakan rekapitulasi laporan sampah dari seluruh TPS 3R
            yang aktif di bawah binaan Dinas Lingkungan Hidup Kabupaten Garut.
          </p>
        </div>

        <!-- 6 STATISTIK CARD (Skeleton atau Data) -->
        <div v-if="loadingData" class="ds-stats-grid ds-stats-mb">
          <div v-for="n in 6" :key="'sk-stat-' + n" class="sk-stat">
            <div class="sk-stat-icon"></div>
            <div class="sk-stat-content">
              <div class="sk sk-stat-value-skel"></div>
              <div class="sk sk-stat-label-skel"></div>
            </div>
          </div>
        </div>

        <div v-else class="ds-stats-grid ds-stats-mb">
          <div class="ds-stat-card">
            <div class="ds-stat-icon green"><i class="bi bi-buildings"></i></div>
            <div class="ds-stat-info">
              <p class="ds-stat-value">
                {{ formatAngka(statistikLokal.jumlah_tps) }}
                <span class="ds-stat-unit">Desa</span>
              </p>
              <p class="ds-stat-label">Jumlah TPS 3R (Desa)</p>
            </div>
          </div>

          <div class="ds-stat-card">
            <div class="ds-stat-icon orange"><i class="bi bi-trash3"></i></div>
            <div class="ds-stat-info">
              <p class="ds-stat-value">
                {{ formatAngka(statistikLokal.total_sampah) }}
                <span class="ds-stat-unit">Kg</span>
              </p>
              <p class="ds-stat-label">Total Timbulan Sampah</p>
            </div>
          </div>

          <div class="ds-stat-card">
            <div class="ds-stat-icon teal"><i class="bi bi-recycle"></i></div>
            <div class="ds-stat-info">
              <p class="ds-stat-value">
                {{ formatAngka(statistikLokal.total_terkelola) }}
                <span class="ds-stat-unit">Kg</span>
              </p>
              <p class="ds-stat-label">Total Sampah Terkelola</p>
            </div>
          </div>

          <div class="ds-stat-card">
            <div class="ds-stat-icon green"><i class="bi bi-flower1"></i></div>
            <div class="ds-stat-info">
              <p class="ds-stat-value">
                {{ formatAngka(statistikLokal.total_organik) }}
                <span class="ds-stat-unit">Kg</span>
              </p>
              <p class="ds-stat-label">Total Organik</p>
            </div>
          </div>

          <div class="ds-stat-card">
            <div class="ds-stat-icon blue"><i class="bi bi-box-seam"></i></div>
            <div class="ds-stat-info">
              <p class="ds-stat-value">
                {{ formatAngka(statistikLokal.total_anorganik) }}
                <span class="ds-stat-unit">Kg</span>
              </p>
              <p class="ds-stat-label">Total Anorganik</p>
            </div>
          </div>

          <div class="ds-stat-card">
            <div class="ds-stat-icon purple"><i class="bi bi-slash-circle"></i></div>
            <div class="ds-stat-info">
              <p class="ds-stat-value">
                {{ formatAngka(statistikLokal.total_residu) }}
                <span class="ds-stat-unit">Kg</span>
              </p>
              <p class="ds-stat-label">Total Residu</p>
            </div>
          </div>
        </div>

        <!-- FILTER -->
        <div class="ds-filter-card">
          <div class="ds-filter-row">
            <div class="ds-filter-group">
              <label class="ds-filter-label" for="filterDesa">Pilih Desa</label>
              <select id="filterDesa" name="filterDesa" class="ds-filter-select" v-model="filterDesa">
                <option value="">Semua Desa</option>
                <option v-for="desa in desas" :key="desa.id" :value="desa.id">
                  {{ desa.nama_desa }}
                </option>
              </select>
            </div>
            <div class="ds-filter-group">
              <label class="ds-filter-label" for="filterBulan">Pilih Bulan</label>
              <select id="filterBulan" name="filterBulan" class="ds-filter-select" v-model="filterBulan">
                <option value="">Semua Bulan</option>
                <option v-for="bln in bulanOptions" :key="bln.value" :value="bln.value">
                  {{ bln.label }}
                </option>
              </select>
            </div>
            <div class="ds-filter-group">
              <label class="ds-filter-label" for="filterTahun">Pilih Tahun</label>
              <select id="filterTahun" name="filterTahun" class="ds-filter-select" v-model="filterTahun">
                <option value="">Semua Tahun</option>
                <option v-for="thn in tahunOptions" :key="thn" :value="String(thn)">
                  {{ thn }}
                </option>
              </select>
            </div>
            <button class="ds-filter-btn" :disabled="loadingData" @click="terapkanFilter">
              <i class="bi bi-funnel-fill"></i> Terapkan Filter
            </button>
            <button class="ds-filter-reset" @click="resetFilter">
              <i class="bi bi-arrow-counterclockwise"></i> Reset
            </button>
          </div>
        </div>

        <!-- DATA PER DESA (ACCORDION) -->
        <!-- Skeleton desa -->
        <div v-if="loadingData" class="ds-desa-list">
          <div v-for="n in 3" :key="'sk-desa-' + n" class="sk-block ds-sk-block">
            <div class="ds-sk-header">
              <div class="sk sk-desa-icon"></div>
              <div class="ds-sk-header-text">
                <div class="sk sk-desa-title"></div>
                <div class="sk sk-desa-sub"></div>
              </div>
            </div>
            <div class="sk sk-desa-body"></div>
          </div>
        </div>

        <!-- Empty global -->
        <div v-else-if="desaList.length === 0" class="ds-empty-global">
          <i class="bi bi-inbox"></i>
          <h3>Belum Ada Data Sampah</h3>
          <p>
            Data sampah untuk filter yang dipilih belum tersedia.
            Coba ubah filter bulan, tahun, atau desa.
          </p>
        </div>

        <!-- Accordion desa -->
        <div v-else class="ds-desa-list">
          <div v-for="desa in desaList" :key="desa.id" class="ds-desa-block">
            <div class="ds-desa-header" :class="{ open: openDesaId === desa.id }" @click="toggleDesa(desa.id)">
              <div class="ds-desa-header-left">
                <div class="ds-desa-icon"><i class="bi bi-geo-alt-fill"></i></div>
                <div>
                  <p class="ds-desa-nama">{{ desa.nama }}</p>
                  <p class="ds-desa-sub">{{ desa.alamat }}</p>
                </div>
              </div>
              <div class="ds-desa-header-right">
                <div class="ds-desa-total">
                  <p class="ds-desa-total-value">{{ getTotalTimbulanDesa(desa.id) }} Kg</p>
                  <p class="ds-desa-total-label">Total Timbulan</p>
                </div>
                <i class="bi bi-chevron-down ds-desa-chevron" :class="{ open: openDesaId === desa.id }"></i>
              </div>
            </div>

            <div class="ds-desa-body" :class="{ open: openDesaId === desa.id }">
              <div v-if="getDataPerDesa(desa.id).length === 0" class="ds-desa-empty">
                <i class="bi bi-inbox"></i> Belum ada data untuk desa ini pada periode yang dipilih.
              </div>

              <div v-else>
                <div class="ds-table-wrap">
                  <table class="ds-table">
                    <thead>
                      <tr>
                        <th>Tanggal</th>
                        <th>Total Timbulan Sampah</th>
                        <th>Total Sampah Terkelola</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in getDataHalaman(desa.id)" :key="item.id">
                        <td class="ds-table-date">{{ formatTanggal(item.tanggal) }}</td>
                        <td><span class="ds-table-value">{{ formatAngka(item.total_timbulan) }}</span><span
                            class="ds-table-unit">Kg</span></td>
                        <td><span class="ds-table-value">{{ formatAngka(item.total_terkelola) }}</span><span
                            class="ds-table-unit">Kg</span></td>
                        <td><button class="btn-detail" @click.stop="bukaDetail(item)"><i class="bi bi-eye"></i>
                            Detail</button></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Pagination per desa -->
                <div v-if="getDataPerDesa(desa.id).length > 0" class="ds-pagination">
                  <span class="ds-pagination-info">{{ getPaginasiInfo(desa.id) }}</span>
                  <div class="ds-pagination-btns">
                    <button class="ds-page-btn" :disabled="getHalamanAktif(desa.id) === 1"
                      @click="halamanSebelumnya(desa.id)"><i class="bi bi-chevron-left"></i></button>
                    <button v-for="hal in getHalamanRange(desa.id)" :key="hal" class="ds-page-btn"
                      :class="{ active: getHalamanAktif(desa.id) === hal }" @click="gantiHalaman(desa.id, hal)">{{ hal
                      }}</button>
                    <button class="ds-page-btn" :disabled="getHalamanAktif(desa.id) === getTotalHalaman(desa.id)"
                      @click="halamanBerikutnya(desa.id)"><i class="bi bi-chevron-right"></i></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- MODAL DETAIL SAMPAH -->
    <div v-if="modalVisible" class="modal-overlay" @click.self="tutupModal">
      <div class="modal-box">
        <div class="modal-header">
          <div class="modal-header-left">
            <div class="modal-header-icon"><i class="bi bi-bar-chart-line-fill"></i></div>
            <div>
              <p class="modal-header-title">Detail Data Sampah</p>
              <p class="modal-header-sub">{{ formatTanggal(modalData?.tanggal) }}</p>
            </div>
          </div>
          <button class="modal-close" @click="tutupModal"><i class="bi bi-x-lg"></i></button>
        </div>
        <div class="modal-body">
          <div class="modal-data-grid">
            <div class="modal-data-item organik">
              <div class="modal-data-label"><i class="bi bi-flower1"></i> Sampah Organik</div><span
                class="modal-data-value">{{ formatAngka(modalData?.organik) }}</span><span
                class="modal-data-unit">Kg</span>
            </div>
            <div class="modal-data-item anorganik">
              <div class="modal-data-label"><i class="bi bi-box-seam"></i> Sampah Anorganik</div><span
                class="modal-data-value">{{ formatAngka(modalData?.anorganik) }}</span><span
                class="modal-data-unit">Kg</span>
            </div>
            <div class="modal-data-item residu">
              <div class="modal-data-label"><i class="bi bi-slash-circle"></i> Sampah Residu</div><span
                class="modal-data-value">{{ formatAngka(modalData?.residu) }}</span><span
                class="modal-data-unit">Kg</span>
            </div>
            <div class="modal-data-item total">
              <div class="modal-data-label"><i class="bi bi-trash3"></i> Total Timbulan Sampah</div><span
                class="modal-data-value">{{ formatAngka(modalData?.total_timbulan) }}</span><span
                class="modal-data-unit">Kg</span>
            </div>
            <div class="modal-data-item terkelola full">
              <div class="modal-data-label"><i class="bi bi-recycle"></i> Total Sampah Terkelola</div><span
                class="modal-data-value">{{ formatAngka(modalData?.total_terkelola) }}</span><span
                class="modal-data-unit">Kg</span>
              <div class="modal-progress-wrap">
                <div class="modal-progress-label"><span>Persentase terkelola</span><span>{{ persenTerkelola(modalData)
                    }}%</span></div>
                <div class="modal-progress-bar">
                  <div class="modal-progress-fill" :style="{ width: persenTerkelola(modalData) + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer"><button class="btn-modal-close" @click="tutupModal">Tutup</button></div>
      </div>
    </div>

    <!-- TOAST -->
    <div class="toast-container">
      <div v-for="t in toasts" :key="t.id" class="toast" :class="t.type"><i
          :class="t.type === 'success' ? 'bi bi-check-circle-fill' : 'bi bi-exclamation-circle-fill'"></i>{{ t.message
          }}</div>
    </div>

    <Footer />
  </div>
</template>

<script>
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import dataSampahScript from '@/scripts/publik/dataSampah.js'
import '@/assets/css/publik/dataSampah.css'

export default {
  name: 'DataSampahPage',
  components: { Navbar, Footer },
  ...dataSampahScript
}
</script>