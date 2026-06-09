<template>
  <div class="ak-page-content">
    <link
      href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />

    <!-- Page Header -->
    <div class="ak-page-header">
      <div>
        <h1 class="ak-page-title">Manajemen API Keys</h1>
        <p class="ak-page-subtitle">Kelola token akses untuk integrasi data dengan pihak eksternal</p>
      </div>
      <button class="ak-btn-add" @click="openCreateModal" :disabled="loading">
        <i class="bi bi-plus-lg"></i> Buat Token Baru
      </button>
    </div>

    <!-- Table Card -->
    <div class="ak-table-card">
      
      <!-- Toolbar (Search Bar) -->
      <div class="ak-toolbar">
        <div class="ak-search-wrap">
          <i class="bi bi-search"></i>
          <input
            v-model="searchQuery"
            type="text"
            class="ak-search-input"
            placeholder="Cari nama token..."
            @input="onSearch"
          />
        </div>
      </div>

      <!-- Table -->
      <div class="ak-table-wrap">
        <table class="ak-table">
          <thead>
            <tr>
              <!-- Class lebar kolom (menggantikan inline style width) -->
              <th class="ak-th-no">No</th>
              <th class="ak-th-nama">Nama Token</th>
              <th class="ak-th-token">Token Key</th>
              <th class="ak-th-tanggal">Dibuat Pada</th>
            </tr>
          </thead>
          <tbody>
            
            <!-- Skeleton Loader -->
            <template v-if="loading">
              <tr v-for="n in 3" :key="'skel-'+n">
                <td><div class="ak-skel ak-skel-no"></div></td>
                <td><div class="ak-skel ak-skel-nama"></div></td>
                <td><div class="ak-skel ak-skel-token"></div></td>
                <td><div class="ak-skel ak-skel-tanggal"></div></td>
              </tr>
            </template>

            <!-- Empty State -->
            <template v-else-if="filteredKeys.length === 0">
              <tr>
                <td colspan="4">
                  <div class="ak-empty">
                    <div class="ak-empty-icon"><i class="bi bi-key"></i></div>
                    <p class="ak-empty-title">Belum ada API Key</p>
                    <p class="ak-empty-desc">Buat token baru untuk mengaktifkan integrasi data.</p>
                  </div>
                </td>
              </tr>
            </template>

            <!-- Data Rows -->
            <template v-else>
              <tr v-for="(item, index) in filteredKeys" :key="item.id" class="ak-data-row">
                <td class="ak-td-center">{{ index + 1 }}</td>
                <td>
                  <p class="ak-td-nama">{{ item.name }}</p>
                  <p class="ak-td-sub">Oleh: {{ item.generated_by_name || 'Admin' }}</p>
                </td>
                <td>
                  <div class="ak-key-wrap">
                    <code class="ak-key-code">{{ visibleKeys[item.id] ? item.key : maskKey(item.key) }}</code>
                    <button class="ak-key-action" @click="toggleVisible(item.id)" :title="visibleKeys[item.id] ? 'Sembunyikan' : 'Tampilkan'">
                      <i :class="visibleKeys[item.id] ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                    </button>
                    <button class="ak-key-action" @click="copyKey(item)" title="Salin Token">
                      <i :class="copiedId === item.id ? 'bi bi-check2' : 'bi bi-clipboard'"></i>
                    </button>
                  </div>
                </td>
                <td>
                  <span class="ak-td-date">{{ formatDate(item.created_at) }}</span>
                </td>
              </tr>
            </template>

          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL BUAT TOKEN BARU -->
    <div v-if="showCreateModal" class="ak-modal-overlay" @click.self="closeCreateModal">
      <!-- Class ak-modal-create menggantikan inline style max-width:400px; -->
      <div class="ak-modal ak-modal-create">
        <div class="ak-modal-header">
          <h2 class="ak-modal-title">Buat Token Baru</h2>
          <button class="ak-modal-close" @click="closeCreateModal"><i class="bi bi-x-lg"></i></button>
        </div>
        <div class="ak-modal-body">
          <!-- Class ak-form-group-form mengatur margin-bottom:0 (menggantikan inline style) -->
          <div class="ak-form-group ak-form-group-form">
            <label class="ak-form-label" for="ak-name">Nama Token <span>*</span></label>
            <input
              id="ak-name"
              v-model="formCreate.name"
              type="text"
              :class="['ak-form-input', { error: formErrors.name }]"
              placeholder="Masukkan nama integrasi..."
              @keyup.enter="submitCreate"
            />
            <p v-if="formErrors.name" class="ak-form-error"><i class="bi bi-exclamation-circle"></i> {{ formErrors.name[0] }}</p>
          </div>
        </div>
        <div class="ak-modal-footer">
          <button class="ak-btn-cancel" @click="closeCreateModal" :disabled="saving">Batal</button>
          <button class="ak-btn-save" @click="submitCreate" :disabled="saving">
            <i v-if="saving" class="bi bi-arrow-repeat ak-spin"></i>
            <i v-else class="bi bi-check-lg"></i>
            {{ saving ? 'Memproses...' : 'Generate Token' }}
          </button>
        </div>
      </div>
    </div>

    <!-- TOAST -->
    <div class="ak-toast-wrap" aria-live="polite">
      <div v-for="t in toasts" :key="t.id" :class="['ak-toast', 'ak-toast-' + t.type]">
        <i :class="['ak-toast-icon bi', t.type === 'success' ? 'bi-check-circle-fill' : 'bi-x-circle-fill']"></i>
        <span>{{ t.message }}</span>
      </div>
    </div>

  </div>
</template>

<script>
import apiKeysScript from '@/scripts/dashboard/apiKeys.js'
import '@/assets/css/dashboard/apiKeys.css'

export default {
  name: 'DashboardApiKeys',
  ...apiKeysScript,
}
</script>

<style scoped>
.ak-spin { 
  animation: spin 0.8s linear infinite; 
  display: inline-block; 
}
@keyframes spin { 
  to { transform: rotate(360deg); } 
}
</style>