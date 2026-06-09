<template>
  <div class="us-page-content">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

    <div class="us-page-header">
      <div>
        <h1 class="us-page-title">Manajemen User</h1>
        <p class="us-page-subtitle">Kelola akun pengguna sistem Kang Raling</p>
      </div>
      <button class="us-btn-add" @click="openAddModal">
        <i class="bi bi-plus-lg"></i> Tambah User
      </button>
    </div>

    <div class="us-table-card">

      <div class="us-toolbar">
        <div class="us-search-wrap">
          <i class="bi bi-search"></i>
          <input v-model="searchQuery" type="text" class="us-search-input" placeholder="Cari nama atau email..." @input="onSearch" />
          <button v-if="searchQuery" class="us-btn-clear" @click="clearSearch" title="Hapus pencarian">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="us-filter-wrap">
          <select v-model="filterRole" class="us-filter-select" @change="onSearch">
            <option value="">Semua Role</option>
            <option value="administrator">Administrator</option>
            <option value="fasilitator">Fasilitator</option>
          </select>
        </div>
      </div>

      <div class="us-table-wrap">
        <table class="us-table">
          <thead>
            <tr>
              <!-- Class lebar kolom (menggantikan inline style width) -->
              <th class="us-th-no">No</th>
              <th class="us-th-nama">Nama Lengkap</th>
              <th class="us-th-email">Alamat Email</th>
              <th class="us-th-role">Role</th>
              <th class="us-th-status">Status Akun</th>
              <th class="us-th-aksi">Aksi</th>
            </tr>
          </thead>
          <tbody>

            <!-- Skeleton Loader -->
            <template v-if="loading">
              <tr v-for="n in 5" :key="'skel-' + n">
                <td><div class="us-skel us-skel-no"></div></td>
                <td><div class="us-skel us-skel-nama"></div></td>
                <td><div class="us-skel us-skel-email"></div></td>
                <td><div class="us-skel us-skel-badge"></div></td>
                <td><div class="us-skel us-skel-status"></div></td>
                <td>
                  <div class="us-aksi">
                    <div class="us-skel us-skel-btn"></div>
                    <div class="us-skel us-skel-btn"></div>
                  </div>
                </td>
              </tr>
            </template>

            <!-- Empty State -->
            <template v-else-if="users.length === 0">
              <tr>
                <td colspan="6">
                  <div class="us-empty">
                    <div class="us-empty-icon"><i class="bi bi-people"></i></div>
                    <p class="us-empty-title">Tidak ada user ditemukan</p>
                    <p class="us-empty-desc">Coba sesuaikan kata kunci pencarian atau filter role.</p>
                  </div>
                </td>
              </tr>
            </template>

            <!-- Data Rows -->
            <template v-else>
              <tr v-for="(user, index) in users" :key="user.id" class="us-data-row">
                <td class="us-td-id">{{ (currentPage - 1) * perPage + index + 1 }}</td>
                <td><p class="us-td-nama">{{ user.nama }}</p></td>
                <td class="us-td-email">{{ user.email }}</td>
                <td>
                  <span :class="['us-badge-role', user.role === 'administrator' ? 'us-role-admin' : 'us-role-fasil']">
                    {{ user.role === 'administrator' ? 'Administrator' : 'Fasilitator' }}
                  </span>
                </td>
                <td>
                  <select :value="user.is_active ? 'aktif' : 'nonaktif'" @change="toggleStatus(user)"
                    class="us-form-select us-select-status"
                    :class="user.is_active ? 'status-aktif' : 'status-nonaktif'">
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </td>
                <td>
                  <div class="us-aksi">
                    <button class="us-btn-icon us-btn-edit" @click="openEditModal(user)" title="Edit Password">
                      <i class="bi bi-key"></i>
                    </button>
                    <button class="us-btn-icon us-btn-hapus" @click="confirmDelete(user)" title="Hapus User">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </template>

          </tbody>
        </table>
      </div>

      <div v-if="totalPages > 1" class="us-table-footer">
        <p class="us-pagination-info">Menampilkan halaman {{ currentPage }} dari {{ totalPages }}</p>
        <div class="us-pagination">
          <button class="us-page-btn" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
            <i class="bi bi-chevron-left"></i>
          </button>
          <button v-for="p in pageNumbers" :key="p" class="us-page-btn"
            :class="{ active: p === currentPage, 'is-ellipsis': p === '...' }" :disabled="p === '...'"
            @click="p !== '...' && goToPage(p)">
            {{ p }}
          </button>
          <button class="us-page-btn" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL FORM (TAMBAH / EDIT PASSWORD) -->
    <div v-if="showModal" class="us-modal-overlay" @click.self="closeModal">
      <!-- Class us-modal-form menggantikan inline style max-width:500px; -->
      <div class="us-modal us-modal-form">
        <div class="us-modal-header">
          <h2 class="us-modal-title">
            {{ editMode ? 'Ganti Password User' : 'Tambah User Baru' }}
          </h2>
          <button class="us-modal-close" @click="closeModal"><i class="bi bi-x-lg"></i></button>
        </div>
        <div class="us-modal-body">

          <template v-if="!editMode">
            <div class="us-form-group">
              <label class="us-form-label" for="nama">Nama Lengkap <span>*</span></label>
              <input id="nama" v-model="formModal.nama" type="text"
                :class="['us-form-input', { error: formErrors.nama }]" placeholder="Masukkan nama" />
              <p v-if="formErrors.nama" class="us-form-error"><i class="bi bi-exclamation-circle"></i> {{ formErrors.nama[0] }}</p>
            </div>

            <div class="us-form-group">
              <label class="us-form-label" for="email">Alamat Email <span>*</span></label>
              <input id="email" v-model="formModal.email" type="email"
                :class="['us-form-input', { error: formErrors.email }]" placeholder="contoh@gmail.com" />
              <p v-if="formErrors.email" class="us-form-error"><i class="bi bi-exclamation-circle"></i> {{ formErrors.email[0] }}</p>
            </div>

            <div class="us-form-group">
              <label class="us-form-label" for="role">Role <span>*</span></label>
              <select id="role" v-model="formModal.role" :class="['us-form-select', { error: formErrors.role }]">
                <option value="" disabled>Pilih Role</option>
                <option value="fasilitator">Fasilitator</option>
                <option value="administrator">Administrator</option>
              </select>
              <p v-if="formErrors.role" class="us-form-error"><i class="bi bi-exclamation-circle"></i> {{ formErrors.role[0] }}</p>
            </div>
          </template>

          <template v-else>
            <div class="us-alert-box">
              <i class="bi bi-info-circle-fill"></i> Anda sedang mengubah password untuk akun <strong>{{ formModal.nama }}</strong>.
            </div>
          </template>

          <div class="us-form-group">
            <label class="us-form-label" for="password">Password {{ editMode ? 'Baru' : '' }} <span>*</span></label>
            <div class="us-input-wrap">
              <input id="password" v-model="formModal.password" :type="showPwModal ? 'text' : 'password'"
                :class="['us-form-input', { error: formErrors.password }]" placeholder="Minimal 8 karakter" />
              <button type="button" class="us-toggle-pw" @click="showPwModal = !showPwModal">
                <i :class="showPwModal ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
            <p v-if="formErrors.password" class="us-form-error"><i class="bi bi-exclamation-circle"></i> {{ formErrors.password[0] }}</p>
          </div>

        </div>
        <div class="us-modal-footer">
          <button class="us-btn-cancel" @click="closeModal" :disabled="savingModal">Batal</button>
          <button class="us-btn-save" @click="submitModal" :disabled="savingModal">
            <i v-if="savingModal" class="bi bi-arrow-repeat us-spin"></i>
            <i v-else class="bi bi-check-lg"></i>
            {{ savingModal ? 'Menyimpan...' : 'Simpan Data' }}
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL KONFIRMASI HAPUS -->
    <div v-if="showDeleteModal" class="us-modal-overlay" @click.self="showDeleteModal = false">
      <div class="us-modal us-modal-sm">
        <div class="us-modal-header">
          <h2 class="us-modal-title">Konfirmasi Hapus</h2>
          <button class="us-modal-close" @click="showDeleteModal = false"><i class="bi bi-x-lg"></i></button>
        </div>
        <div class="us-modal-body">
          <div class="us-confirm-icon"><i class="bi bi-trash3"></i></div>
          <p class="us-confirm-title">Hapus Akun User?</p>
          <p class="us-confirm-desc">
            Anda akan menghapus akun <strong>{{ deleteTarget?.nama }}</strong>. Tindakan ini tidak bisa dibatalkan.
          </p>
        </div>
        <div class="us-modal-footer">
          <button class="us-btn-cancel" @click="showDeleteModal = false" :disabled="deleting">Batal</button>
          <button class="us-btn-hapus-confirm" @click="deleteUser" :disabled="deleting">
            <i v-if="deleting" class="bi bi-arrow-repeat us-spin"></i>
            <i v-else class="bi bi-trash3"></i> Ya, Hapus
          </button>
        </div>
      </div>
    </div>

    <!-- TOAST NOTIFIKASI -->
    <div class="us-toast-wrap" aria-live="polite">
      <div v-for="t in toasts" :key="t.id" :class="['us-toast', 'us-toast-' + t.type]">
        <i :class="['us-toast-icon bi', t.type === 'success' ? 'bi-check-circle-fill' : 'bi-x-circle-fill']"></i>
        <span>{{ t.message }}</span>
      </div>
    </div>

  </div>
</template>

<script>
import usersScript from '@/scripts/dashboard/users.js'
import '@/assets/css/dashboard/users.css'

export default {
  name: 'DashboardUsers',
  ...usersScript,
  computed: {
    pageNumbers() {
      const pages = []
      const total = this.totalPages
      const current = this.currentPage
      if (total <= 7) {
        for (let i = 1; i <= total; i++) pages.push(i)
      } else {
        pages.push(1)
        if (current > 3) pages.push('...')
        for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i)
        if (current < total - 2) pages.push('...')
        pages.push(total)
      }
      return pages
    },
  },
}
</script>

<style scoped>
.us-spin {
  animation: spin 0.8s linear infinite;
  display: inline-block;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>