<template>
  <div class="login-wrapper">
    <Navbar />

    <main class="login-main">
      <div class="login-container">

        <!-- SISI KIRI: Branding dan pesan selamat datang -->
        <div class="login-left">
          <div class="login-left-overlay"></div>
          <div class="login-left-content">
            <div class="login-left-icon">
              <div class="login-left-icon-bg">
                <svg viewBox="0 0 24 24" fill="none" width="40" height="40">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="white" stroke-width="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="white" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
              <div class="login-left-icon-dot"></div>
            </div>
            <h2 class="login-left-title">Selamat Datang Kembali!</h2>
            <p class="login-left-subtitle">Masuk ke dashboard Kang Raling untuk mengelola konten dan data</p>
          </div>
          <div class="login-left-circle login-left-circle-1"></div>
          <div class="login-left-circle login-left-circle-2"></div>
        </div>

        <!-- SISI KANAN: Form Login -->
        <div class="login-right">
          <div class="login-form-wrap">

            <div class="login-brand">
              <img src="../../assets/icons/logoKangRaling.png" alt="Logo Kang Raling" class="login-brand-img" />
            </div>

            <h1 class="login-form-title">Login</h1>
            <p class="login-form-subtitle">Silakan masuk dengan akun anda</p>

            <!-- Alert error global -->
            <div v-if="errorMessage" class="alert-error" role="alert">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="15" height="15">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {{ errorMessage }}
            </div>

            <form @submit.prevent="handleLogin" novalidate>

              <!-- Field Email -->
              <div class="form-field" :class="{ 'form-field-error': errors.email }">
                <label for="email" class="form-field-label">
                  <i class="bi bi-envelope"></i> Email
                </label>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  placeholder="Masukkan alamat email yang terdaftar"
                  autocomplete="email"
                  :disabled="isLoading"
                  @input="clearError('email')"
                />
                <span v-if="errors.email" class="form-field-error-msg">{{ errors.email }}</span>
              </div>

              <!-- Field Password dengan toggle -->
              <div class="form-field" :class="{ 'form-field-error': errors.password }">
                <label for="password" class="form-field-label">
                  <i class="bi bi-lock"></i> Password
                </label>
                <div class="form-field-input-wrap">
                  <input
                    id="password"
                    v-model="form.password"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="Masukkan password yang sesuai"
                    autocomplete="current-password"
                    :disabled="isLoading"
                    @input="clearError('password')"
                  />
                  <button type="button" class="form-field-eye-btn" @click="showPassword = !showPassword">
                    <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                  </button>
                </div>
                <span v-if="errors.password" class="form-field-error-msg">{{ errors.password }}</span>
              </div>

              <!-- Field CAPTCHA -->
              <div class="form-field" :class="{ 'form-field-error': errors.captcha }">
                <label for="captcha" class="form-field-label">
                  <i class="bi bi-shield-check"></i> Kode Verifikasi
                </label>
                <div class="captcha-display-wrap">
                  <div class="captcha-display" title="Kode Captcha">
                    <span class="captcha-text">{{ captchaText }}</span>
                  </div>
                  <button type="button" class="captcha-refresh-btn" @click="generateCaptcha" title="Acak ulang kode" :disabled="isLoading">
                    <i class="bi bi-arrow-clockwise"></i>
                  </button>
                </div>
                <!-- Class captcha-input menggantikan inline style text-transform: uppercase -->
                <input
                  id="captcha"
                  v-model="form.captcha"
                  type="text"
                  placeholder="Ketik 6 karakter kode di atas"
                  autocomplete="off"
                  :disabled="isLoading"
                  @input="clearError('captcha')"
                  class="captcha-input"
                />
                <span v-if="errors.captcha" class="form-field-error-msg">{{ errors.captcha }}</span>
              </div>

              <!-- Tombol Submit -->
              <button type="submit" class="btn-login" :disabled="isLoading">
                <template v-if="!isLoading">
                  Masuk <i class="bi bi-arrow-right"></i>
                </template>
                <template v-else>
                  <i class="bi bi-arrow-repeat spin"></i> Memproses...
                </template>
              </button>

            </form>

            <!-- Informasi lupa akun -->
            <div class="forgot-section">
              <p class="forgot-title">Lupa akun?</p>
              <p class="forgot-text">
                Silakan hubungi Admin Sistem Kang Raling atau Koordinator Program untuk memulihkan akun Fasilitator.
              </p>
            </div>

          </div>
        </div>

      </div>
    </main>

    <Footer />
  </div>
</template>

<script>
import { useLoginScript } from '../../scripts/auth/login.js'
import Navbar from '../../components/Navbar.vue'
import Footer from '../../components/Footer.vue'

export default {
  name: 'LoginView',
  components: { Navbar, Footer },
  setup() {
    return useLoginScript()
  }
}
</script>

<style>
@import '../../assets/css/auth/login.css';
</style>