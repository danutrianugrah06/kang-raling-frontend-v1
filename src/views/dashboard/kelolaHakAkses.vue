<template>
  <div class="ha-page-wrapper">

    <!-- Toast Notifikasi -->
    <div v-if="toast.show" :class="['ha-toast', `ha-toast-${toast.type}`]">
      <i :class="toast.type === 'success' ? 'bi bi-check-circle-fill' :
                 toast.type === 'warning' ? 'bi bi-exclamation-triangle-fill' :
                 'bi bi-x-circle-fill'"></i>
      {{ toast.message }}
    </div>

    <!-- Page Header -->
    <div class="ha-page-header">
      <div class="ha-page-title">
        <h4>Mengelola Hak Akses</h4>
        <p>Atur permission (hak akses) untuk masing-masing role di sistem.</p>
      </div>
      <button class="ha-btn ha-btn-primary" @click="openAddPermModal">
        <i class="bi bi-plus-lg"></i> Buat Permission Baru
      </button>
    </div>

    <!-- Layout Split: Kiri (Daftar Role) + Kanan (Editor Permission) -->
    <div class="ha-layout">

      <!-- Panel Kiri: Daftar Role -->
      <div class="ha-role-panel">
        <div class="ha-role-panel-header">
          <h6>Daftar Role</h6>
        </div>

        <!-- Skeleton Role -->
        <div v-if="isLoadingRoles" class="p-3">
          <div v-for="n in 4" :key="n" class="ha-skeleton-role">
            <div class="ha-skeleton-line ha-skel-role-name"></div>
            <div class="ha-skeleton-line ha-skel-role-count"></div>
          </div>
        </div>

        <!-- Daftar Role -->
        <ul v-else class="ha-role-list">
          <li
            v-for="role in roles"
            :key="role.id"
            :class="['ha-role-item', selectedRoleId === role.id ? 'active' : '']"
            @click="selectRole(role)"
          >
            <div class="ha-role-item-info">
              <span class="ha-role-item-name">{{ role.name }}</span>
              <span class="ha-role-item-count">{{ role.permissions.length }} permission aktif</span>
            </div>
            <i class="bi bi-chevron-right ha-role-item-arrow"></i>
          </li>
        </ul>
      </div>

      <!-- Panel Kanan: Editor Permission -->
      <div class="ha-editor-panel">

        <!-- Empty State: Belum pilih role -->
        <div v-if="!selectedRole" class="ha-empty-editor">
          <i class="bi bi-hand-index-thumb"></i>
          <p>Pilih role di sebelah kiri untuk mulai mengatur hak aksesnya.</p>
        </div>

        <!-- Editor Permission -->
        <template v-else>
          <div class="ha-editor-header">
            <div class="ha-editor-title">
              <h5>Hak Akses: {{ selectedRole.name }}</h5>
              <p>{{ totalActivePerms }} hak akses aktif - centang permission yang diizinkan lalu klik Simpan.</p>
            </div>
            <div class="ha-editor-actions">
              <button
                class="ha-btn ha-btn-success"
                :disabled="isSubmitting"
                @click="savePermissions"
              >
                <i v-if="isSubmitting" class="bi bi-arrow-repeat spin"></i>
                <i v-else class="bi bi-check-lg"></i>
                {{ isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan' }}
              </button>
            </div>
          </div>

          <div class="ha-editor-body">

            <!-- Skeleton Permission -->
            <div v-if="isLoadingPerms">
              <div v-for="n in 3" :key="n" class="mb-4">
                <div class="ha-skeleton-line ha-skel-group-title"></div>
                <div class="ha-perm-grid">
                  <div v-for="m in 3" :key="m" class="ha-skeleton-line ha-skel-perm-item"></div>
                </div>
              </div>
            </div>

            <!-- Daftar Permission per Group -->
            <template v-else>
              <div
                v-for="(permsInGroup, groupKey) in groupedAllPermissions"
                :key="groupKey"
                class="ha-perm-group"
              >
                <div class="ha-perm-group-header">
                  <i :class="['bi', getGroupIcon(groupKey)]"></i>
                  <span>{{ getGroupLabel(groupKey) }}</span>
                  <span class="ha-perm-group-count">
                    {{ permsInGroup.filter(p => hasPermission(p.name)).length }} / {{ permsInGroup.length }}
                  </span>
                </div>
                <div class="ha-perm-grid">
                  <div
                    v-for="perm in permsInGroup"
                    :key="perm.id"
                    :class="['ha-perm-item', hasPermission(perm.name) ? 'active' : '']"
                    @click="togglePermission(perm.name)"
                  >
                    <div class="ha-perm-checkbox">
                      <i v-if="hasPermission(perm.name)" class="bi bi-check-lg"></i>
                    </div>
                    <span class="ha-perm-name">{{ perm.name }}</span>
                  </div>
                </div>
              </div>
            </template>

          </div>
        </template>

      </div>
    </div>

    <!--  SEMUA PERMISSION TERSEDIA -->
    <div class="ha-all-perms-section">
      <div class="ha-all-perms-header">
        <h6>Semua Permission Tersedia ({{ allPermissions.length }})</h6>
      </div>
      <div class="ha-all-perms-body">
        <div v-if="allPermissions.length === 0" class="ha-empty-editor">
          <i class="bi bi-inbox"></i>
          <p>Belum ada permission yang terdaftar di database.</p>
        </div>
        <div v-else class="ha-perm-table-grid">
          <div
            v-for="perm in allPermissions"
            :key="perm.id"
            class="ha-perm-table-item"
          >
            <span class="ha-perm-table-name">
              {{ perm.name }}
            </span>
            <button
              class="ha-perm-table-del"
              title="Hapus permission"
              @click="openDeletePermModal(perm)"
            >
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL TAMBAH PERMISSION BARU -->
    <div v-if="showAddPermModal" class="ha-modal-overlay" @click.self="closeAddPermModal">
      <div class="ha-modal">
        <div class="ha-modal-header">
          <h5>Buat Permission Baru</h5>
          <button class="ha-modal-close" @click="closeAddPermModal">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="ha-modal-body">
          <div class="ha-form-group">
            <label>Nama Permission <span>*</span></label>
            <input
              v-model="newPermName"
              type="text"
              :class="['ha-form-control', newPermError ? 'is-invalid' : '']"
              placeholder="Contoh: kelola.laporan"
              @keyup.enter="submitNewPermission"
            />
            <div v-if="newPermError" class="ha-invalid-feedback">
              <i class="bi bi-exclamation-circle"></i> {{ newPermError }}
            </div>
          </div>
          <div class="ha-alert-info">
            <i class="bi bi-info-circle-fill"></i>
            <p>Gunakan format <strong>aksi.resource</strong> dengan huruf kecil. Contoh: <code>input.data-sampah</code>, <code>cetak.laporan</code>.</p>
          </div>
        </div>
        <div class="ha-modal-footer">
          <button class="ha-btn ha-btn-secondary" @click="closeAddPermModal" :disabled="isAddingPerm">
            Batal
          </button>
          <button class="ha-btn ha-btn-primary" @click="submitNewPermission" :disabled="isAddingPerm">
            <i v-if="isAddingPerm" class="bi bi-arrow-repeat spin"></i>
            <i v-else class="bi bi-check-lg"></i>
            {{ isAddingPerm ? 'Menyimpan...' : 'Simpan Permission' }}
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL KONFIRMASI HAPUS PERMISSION -->
    <div v-if="showDeletePermModal" class="ha-modal-overlay" @click.self="closeDeletePermModal">
      <div class="ha-modal ha-modal-sm">
        
        <div class="ha-modal-header">
          <h5>Konfirmasi Hapus</h5>
          <button class="ha-modal-close" @click="closeDeletePermModal">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="ha-modal-body ha-delete-body">
          <i class="bi bi-trash ha-delete-icon"></i>
          <p class="ha-delete-text">Anda akan menghapus permission:</p>
          <p class="ha-delete-perm-name">"{{ selectedPerm?.name }}"</p>
          <p class="ha-delete-desc">
            Permission ini akan dicabut dari semua role yang<br>memilikinya secara permanen.
          </p>
        </div>
        <div class="ha-modal-footer ha-delete-footer">
          <button class="ha-btn ha-btn-secondary ha-delete-cancel" @click="closeDeletePermModal" :disabled="isSubmitting">
            Batal
          </button>
          <button class="ha-btn ha-btn-danger ha-delete-confirm" @click="confirmDeletePerm" :disabled="isSubmitting">
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
import { computed } from 'vue'
import { useKelolaHakAkses } from '@/scripts/dashboard/HakAkses.js'
import '@/assets/css/dashboard/HakAkses.css'

export default {
  name: 'KelolaHakAkses',
  setup() {
    const composable = useKelolaHakAkses()

    // Grouping permission berdasarkan prefix (sebelum titik)
    const groupedAllPermissions = computed(() => {
      const groups = {}
      for (const perm of composable.allPermissions.value) {
        const [prefix] = perm.name.split('.')
        if (!groups[prefix]) groups[prefix] = []
        groups[prefix].push(perm)
      }
      return groups
    })

    return {
      ...composable,
      groupedAllPermissions,
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