import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../store/auth'

export function useLoginScript() {
  const router = useRouter()
  const authStore = useAuthStore()

  // Data form
  const form = reactive({ email: '', password: '', captcha: '' })
  const errors = reactive({ email: '', password: '', captcha: '' })
  const errorMessage = ref('')
  const isLoading = ref(false)
  const showPassword = ref(false)
  const currentYear = new Date().getFullYear() // (tidak digunakan, tapi dipertahankan)

  // CAPTCHA text yang benar
  const captchaText = ref('')

  /**
   * Generate CAPTCHA acak 6 karakter (0-9, A-Z)
   * Alasan: Mencegah brute force dan bot login
   */
  function generateCaptcha() {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    captchaText.value = result
    form.captcha = '' // Reset input captcha pengguna
  }

  // Generate CAPTCHA saat komponen dimuat
  onMounted(() => {
    generateCaptcha()
  })

  /**
   * Hapus pesan error pada field tertentu
   * Dipanggil saat user mulai mengetik ulang
   */
  function clearError(field) {
    errors[field] = ''
    errorMessage.value = ''
  }

  /**
   * Validasi form sebelum submit
   * @returns {boolean} true jika valid, false jika ada error
   */
  function validate() {
    let valid = true
    errors.email = ''
    errors.password = ''
    errors.captcha = ''

    // Validasi email
    if (!form.email) {
      errors.email = 'Email wajib diisi.'
      valid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Format email tidak valid.'
      valid = false
    }

    // Validasi password
    if (!form.password) {
      errors.password = 'Password wajib diisi.'
      valid = false
    }

    // Validasi CAPTCHA
    if (!form.captcha) {
      errors.captcha = 'Kode Captcha wajib diisi.'
      valid = false
    } else if (form.captcha.toUpperCase() !== captchaText.value) {
      errors.captcha = 'Kode Captcha tidak sesuai.'
      valid = false
      generateCaptcha() // Langsung acak ulang jika salah (tingkatkan keamanan)
    }

    return valid
  }

  /**
   * Handle submit login
   * - Validasi form
   * - Panggil store login
   * - Tangani berbagai kode error
   * - Reset CAPTCHA jika gagal
   */
  async function handleLogin() {
    errorMessage.value = ''
    if (!validate()) return

    isLoading.value = true

    try {
      await authStore.login(form.email, form.password)
      router.push('/dashboard')
    } catch (error) {
      // Tangani error dari backend
      if (error.response?.status === 401 || error.response?.status === 422) {
        errorMessage.value = 'Email atau password salah. Silakan coba lagi.'
      } else if (error.response?.status === 403) {
        errorMessage.value = 'Akun Anda tidak aktif. Hubungi administrator.'
      } else if (!navigator.onLine) {
        errorMessage.value = 'Tidak ada koneksi internet. Periksa jaringan Anda.'
      } else {
        errorMessage.value = 'Terjadi kesalahan sistem. Coba beberapa saat lagi.'
      }
      generateCaptcha() // Refresh CAPTCHA agar user harus mengisi ulang
    } finally {
      isLoading.value = false
    }
  }

  return {
    form,
    errors,
    errorMessage,
    isLoading,
    showPassword,
    currentYear,
    captchaText,
    clearError,
    handleLogin,
    generateCaptcha
  }
}