import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/pages/HomePage.vue'),
    },
    {
      path: '/teams/:ageGroup',
      component: () => import('@/pages/TeamPage.vue'),
    },
    {
      path: '/schedule',
      component: () => import('@/pages/SchedulePage.vue'),
    },
    {
      path: '/stats/:category',
      component: () => import('@/pages/StatsPage.vue'),
    },
    {
      path: '/news',
      component: () => import('@/pages/NewsPage.vue'),
    },
    {
      path: '/swag',
      component: () => import('@/pages/SponsorsPage.vue'),
    },
    {
      path: '/players/:slug',
      component: () => import('@/pages/PlayerProfilePage.vue'),
    },
    {
      path: '/admin/login',
      component: () => import('@/pages/LoginPage.vue'),
    },
    {
      path: '/admin',
      component: () => import('@/pages/AdminPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/players',
      component: () => import('@/pages/Admin.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/account',
      component: () => import('@/pages/AccountPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/users',
      component: () => import('@/pages/UsersPage.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
  ],
})

router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return

  const auth = useAuthStore()
  // httpOnly cookie: only the server can tell us whether the session is valid.
  await auth.ensureLoaded()

  if (!auth.isAuthenticated) {
    return { path: '/admin/login', query: { redirect: to.fullPath } }
  }

  // Editors get sent back rather than shown a page they cannot use. The API
  // enforces this too - hiding a route is presentation, not security.
  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return '/admin/players'
  }
})

export default router
