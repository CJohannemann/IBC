<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import AppNavbar from '@/components/AppNavbar.vue'
import type { NavLink } from '@/types/nav'

const navLinks: NavLink[] = [
  {
    label: 'Teams',
    children: [
      { label: '14U', to: '/teams/14u' },
      { label: '10U', to: '/teams/10u' },
    ],
  },
  { label: 'Schedule',   to: '/schedule'   },
  {
    label: 'Statistics',
    children: [
      { label: 'Batting Leaders',  to: '/stats/batting'  },
      { label: 'Pitching Leaders', to: '/stats/pitching' },
      { label: 'Team Stats',       to: '/stats/team'     },
    ],
  },
  { label: 'News',     to: '/news'     },
  { label: 'Sponsors', to: '/sponsors' },
  { label: '__spacer__' },
  { label: 'Admin', to: '/admin', highlight: true },
]
</script>

<template>
  <div class="min-h-screen flex flex-col bg-ibc-cream">
    <AppHeader />
    <AppNavbar :links="navLinks" />
    <main class="flex-1">
      <RouterView />
    </main>
  </div>
</template>
