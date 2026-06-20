import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../store/auth";

const routes = [
  // ══════════════════════════════
  // AUTH
  // ══════════════════════════════
  {
    path: "/login",
    name: "Login",
    component: () => import("../views/auth/Login.vue"),
    meta: {
      requiresGuest: true,
      title: "Login",
      description:
        "Masuk ke dashboard Kang Raling untuk mengelola data sampah dan program lingkungan hidup.",
    },
  },

  // ══════════════════════════════
  // PUBLIK
  // ══════════════════════════════
  {
    path: "/",
    name: "Beranda",
    component: () => import("../views/publik/Beranda.vue"),
    meta: {
      title: "Beranda",
      description:
        "Kang Raling - Platform monitoring pengelolaan sampah mandiri berbasis masyarakat di Kabupaten Garut.",
    },
  },
  {
    path: "/media",
    name: "Media",
    component: () => import("@/views/publik/Media.vue"),
    meta: {
      title: "Media & Informasi",
      description:
        "Ikuti perkembangan terbaru, berita, dan dokumentasi kegiatan pengelolaan lingkungan hidup Kabupaten Garut.",
    },
  },
  {
    path: "/artikel/:slug",
    name: "ArtikelDetail",
    component: () => import("@/views/publik/ArtikelDetail.vue"),
    meta: {
      title: "Artikel",
      description:
        "Baca artikel dan berita terbaru seputar pengelolaan lingkungan hidup di Kabupaten Garut.",
    },
  },
  {
    path: "/galeri/:slug",
    name: "GaleriDetail",
    component: () => import("@/views/publik/GaleriDetail.vue"),
    meta: {
      title: "Galeri",
      description:
        "Dokumentasi foto kegiatan pengelolaan sampah dan lingkungan hidup Kabupaten Garut.",
    },
  },
  {
    path: "/desa-binaan",
    name: "DesaBinaan",
    component: () => import("@/views/publik/DesaBinaan.vue"),
    meta: {
      title: "Desa Binaan",
      description:
        "Mengenal desa-desa yang berkomitmen dalam program pengelolaan sampah mandiri bersama DLH Kabupaten Garut.",
    },
  },
  {
    path: "/desa-binaan/:slug",
    name: "DesaDetail",
    component: () => import("@/views/publik/DesaDetail.vue"),
    meta: {
      title: "Detail Desa",
      description:
        "Informasi lengkap profil TPS 3R, statistik, dan kegiatan pengelolaan sampah desa binaan Kang Raling.",
    },
  },
  {
    path: "/edukasi",
    name: "Edukasi",
    component: () => import("@/views/publik/Edukasi.vue"),
    meta: {
      title: "Edukasi",
      description:
        "Pelajari cara memilah dan mengelola sampah melalui modul edukasi dan video dari Kang Raling.",
    },
  },
  {
    path: "/data-sampah",
    name: "DataSampah",
    component: () => import("@/views/publik/DataSampah.vue"),
    meta: {
      title: "Data Sampah",
      description:
        "Visualisasi dan laporan komprehensif data pengelolaan sampah dari seluruh TPS 3R di Kabupaten Garut.",
    },
  },
  {
    path: "/tentang-kami",
    name: "TentangKami",
    component: () => import("@/views/publik/TentangKami.vue"),
    meta: {
      title: "Tentang Kami",
      description:
        "Kenali lebih dekat program Kang Raling - inisiatif DLH Kabupaten Garut untuk pengelolaan sampah mandiri.",
    },
  },

  {
    path: "/faq",
    name: "Faq",
    component: () => import("@/views/publik/Faq.vue"),
    meta: {
      title: "FAQ",
      description:
        "Temukan jawaban atas pertanyaan umum seputar program Kang Raling dan pengelolaan sampah di Kabupaten Garut.",
    },
  },

  // ══════════════════════════════
  // DASHBOARD (Dilindungi RBAC Dinamis)
  // ══════════════════════════════

  {
    path: "/dashboard",
    component: () => import("../layouts/DashboardLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        name: "Dashboard",
        component: () => import("../views/dashboard/Index.vue"),
        meta: {
          requiresAuth: true,
          title: "Dashboard",
          description: "Dashboard pengelolaan data sampah Kang Raling.",
        },
      },
      {
        path: "artikel",
        name: "DashboardArtikel",
        component: () => import("../views/dashboard/Artikel.vue"),
        meta: { requiresAuth: true, permission: "kelola.artikel", title: "Kelola Artikel" },
      },
      {
        path: "galeri",
        name: "DashboardGaleri",
        component: () => import("../views/dashboard/Galeri.vue"),
        meta: { requiresAuth: true, permission: "kelola.galeri", title: "Kelola Galeri" },
      },
      {
        path: "desa-binaan",
        name: "DashboardDesa",
        component: () => import("../views/dashboard/DesaBinaan.vue"),
        meta: { requiresAuth: true, permission: "kelola.desa-binaan", title: "Kelola Desa Binaan" },
      },
      {
        path: "edukasi",
        name: "DashboardEdukasi",
        component: () => import("../views/dashboard/Edukasi.vue"),
        meta: { requiresAuth: true, permission: "kelola.edukasi", title: "Kelola Edukasi" },
      },
      {
        path: "jenis-sampah",
        name: "DashboardJenisSampah",
        component: () => import("../views/dashboard/JenisSampah.vue"),
        meta: { requiresAuth: true, permission: "kelola.jenis-sampah", title: "Kelola Jenis Sampah" },
      },
      {
        path: "pengelolaan",
        name: "DashboardPengelolaan",
        component: () => import("../views/dashboard/Pengelolaan.vue"),
        meta: { requiresAuth: true, permission: "kelola.jenis-pengelolaan", title: "Kelola Pengelolaan" },
      },
      {
        path: "input-sampah",
        name: "DashboardInputSampah",
        component: () => import("../views/dashboard/InputSampah.vue"),
        meta: { requiresAuth: true, permission: "input.data-sampah", title: "Form Input Data Sampah" },
      },
      {
        path: "input-pengelolaan",
        name: "DashboardInputPengelolaan",
        component: () => import("../views/dashboard/InputPengelolaan.vue"),
        meta: { requiresAuth: true, permission: "input.data-pengelolaan", title: "Form Input Pengelolaan" },
      },
      {
        path: "verifikasi",
        name: "DashboardVerifikasi",
        component: () => import("../views/dashboard/Verifikasi.vue"),
        meta: {
          requiresAuth: true,
          permission: "verifikasi.data-sampah",
          title: "Verifikasi Data Sampah",
        },
      },
      {
        path: "users",
        name: "DashboardUsers",
        component: () => import("../views/dashboard/Users.vue"),
        meta: {
          requiresAuth: true,
          permission: "manajemen.user",
          title: "Manajemen User",
        },
      },
      {
        path: "roles",
        name: "KelolaRole",
        component: () => import("@/views/dashboard/KelolaRole.vue"),
        meta: { requiresAuth: true, permission: "kelola.role-permission", title: "Mengelola Role" },
      },
      {
        path: "permissions",
        name: "KelolaHakAkses",
        component: () => import("@/views/dashboard/KelolaHakAkses.vue"),
        meta: { requiresAuth: true, permission: "kelola.role-permission", title: "Mengelola Hak Akses" },
      },
      {
        path: "activity-log",
        name: "DashboardActivityLog",
        component: () => import("../views/dashboard/ActivityLog.vue"),
        meta: {
          requiresAuth: true,
          permission: "kelola.api-key", // Menyesuaikan dengan logika di Sidebar sebelumnya
          title: "Activity Log",
        },
      },
      {
        path: "api-tabel",
        name: "DashboardApiTabel",
        component: () => import("../views/dashboard/ApiTabel.vue"),
        meta: {
          requiresAuth: true,
          permission: "kelola.tabel-generate",
          title: "Tabel Generate",
        },
      },
      {
        path: "api-keys",
        name: "DashboardApiKeys",
        component: () => import("../views/dashboard/ApiKeys.vue"),
        meta: {
          requiresAuth: true,
          permission: "generate.api-token",
          title: "API Keys",
        },
      },
      {
        path: "laporan",
        component: () => import("@/views/dashboard/Laporan.vue"),
        meta: { requiresAuth: true, permission: "cetak.laporan", title: "Cetak Laporan" },
      },
      {
        // Rute ini bebas untuk semua role yang bisa login
        path: "akun",
        name: "DashboardAkun",
        component: () => import("../views/dashboard/Akun.vue"),
        meta: { requiresAuth: true, title: "Pengaturan Akun" },
      },
      {
        // Rute ini bebas untuk semua role yang bisa login
        path: "kontak",
        component: () => import("@/views/dashboard/Kontak.vue"),
        meta: { requiresAuth: true, title: "Hubungi Developer" },
      },
    ],
  },

  // ══════════════════════════════
  // 404
  // ══════════════════════════════
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("../views/NotFound.vue"),
    meta: {
      title: "Halaman Tidak Ditemukan",
      description: "Halaman yang kamu cari tidak tersedia di Kang Raling.",
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  // Scroll ke atas setiap pindah halaman
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    if (to.hash) return { el: to.hash, behavior: "smooth" };
    return { top: 0, behavior: "smooth" };
  },
});

// ── ROUTE GUARD (SATPAM RBAC DINAMIS) ──
router.beforeEach((to, from, next) => {
  const auth = useAuthStore();

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return next("/login");
  }

  if (to.meta.requiresGuest && auth.isLoggedIn) {
    return next("/dashboard");
  }

  // Jika route butuh permission spesifik, cek dari role yang aktif
  if (to.meta.permission && auth.user) {
    const activeRoleData = auth.user.roles?.find(r => r.name === auth.currentRole);
    const hasPerm = activeRoleData?.permissions?.includes(to.meta.permission);

    // Jika tidak punya izin, tendang balik ke dashboard utama
    if (!hasPerm) {
      return next("/dashboard");
    }
  }

  next();
});

export default router;