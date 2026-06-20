<template>
  <div class="us-page-content">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

    <!-- Toast Notifikasi -->
    <div class="us-toast-wrap">
      <div
        v-for="t in toasts"
        :key="t.id"
        :class="['us-toast', t.type === 'success' ? 'us-toast-success' : 'us-toast-error']"
      >
        <i :class="['us-toast-icon bi', t.type === 'success' ? 'bi-check-circle-fill' : 'bi-x-circle-fill']"></i>
        <span>{{ t.message }}</span>
      </div>
    </div>

    <!-- Page Header -->
    <div class="us-page-header">
      <div>
        <h1 class="us-page-title">Manajemen User</h1>
        <p class="us-page-subtitle">Kelola akun pengguna sistem Kang Raling</p>
      </div>
      <button class="us-btn-add" @click="openAddModal">
        <i class="bi bi-plus-lg"></i> Tambah User
      </button>
    </div>

    <!-- Table Card -->
    <div class="us-table-card">

      <!-- Toolbar: Search + Filter Role -->
      <div class="us-toolbar">
        <div class="us-search-wrap">
          <i class="bi bi-search"></i>
          <input
            v-model="searchQuery"
            type="text"
            class="us-search-input"
            placeholder="Cari nama atau email..."
            @input="onSearch"
          />
          <button v-if="searchQuery" class="us-btn-clear" @click="clearSearch" title="Hapus pencarian">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="us-filter-wrap">
          <select v-model="filterRole" class="us-filter-select" @change="onSearch">
            <option value="">Semua Role</option>
            <option v-for="role in availableRoles" :key="role.id" :value="role.name">
              {{ role.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Tabel User -->
      <div class="us-table-wrap">
        <table class="us-table">
          <thead>
            <tr>
              <th class="us-th-no">No</th>
              <th class="us-th-nama">Nama Lengkap</th>
              <th class="us-th-email">Alamat Email</th>
              <th class="us-th-role">Role Sistem</th>
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
                <td colspan="5">
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
                <td class="us-td-no">
                  {{ (currentPage - 1) * perPage + index + 1 }}
                </td>
                <td class="us-td-nama">
                  <span class="us-user-nama" style="font-weight: 600; color: #1F2937;">{{ user.nama }}</span>
                </td>
                <td class="us-td-email">
                  <span class="us-email-text">{{ user.email }}</span>
                </td>
                <td class="us-td-role">
                  <span class="us-text-role">
                    {{ user.roles && user.roles.length > 0 ? user.roles.map(r => r.name).join(', ') : 'Tidak Ada Role' }}
                  </span>
                </td>
                <td class="us-td-aksi">
                  <div class="us-aksi">
                    <button
                      class="us-btn-icon us-btn-edit"
                      title="Edit user"
                      @click="openEditModal(user)"
                    >
                      <i class="bi bi-pencil-square"></i>
                    </button>
                    <button
                      class="us-btn-icon us-btn-hapus"
                      title="Hapus user"
                      @click="confirmDelete(user)"
                    >
                      <i class="bi bi-trash3"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </template>

          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="us-pagination">
        <button class="us-page-btn" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
          <i class="bi bi-chevron-left"></i>
        </button>
        <span class="us-page-info">Halaman {{ currentPage }} dari {{ totalPages }}</span>
        <button class="us-page-btn" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>

    </div>

    <!-- MODAL TAMBAH / EDIT USER -->
    <div v-if="showModal" class="us-modal-overlay" @click.self="closeModal">
      <div class="us-modal us-modal-form"> 
        <div class="us-modal-header">
          <h5 class="us-modal-title">
            <i :class="editMode ? 'bi bi-pencil-square' : 'bi bi-person-plus-fill'"></i>
            {{ editMode ? 'Edit User' : 'Tambah User Baru' }}
          </h5>
          <button class="us-modal-close" @click="closeModal">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="us-modal-body">

          <!-- Field Nama -->
          <div class="us-form-group">
            <label class="us-form-label">Nama Lengkap <span>*</span></label>
            <input
              v-model="formModal.nama"
              type="text"
              :class="['us-form-input', { error: formErrors.nama }]"
              placeholder="Masukkan nama lengkap"
            />
            <p v-if="formErrors.nama" class="us-form-error">
              <i class="bi bi-exclamation-circle"></i>
              {{ Array.isArray(formErrors.nama) ? formErrors.nama[0] : formErrors.nama }}
            </p>
          </div>

          <!-- Field Email -->
          <div class="us-form-group">
            <label class="us-form-label">Alamat Email <span>*</span></label>
            <input
              v-model="formModal.email"
              type="email"
              :class="['us-form-input', { error: formErrors.email }]"
              placeholder="contoh@email.com"
            />
            <p v-if="formErrors.email" class="us-form-error">
              <i class="bi bi-exclamation-circle"></i>
              {{ Array.isArray(formErrors.email) ? formErrors.email[0] : formErrors.email }}
            </p>
          </div>

          <!-- Field Password (wajib saat tambah, opsional saat edit) -->
          <div class="us-form-group">
            <label class="us-form-label">
              Password
              <span v-if="!editMode">*</span>
              <span v-else style="color:#9CA3AF; font-weight:normal; font-size:12px; margin-left: 4px;">(kosongkan jika tidak diubah)</span>
            </label>
            <div class="us-input-wrap">
              <input
                v-model="formModal.password"
                :type="showPwModal ? 'text' : 'password'"
                :class="['us-form-input', { error: formErrors.password }]"
                placeholder="Minimal 8 karakter"
              />
              <button type="button" class="us-toggle-pw" @click="showPwModal = !showPwModal">
                <i :class="showPwModal ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
            <p v-if="formErrors.password" class="us-form-error">
              <i class="bi bi-exclamation-circle"></i>
              {{ Array.isArray(formErrors.password) ? formErrors.password[0] : formErrors.password }}
            </p>
          </div>

          <!-- Field Role (multi-select dynamic) -->
          <div class="us-form-group">
            <label class="us-form-label">Role Sistem <span>*</span></label>
            <div
              v-for="(role, index) in formModal.roles"
              :key="index"
              class="us-dynamic-role-row"
            >
              <select
                v-model="formModal.roles[index]"
                :class="['us-form-select', { error: formErrors.roles && index === 0 }]"
                style="flex: 1;"
              >
                <option value="">-- Pilih Role --</option>
                <option
                  v-for="r in availableRoles"
                  :key="r.id"
                  :value="r.name"
                  :disabled="isRoleDisabled(r.name, index)"
                >
                  {{ r.name }}
                </option>
              </select>
              <button
                v-if="formModal.roles.length > 1"
                type="button"
                class="us-btn-remove-role"
                @click="removeRoleField(index)"
                title="Hapus role ini"
              >
                <i class="bi bi-dash-circle"></i>
              </button>
            </div>
            <button
              type="button"
              class="us-btn-add-role"
              @click="addRoleField"
              v-if="formModal.roles.length < availableRoles.length"
            >
              <i class="bi bi-plus-circle"></i> Tambah Role Lain
            </button>
            <p v-if="formErrors.roles" class="us-form-error">
              <i class="bi bi-exclamation-circle"></i>
              {{ Array.isArray(formErrors.roles) ? formErrors.roles[0] : formErrors.roles }}
            </p>
          </div>

        </div>
        <div class="us-modal-footer">
          <button class="us-btn-cancel" @click="closeModal" :disabled="savingModal">
            Batal
          </button>
          <button class="us-btn-save" @click="submitModal" :disabled="savingModal">
            <i v-if="savingModal" class="bi bi-arrow-repeat us-spin"></i>
            <i v-else :class="editMode ? 'bi bi-check-lg' : 'bi bi-plus-lg'"></i>
            {{ savingModal ? 'Menyimpan...' : (editMode ? 'Simpan Perubahan' : 'Tambah User') }}
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL KONFIRMASI HAPUS -->
    <div v-if="showDeleteModal" class="us-modal-overlay" @click.self="showDeleteModal = false">
      <div class="us-modal us-modal-sm">
        <div class="us-modal-header">
          <h2 class="us-modal-title">Konfirmasi Hapus</h2>
          <button class="us-modal-close" @click="showDeleteModal = false">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="us-modal-body">
          <div class="us-confirm-icon"><i class="bi bi-trash3"></i></div>
          <p class="us-confirm-title">Hapus Akun User?</p>
          <p class="us-confirm-desc">
            Anda akan menghapus akun <strong>{{ deleteTarget?.nama }}</strong>. Semua data yang terkait dengan akun ini akan ikut terhapus secara permanen.
          </p>
        </div>
        <div class="us-modal-footer">
          <button class="us-btn-cancel" @click="showDeleteModal = false" :disabled="deleting">
            Batal
          </button>
          <button class="us-btn-hapus-confirm" @click="deleteUser" :disabled="deleting">
            <i v-if="deleting" class="bi bi-arrow-repeat us-spin"></i>
            <i v-else class="bi bi-trash3"></i>
            {{ deleting ? 'Menghapus...' : 'Ya, Hapus' }}
          </button>
        </div>
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