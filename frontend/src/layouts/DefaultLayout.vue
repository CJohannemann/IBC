<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import AppNavbar from '@/components/AppNavbar.vue'
import type { NavLink } from '@/types/nav'

import { ref, computed, onMounted } from 'vue'

const teams = ref<Array<{ league: string; slug: string }>>([])

onMounted(async () => {
  try {
    const res = await fetch('/api/teams')
    if (res.ok) {
      const data = await res.json()
      teams.value = (data || []).map((t: any) => ({ league: String(t.league), slug: String(t.league).toLowerCase() }))
    }
  } catch (e) {
    console.error('Failed to load teams for nav:', e)
  }
})

const navLinks = computed<NavLink[]>(() => {
  const teamChildren = teams.value.length
    ? teams.value.map(t => ({ label: t.league, to: `/teams/${t.slug}` }))
    : [
        { label: '14U', to: '/teams/14u' },
        { label: '10U', to: '/teams/10u' },
      ]

  return [
    { label: 'Teams', children: teamChildren },
    { label: 'Schedule', to: '/schedule' },
    {
      label: 'Statistics',
      children: [
        { label: 'Batting Leaders', to: '/stats/batting' },
        { label: 'Pitching Leaders', to: '/stats/pitching' },
        { label: 'Team Stats', to: '/stats/team' },
      ],
    },
    { label: 'News', to: '/news' },
    { label: 'Sponsors', to: '/sponsors' },
    { label: '__spacer__' },
  ]
})
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
