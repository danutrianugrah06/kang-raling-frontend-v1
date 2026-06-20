<template>
  <div class="kr-page-wrapper">

    <!-- Toast Notifikasi -->
    <div v-if="toast.show" :class="['kr-toast', `kr-toast-${toast.type}`]">
      <i :class="toast.type === 'success' ? 'bi bi-check-circle-fill' :
                 toast.type === 'warning' ? 'bi bi-exclamation-triangle-fill' :
                 'bi bi-x-circle-fill'"></i>
      {{ toast.message }}
    </div>

    <!-- Page Header -->
    <div class="kr-page-header">
      <div class="kr-page-title">
        <h4>Mengelola Role</h4>
        <p>Kelola daftar role dan lihat hak akses yang dimiliki setiap role.</p>
      </div>
      <button class="kr-btn kr-btn-primary" @click="openAddModal">
        <i class="bi bi-plus-lg"></i> Tambah Role Baru
      </button>
    </div>

    <!-- Stats: Total Role & Total Permission -->
    <div class="kr-stats-grid">
      <div class="kr-stat-card" style="--kr-color: #4CAF50; --kr-bg: #f0fdf4;">
        <div class="kr-stat-icon"><i class="bi bi-shield-check"></i></div>
        <div class="kr-stat-info">
          <p>Total Role</p>
          <h3>{{ totalRoles }}</h3>
        </div>
      </div>
      <div class="kr-stat-card" style="--kr-color: #F57C00; --kr-bg: #fff7ed;">
        <div class="kr-stat-icon"><i class="bi bi-key"></i></div>
        <div class="kr-stat-info">
          <p>Total Permission</p>
          <h3>{{ totalPermissions }}</h3>
        </div>
      </div>
    </div>

    <!-- Skeleton Loader -->
    <div v-if="isLoading" class="kr-skeleton-grid">
      <div v-for="n in 4" :key="n" class="kr-skeleton-card">
        <div class="kr-skeleton-line kr-skeleton-line-md mb-3"></div>
        <div class="kr-skeleton-line kr-skeleton-line-lg"></div>
        <div class="kr-skeleton-line kr-skeleton-line-sm"></div>
        <div class="kr-skeleton-line kr-skeleton-line-lg"></div>
      </div>
    </div>

    <!-- Empty State (belum ada role) -->
    <div v-else-if="!isLoading && roles.length === 0" class="kr-empty-state">
      <i class="bi bi-shield-x"></i>
      <p>Belum ada role yang tersedia.</p>
      <button class="kr-btn kr-btn-primary" @click="openAddModal">
        <i class="bi bi-plus-lg"></i> Tambah Role Pertama
      </button>
    </div>

    <!-- Role Cards Grid -->
    <div v-else class="kr-roles-grid">
      <div v-for="role in roles" :key="role.id" class="kr-role-card">
        
        <!-- Card Header: Nama Role + Tombol Aksi -->
        <div class="kr-role-card-header">
          <div class="kr-role-card-title">
            <span>{{ role.name }}</span>
          </div>
          <div class="kr-role-card-actions">
            <button
              class="kr-btn-icon kr-btn-edit"
              :disabled="isProtected(role.name)"
              :title="isProtected(role.name) ? 'Role sistem tidak bisa diedit' : 'Edit nama role'"
              @click="openEditModal(role)"
            >
              <i class="bi bi-pencil"></i>
            </button>
            <button
              class="kr-btn-icon kr-btn-delete"
              :disabled="isProtected(role.name)"
              :title="isProtected(role.name) ? 'Role sistem tidak bisa dihapus' : 'Hapus role'"
              @click="openDeleteModal(role)"
            >
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>

        <!-- Card Body: Daftar Permission (format kalimat) -->
        <div class="kr-role-card-body">
          <div class="kr-permission-label">
            Hak Akses ({{ role.permissions.length }})
          </div>
          <div class="kr-permission-text">
            <span v-if="role.permissions.length > 0">
              {{ role.permissions.join(', ') }}
            </span>
            <span v-else class="text-muted small">
              Belum ada hak akses
            </span>
          </div>
        </div>

        <!-- Card Footer: Tanggal Dibuat + Label Role Sistem -->
        <div class="kr-role-card-footer">
          <span class="kr-footer-meta">
            <i class="bi bi-calendar3"></i>
            {{ new Date(role.created_at).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' }) }}
          </span>
          <span v-if="isProtected(role.name)" class="kr-protected-text">
            <i class="bi bi-lock-fill"></i> Role Sistem
          </span>
        </div>
      </div>
    </div>

    <!-- MODAL TAMBAH / EDIT NAMA ROLE -->
    <div v-if="showModal" class="kr-modal-overlay" @click.self="closeModal">
      <div class="kr-modal">
        <div class="kr-modal-header">
          <h5>{{ isEditMode ? 'Edit Nama Role' : 'Tambah Role Baru' }}</h5>
          <button class="kr-modal-close" @click="closeModal">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="kr-modal-body">
          <div class="kr-form-group">
            <label for="roleName">Nama Role <span>*</span></label>
            <input
              id="roleName"
              v-model="form.name"
              type="text"
              :class="['kr-form-control', formErrors.name ? 'is-invalid' : '']"
              placeholder="Contoh: Supervisor, Auditor..."
              @keyup.enter="submitForm"
            />
            <div v-if="formErrors.name" class="kr-invalid-feedback">
              <i class="bi bi-exclamation-circle"></i>
              {{ Array.isArray(formErrors.name) ? formErrors.name[0] : formErrors.name }}
            </div>
          </div>
        </div>
        <div class="kr-modal-footer">
          <button class="kr-btn kr-btn-secondary" @click="closeModal" :disabled="isSubmitting">
            Batal
          </button>
          <button class="kr-btn kr-btn-primary" @click="submitForm" :disabled="isSubmitting">
            <i v-if="isSubmitting" class="bi bi-arrow-repeat spin"></i>
            <i v-else class="bi bi-check-lg"></i>
            {{ isSubmitting ? 'Menyimpan...' : 'Simpan Data' }}
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL KONFIRMASI HAPUS ROLE -->
    <div v-if="showDeleteModal" class="kr-modal-overlay" @click.self="closeDeleteModal">
      <div class="kr-modal" style="max-width: 420px;">
        
        <div class="kr-modal-header">
          <h5>Konfirmasi Hapus</h5>
          <button class="kr-modal-close" @click="closeDeleteModal">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        
        <div class="kr-modal-body" style="padding-top: 30px;">
          <div class="kr-confirm-icon">
            <i class="bi bi-trash"></i>
          </div>
          <h5 class="kr-confirm-title">Hapus Role?</h5>
          <p class="kr-confirm-desc">
            Apakah Anda yakin ingin menghapus role <strong>"{{ selectedRole?.name }}"</strong>?<br>
            Semua user yang memiliki role ini akan kehilangan hak aksesnya. Tindakan ini tidak bisa dibatalkan.
          </p>
        </div>
        
        <div class="kr-modal-footer" style="justify-content: center; border-top: none; padding-bottom: 30px;">
          <button class="kr-btn kr-btn-secondary" style="padding: 10px 24px;" @click="closeDeleteModal" :disabled="isSubmitting">
            Batal
          </button>
          <button class="kr-btn kr-btn-danger" style="padding: 10px 24px;" @click="confirmDelete" :disabled="isSubmitting">
            <i v-if="isSubmitting" class="bi bi-arrow-repeat spin"></i>
            <i v-else class="bi bi-trash"></i>
            Ya, Hapus
          </button>
        </div>
        
      </div>
    </div>

  </div>
</template>

<script>
import { useKelolaRole } from '@/scripts/dashboard/kelolaRole.js'
import '@/assets/css/dashboard/kelolaRole.css'

export default {
  name: 'KelolaRole',
  setup() {
    return {
      ...useKelolaRole()
    }
  }
}
</script>

<style scoped>
.spin {
  animation: spin 0.8s linear infinite;
  display: inline-block;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
</style>