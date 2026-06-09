<template>
  <div class="ak-page-content">

    <div class="ak-page-header">
      <div>
        <h1 class="ak-page-title">Pengaturan Akun</h1>
        <p class="ak-page-subtitle">Kelola informasi profil dan keamanan akun Anda</p>
      </div>
    </div>

    <!-- SKELETON LOADER -->
    <div v-if="loadingProfile" class="ak-grid">
      <div class="ak-card" v-for="n in 2" :key="'skel-'+n">
        <div class="ak-card-body">
          <!-- Inline style skeleton diganti dengan class ak-skel-* -->
          <div class="ak-skel ak-skel-title"></div>
          <div class="ak-skel ak-skel-field"></div>
          <div class="ak-skel ak-skel-field"></div>
          <div class="ak-skel ak-skel-button"></div>
        </div>
      </div>
    </div>

    <!-- KONTEN UTAMA (setelah loading) -->
    <div v-else class="ak-grid">

      <!-- CARD: Informasi Profil -->
      <div class="ak-card">
        <div class="ak-card-header">
          <i class="bi bi-person-circle"></i> Informasi Profil
        </div>
        <div class="ak-card-body">

          <div class="ak-form-group">
            <label class="ak-form-label" for="nama">Nama Lengkap</label>
            <input
              id="nama"
              v-model="formProfile.nama"
              type="text"
              :class="['ak-form-input', { error: errors.nama }]"
              placeholder="Masukkan nama lengkap"
            />
            <p v-if="errors.nama" class="ak-form-error">
              <i class="bi bi-exclamation-circle"></i> {{ errors.nama[0] }}
            </p>
          </div>

          <div class="ak-form-group">
            <label class="ak-form-label" for="email">Alamat Email</label>
            <input
              id="email"
              v-model="formProfile.email"
              type="email"
              :class="['ak-form-input', { error: errors.email }]"
              placeholder="Masukkan email"
            />
            <p v-if="errors.email" class="ak-form-error">
              <i class="bi bi-exclamation-circle"></i> {{ errors.email[0] }}
            </p>
          </div>

          <button
            class="ak-btn-save"
            :disabled="savingProfile"
            @click="updateProfile"
          >
            <i v-if="savingProfile" class="bi bi-arrow-repeat ak-spin"></i>
            <i v-else class="bi bi-check-lg"></i>
            {{ savingProfile ? 'Menyimpan...' : 'Simpan Perubahan' }}
          </button>
        </div>
      </div>

      <!-- CARD: Ganti Password -->
      <div class="ak-card">
        <div class="ak-card-header">
          <i class="bi bi-shield-lock"></i> Ganti Password
        </div>
        <div class="ak-card-body">

          <div class="ak-form-group">
            <label class="ak-form-label" for="password-baru">Password Baru</label>
            <div class="ak-input-wrap">
              <input
                id="password-baru"
                v-model="formPassword.password_baru"
                :type="showPasswordBaru ? 'text' : 'password'"
                :class="['ak-form-input', { error: errors.password_baru }]"
                placeholder="Minimal 8 karakter"
              />
              <button
                type="button"
                class="ak-toggle-pw"
                @click="showPasswordBaru = !showPasswordBaru"
                title="Tampilkan/Sembunyikan"
              >
                <i :class="showPasswordBaru ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
            <p v-if="errors.password_baru" class="ak-form-error">
              <i class="bi bi-exclamation-circle"></i> {{ errors.password_baru[0] }}
            </p>
          </div>

          <div class="ak-form-group">
            <label class="ak-form-label" for="konfirmasi">Konfirmasi Password Baru</label>
            <div class="ak-input-wrap">
              <input
                id="konfirmasi"
                v-model="formPassword.konfirmasi"
                :type="showKonfirmasi ? 'text' : 'password'"
                :class="['ak-form-input', { error: errors.konfirmasi }]"
                placeholder="Ulangi password baru"
              />
              <button
                type="button"
                class="ak-toggle-pw"
                @click="showKonfirmasi = !showKonfirmasi"
                title="Tampilkan/Sembunyikan"
              >
                <i :class="showKonfirmasi ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
            <p v-if="errors.konfirmasi" class="ak-form-error">
              <i class="bi bi-exclamation-circle"></i> {{ errors.konfirmasi[0] }}
            </p>
          </div>

          <button
            class="ak-btn-save"
            :disabled="savingPassword"
            @click="updatePassword"
          >
            <i v-if="savingPassword" class="bi bi-arrow-repeat ak-spin"></i>
            <i v-else class="bi bi-key"></i>
            {{ savingPassword ? 'Menyimpan...' : 'Ganti Password' }}
          </button>
        </div>
      </div>

    </div>

    <!-- TOAST NOTIFIKASI -->
    <div class="ak-toast-wrap" aria-live="polite">
      <div
        v-for="t in toasts"
        :key="t.id"
        :class="['ak-toast', 'ak-toast-' + t.type]"
      >
        <i :class="['ak-toast-icon bi', toastIcon(t.type)]"></i>
        <span>{{ t.message }}</span>
      </div>
    </div>

  </div>
</template>

<script>
import akunScript from '@/scripts/dashboard/akun.js'
import '@/assets/css/dashboard/akun.css'

export default {
  name: 'DashboardAkun',
  ...akunScript,
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