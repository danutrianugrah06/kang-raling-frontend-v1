// FILE: src/main.js

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

// AdminLTE & Bootstrap
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'admin-lte/dist/css/adminlte.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// ── SEO: Update <title> dan <meta description> otomatis setiap pindah halaman
// Diambil dari meta yang didefinisikan di masing-masing route
router.afterEach((to) => {
  // Set title halaman
  const title = to.meta?.title
  document.title = title
    ? `${title} - Kang Raling`
    : 'Kang Raling - Kampung Ramah Lingkungan Kabupaten Garut'

  // Set meta description
  const desc = to.meta?.description
  let metaDesc = document.querySelector('meta[name="description"]')
  if (!metaDesc) {
    metaDesc = document.createElement('meta')
    metaDesc.setAttribute('name', 'description')
    document.head.appendChild(metaDesc)
  }
  metaDesc.setAttribute(
    'content',
    desc || 'Platform monitoring pengelolaan sampah berbasis masyarakat di Kabupaten Garut.'
  )
})

app.mount('#app')