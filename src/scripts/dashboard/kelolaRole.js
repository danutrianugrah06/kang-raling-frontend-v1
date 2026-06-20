import { ref, computed, onMounted } from 'vue'
import api from '@/services/api.js'

export function useKelolaRole() {
    // STATE
    const roles        = ref([])
    const isLoading    = ref(false)
    const isSubmitting = ref(false)
    const toast        = ref({ show: false, message: '', type: 'success' })
    const showModal    = ref(false)
    const showDeleteModal = ref(false)
    const isEditMode   = ref(false)
    const selectedRole = ref(null)

    const form = ref({
        name: '',
    })

    const formErrors = ref({})

    // COMPUTED
    const protectedRoles = ['']

    const totalRoles = computed(() => roles.value.length)

    const totalPermissions = computed(() => {
        const all = roles.value.flatMap(r => r.permissions)
        return [...new Set(all)].length
    })

    // TOAST
    function showToast(message, type = 'success') {
        toast.value = { show: true, message, type }
        setTimeout(() => { toast.value.show = false }, 3500)
    }

    // FETCH
    async function fetchRoles() {
        isLoading.value = true
        try {
            const res = await api.get('/roles')
            roles.value = res.data.data
        } catch (err) {
            showToast('Gagal memuat data role.', 'error')
        } finally {
            isLoading.value = false
        }
    }

    // MODAL TAMBAH
    function openAddModal() {
        isEditMode.value  = false
        selectedRole.value = null
        form.value        = { name: '' }
        formErrors.value  = {}
        showModal.value   = true
    }

    function openEditModal(role) {
        if (protectedRoles.includes(role.name)) {
            showToast(`Role "${role.name}" adalah role sistem dan tidak bisa diubah.`, 'warning')
            return
        }
        isEditMode.value   = true
        selectedRole.value = role
        form.value         = { name: role.name }
        formErrors.value   = {}
        showModal.value    = true
    }

    function closeModal() {
        showModal.value  = false
        formErrors.value = {}
    }

    // MODAL HAPUS
    function openDeleteModal(role) {
        if (protectedRoles.includes(role.name)) {
            showToast(`Role "${role.name}" adalah role sistem dan tidak bisa dihapus.`, 'warning')
            return
        }
        selectedRole.value   = role
        showDeleteModal.value = true
    }

    function closeDeleteModal() {
        showDeleteModal.value = false
        selectedRole.value    = null
    }

    // SUBMIT TAMBAH / EDIT
    async function submitForm() {
        if (!form.value.name.trim()) {
            formErrors.value = { name: 'Nama role wajib diisi.' }
            return
        }

        isSubmitting.value = true
        formErrors.value   = {}

        try {
            if (isEditMode.value) {
                await api.put(`/roles/${selectedRole.value.id}`, form.value)
                showToast(`Role "${form.value.name}" berhasil diperbarui.`)
            } else {
                await api.post('/roles', form.value)
                showToast(`Role "${form.value.name}" berhasil ditambahkan.`)
            }
            closeModal()
            await fetchRoles()
        } catch (err) {
            if (err.response?.status === 422) {
                formErrors.value = err.response.data.errors ?? {}
                showToast('Periksa kembali input Anda.', 'error')
            } else if (err.response?.status === 403) {
                showToast(err.response.data.message, 'warning')
                closeModal()
            } else {
                showToast('Terjadi kesalahan. Coba lagi.', 'error')
            }
        } finally {
            isSubmitting.value = false
        }
    }

    // HAPUS
    async function confirmDelete() {
        if (!selectedRole.value) return
        isSubmitting.value = true
        try {
            await api.delete(`/roles/${selectedRole.value.id}`)
            showToast(`Role "${selectedRole.value.name}" berhasil dihapus.`)
            closeDeleteModal()
            await fetchRoles()
        } catch (err) {
            if (err.response?.status === 403) {
                showToast(err.response.data.message, 'warning')
            } else {
                showToast('Gagal menghapus role.', 'error')
            }
            closeDeleteModal()
        } finally {
            isSubmitting.value = false
        }
    }

    function isProtected(roleName) {
        return protectedRoles.includes(roleName)
    }

    // INIT
    onMounted(fetchRoles)

    return {
        roles,
        isLoading,
        isSubmitting,
        toast,
        showModal,
        showDeleteModal,
        isEditMode,
        selectedRole,
        form,
        formErrors,
        totalRoles,
        totalPermissions,
        openAddModal,
        openEditModal,
        closeModal,
        openDeleteModal,
        closeDeleteModal,
        submitForm,
        confirmDelete,
        isProtected,
    }
}