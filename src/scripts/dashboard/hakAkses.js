import { ref, computed, onMounted } from 'vue'
import api from '@/services/api.js'

export function useKelolaHakAkses() {
    // =============================================
    // STATE
    // =============================================
    const roles            = ref([])
    const allPermissions   = ref([])
    const selectedRoleId   = ref(null)
    const selectedRole     = ref(null)
    const activePermissions = ref([])

    const isLoadingRoles   = ref(false)
    const isLoadingPerms   = ref(false)
    const isSubmitting     = ref(false)
    const isAddingPerm     = ref(false)

    const toast = ref({ show: false, message: '', type: 'success' })

    const showAddPermModal    = ref(false)
    const showDeletePermModal = ref(false)
    const selectedPerm        = ref(null)

    const newPermName  = ref('')
    const newPermError = ref('')

    // =============================================
    // TOAST
    // =============================================
    function showToast(message, type = 'success') {
        toast.value = { show: true, message, type }
        setTimeout(() => { toast.value.show = false }, 3500)
    }

    // =============================================
    // COMPUTED
    // =============================================
    const availablePermissions = computed(() => {
        if (!selectedRole.value) return []
        return allPermissions.value.filter(
            p => !activePermissions.value.includes(p.name)
        )
    })

    const groupedActivePermissions = computed(() => {
        const groups = {}
        for (const permName of activePermissions.value) {
            const [prefix] = permName.split('.')
            if (!groups[prefix]) groups[prefix] = []
            groups[prefix].push(permName)
        }
        return groups
    })

    const totalActivePerms = computed(() => activePermissions.value.length)

    // =============================================
    // FETCH ROLES
    // =============================================
    async function fetchRoles() {
        isLoadingRoles.value = true
        try {
            const res = await api.get('/roles')
            roles.value = res.data.data
            // Otomatis pilih role pertama
            if (roles.value.length > 0 && !selectedRoleId.value) {
                selectRole(roles.value[0])
            }
        } catch {
            showToast('Gagal memuat daftar role.', 'error')
        } finally {
            isLoadingRoles.value = false
        }
    }

    // =============================================
    // FETCH ALL PERMISSIONS
    // =============================================
    async function fetchAllPermissions() {
        try {
            const res = await api.get('/permissions')
            allPermissions.value = res.data.data
        } catch {
            showToast('Gagal memuat daftar permission.', 'error')
        }
    }

    // =============================================
    // PILIH ROLE
    // =============================================
    function selectRole(role) {
        selectedRoleId.value    = role.id
        selectedRole.value      = role
        activePermissions.value = [...role.permissions]
    }

    // =============================================
    // TOGGLE PERMISSION
    // =============================================
    function togglePermission(permName) {
        const idx = activePermissions.value.indexOf(permName)
        if (idx === -1) {
            activePermissions.value.push(permName)
        } else {
            activePermissions.value.splice(idx, 1)
        }
    }

    function hasPermission(permName) {
        return activePermissions.value.includes(permName)
    }

    // =============================================
    // SIMPAN PERUBAHAN
    // =============================================
    async function savePermissions() {
        if (!selectedRole.value) return
        isSubmitting.value = true
        try {
            await api.post(`/roles/${selectedRole.value.id}/sync-permissions`, {
                permissions: activePermissions.value,
            })
            showToast(`Hak akses role "${selectedRole.value.name}" berhasil disimpan.`)
            await fetchRoles()
            
            const updated = roles.value.find(r => r.id === selectedRole.value.id)
            if (updated) selectRole(updated)
        } catch (err) {
            showToast('Gagal menyimpan hak akses. Coba lagi.', 'error')
        } finally {
            isSubmitting.value = false
        }
    }

    // =============================================
    // TAMBAH PERMISSION
    // =============================================
    function openAddPermModal() {
        newPermName.value  = ''
        newPermError.value = ''
        showAddPermModal.value = true
    }

    function closeAddPermModal() {
        showAddPermModal.value = false
    }

    async function submitNewPermission() {
        if (!newPermName.value.trim()) {
            newPermError.value = 'Nama permission wajib diisi.'
            return
        }
        if (!newPermName.value.includes('.')) {
            newPermError.value = 'Gunakan format "aksi.resource", contoh: kelola.laporan'
            return
        }

        isAddingPerm.value = true
        try {
            await api.post('/permissions', { name: newPermName.value.trim() })
            showToast(`Permission "${newPermName.value}" berhasil dibuat.`)
            closeAddPermModal()
            await fetchAllPermissions()
        } catch (err) {
            if (err.response?.status === 422) {
                newPermError.value = err.response.data.errors?.name?.[0] ?? 'Nama sudah digunakan.'
            } else {
                showToast('Gagal membuat permission baru.', 'error')
            }
        } finally {
            isAddingPerm.value = false
        }
    }

    // =============================================
    // HAPUS PERMISSION
    // =============================================
    function openDeletePermModal(perm) {
        selectedPerm.value        = perm
        showDeletePermModal.value = true
    }

    function closeDeletePermModal() {
        showDeletePermModal.value = false
        selectedPerm.value        = null
    }

    async function confirmDeletePerm() {
        if (!selectedPerm.value) return
        isSubmitting.value = true
        try {
            await api.delete(`/permissions/${selectedPerm.value.id}`)
            showToast(`Permission "${selectedPerm.value.name}" berhasil dihapus.`)
            closeDeletePermModal()
            await fetchAllPermissions()
            
            const idx = activePermissions.value.indexOf(selectedPerm.value.name)
            if (idx !== -1) activePermissions.value.splice(idx, 1)
        } catch {
            showToast('Gagal menghapus permission.', 'error')
            closeDeletePermModal()
        } finally {
            isSubmitting.value = false
        }
    }

    // =============================================
    // HELPER UI
    // =============================================
    function getGroupLabel(group) {
        const map = {
            'input':     'Input Data',
            'kelola':    'Kelola Konten',
            'verifikasi':'Verifikasi Data',
            'manajemen': 'Manajemen Sistem',
            'view':      'Lihat & Akses',
            'cetak':     'Cetak & Ekspor',
            'generate':  'Integrasi API',
        }
        return map[group] ?? group.charAt(0).toUpperCase() + group.slice(1)
    }

    function getGroupIcon(group) {
        const map = {
            'input':     'bi-database-add',
            'kelola':    'bi-pencil-square',
            'verifikasi':'bi-patch-check',
            'manajemen': 'bi-people',
            'view':      'bi-eye',
            'cetak':     'bi-printer',
            'generate':  'bi-braces',
        }
        return map[group] ?? 'bi-folder2-open'
    }

    // =============================================
    // INIT
    // =============================================
    onMounted(async () => {
        await Promise.all([fetchRoles(), fetchAllPermissions()])
    })

    return {
        roles,
        allPermissions,
        selectedRoleId,
        selectedRole,
        activePermissions,
        isLoadingRoles,
        isLoadingPerms,
        isSubmitting,
        isAddingPerm,
        toast,
        showAddPermModal,
        showDeletePermModal,
        selectedPerm,
        newPermName,
        newPermError,
        availablePermissions,
        groupedActivePermissions,
        totalActivePerms,
        fetchRoles,
        selectRole,
        togglePermission,
        hasPermission,
        savePermissions,
        openAddPermModal,
        closeAddPermModal,
        submitNewPermission,
        openDeletePermModal,
        closeDeletePermModal,
        confirmDeletePerm,
        getGroupLabel,
        getGroupIcon,
    }
}