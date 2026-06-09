import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // Ini kamusnya: kalau ada simbol '@', arahkan ke folder './src'
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    open: true 
  }
})