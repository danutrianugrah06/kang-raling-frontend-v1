<template>
  <div class="at-page-content">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

    <!-- Page Header -->
    <div class="at-page-header">
      <div>
        <h1 class="at-page-title">Tabel Generate API</h1>
        <p class="at-page-subtitle">Kelola status, uji koneksi, dan reset token akses pihak eksternal</p>
      </div>
    </div>

    <!-- Table Card -->
    <div class="at-table-card">

      <!-- Toolbar (Search) -->
      <div class="at-toolbar">
        <div class="at-search-wrap">
          <i class="bi bi-search"></i>
          <input v-model="searchQuery" type="text" class="at-search-input" placeholder="Cari nama token..." />
        </div>
      </div>

      <!-- Table -->
      <div class="at-table-wrap">
        <table class="at-table">
          <thead>
            <tr>
              <!-- Class lebar kolom (menggantikan inline style width) -->
              <th class="at-th-no">No</th>
              <th class="at-th-nama">Nama Token</th>
              <th class="at-th-key">Token Key</th>
              <th class="at-th-status">Status</th>
              <th class="at-th-tanggal">Dibuat Pada</th>
              <th class="at-th-aksi">Aksi</th>
            </tr>
          </thead>
          <tbody>

            <!-- Skeleton Loader -->
            <template v-if="loading">
              <tr v-for="n in 5" :key="'skel-' + n">
                <td><div class="at-skel at-skel-no"></div></td>
                <td><div class="at-skel at-skel-nama"></div></td>
                <td><div class="at-skel at-skel-key"></div></td>
                <td><div class="at-skel at-skel-status"></div></td>
                <td><div class="at-skel at-skel-tanggal"></div></td>
                <td>
                  <div class="at-aksi">
                    <div class="at-skel at-skel-btn"></div>
                    <div class="at-skel at-skel-btn"></div>
                    <div class="at-skel at-skel-btn"></div>
                  </div>
                </td>
              </tr>
            </template>

            <!-- Empty State -->
            <template v-else-if="filteredKeys.length === 0">
              <tr>
                <td colspan="6">
                  <div class="at-empty">
                    <div class="at-empty-icon"><i class="bi bi-key"></i></div>
                    <p class="at-empty-title">Belum ada API Key</p>
                    <p class="at-empty-desc">Tidak ada token yang cocok dengan pencarian, atau token belum dibuat.</p>
                  </div>
                </td>
              </tr>
            </template>

            <!-- Data Rows -->
            <template v-else>
              <tr v-for="(item, index) in filteredKeys" :key="item.id" class="at-data-row">
                <td class="at-td-center">{{ index + 1 }}</td>
                <td>
                  <p class="at-td-nama">{{ item.name }}</p>
                  <p class="at-td-sub">Oleh: {{ item.generated_by_name || 'Administrator' }}</p>
                </td>
                <td>
                  <div class="at-key-wrap">
                    <code class="at-key-code">{{ visibleKeys[item.id] ? item.key : maskKey(item.key) }}</code>
                    <button class="at-key-action" @click="toggleVisible(item.id)" :title="visibleKeys[item.id] ? 'Sembunyikan' : 'Tampilkan'">
                      <i :class="visibleKeys[item.id] ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                    </button>
                    <button class="at-key-action" @click="copyKey(item)" title="Salin Token">
                      <i :class="copiedId === item.id ? 'bi bi-check2' : 'bi bi-clipboard'"></i>
                    </button>
                  </div>
                </td>
                <td>
                  <select :value="item.is_active ? 'aktif' : 'nonaktif'" @change="toggleStatus(item)" class="at-select-status">
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </td>
                <td><span class="at-td-date">{{ formatDate(item.created_at) }}</span></td>
                <td>
                  <div class="at-aksi">
                    <button class="at-btn-icon at-btn-test" @click="testKey(item)" :disabled="testingId === item.id || !item.is_active" title="Test Koneksi">
                      <i v-if="testingId === item.id" class="bi bi-hourglass-split at-spin"></i>
                      <i v-else class="bi bi-send"></i>
                    </button>
                    <button class="at-btn-icon at-btn-reset" @click="confirmReset(item)" title="Reset Token">
                      <i class="bi bi-arrow-repeat"></i>
                    </button>
                    <button class="at-btn-icon at-btn-hapus" @click="confirmDelete(item)" title="Hapus Token">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </template>

          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL KONFIRMASI RESET -->
    <div v-if="showResetModal" class="at-modal-overlay" @click.self="showResetModal = false">
      <div class="at-modal at-modal-sm">
        <div class="at-modal-header">
          <h2 class="at-modal-title">Konfirmasi Reset</h2>
          <button class="at-modal-close" @click="showResetModal = false"><i class="bi bi-x-lg"></i></button>
        </div>
        <div class="at-modal-body">
          <div class="at-confirm-icon warning"><i class="bi bi-arrow-repeat"></i></div>
          <p class="at-confirm-title">Reset API Key?</p>
          <p class="at-confirm-desc">
            Anda akan mereset token <strong>{{ actionTarget?.name }}</strong>. Token lama tidak akan bisa digunakan lagi dan
            sistem eksternal harus diupdate dengan token yang baru.
          </p>
        </div>
        <div class="at-modal-footer">
          <button class="at-btn-cancel" @click="showResetModal = false" :disabled="processing">Batal</button>
          <button class="at-btn-reset-confirm" @click="resetKey" :disabled="processing">
            <i v-if="processing" class="bi bi-hourglass-split at-spin"></i>
            <i v-else class="bi bi-arrow-repeat"></i> Ya, Reset
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL KONFIRMASI HAPUS -->
    <div v-if="showDeleteModal" class="at-modal-overlay" @click.self="showDeleteModal = false">
      <div class="at-modal at-modal-sm">
        <div class="at-modal-header">
          <h2 class="at-modal-title">Konfirmasi Hapus</h2>
          <button class="at-modal-close" @click="showDeleteModal = false"><i class="bi bi-x-lg"></i></button>
        </div>
        <div class="at-modal-body">
          <div class="at-confirm-icon danger"><i class="bi bi-trash3"></i></div>
          <p class="at-confirm-title">Hapus API Key?</p>
          <p class="at-confirm-desc">
            Token <strong>{{ actionTarget?.name }}</strong> akan dihapus permanen. Sistem eksternal akan kehilangan akses
            secara instan.
          </p>
        </div>
        <div class="at-modal-footer">
          <button class="at-btn-cancel" @click="showDeleteModal = false" :disabled="processing">Batal</button>
          <button class="at-btn-hapus-confirm" @click="deleteKey" :disabled="processing">
            <i v-if="processing" class="bi bi-hourglass-split at-spin"></i>
            <i v-else class="bi bi-trash3"></i> Ya, Hapus
          </button>
        </div>
      </div>
    </div>

    <!-- TOAST -->
    <div class="at-toast-wrap" aria-live="polite">
      <div v-for="t in toasts" :key="t.id" :class="['at-toast', 'at-toast-' + t.type]">
        <i :class="['at-toast-icon bi', t.type === 'success' ? 'bi-check-circle-fill' : 'bi-x-circle-fill']"></i>
        <span>{{ t.message }}</span>
      </div>
    </div>

  </div>
</template>

<script>
import apiTabelScript from '@/scripts/dashboard/apiTabel.js'
import '@/assets/css/dashboard/apiTabel.css'

export default {
  name: 'DashboardApiTabel',
  ...apiTabelScript,
}
</script>

<style scoped>
.at-spin {
  animation: spin 0.8s linear infinite;
  display: inline-block;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>