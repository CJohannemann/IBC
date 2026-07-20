import { createRouter, createWebHistory } from 'vue-router'

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
      path: '/sponsors',
      component: () => import('@/pages/SponsorsPage.vue'),
    },
    {
      path: '/players/:slug',
      component: () => import('@/pages/PlayerProfilePage.vue'),
    },
    {
      path: '/admin',
      component: () => import('@/pages/AdminPage.vue'),
    },
  ],
})

export default router
