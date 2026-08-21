<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import AppNavbar from '@/components/AppNavbar.vue'
import type { NavLink } from '@/types/nav'
import { getTeams } from '@/api/teams'
import { useSportStore } from '@/stores/sport'

import { ref, computed, onMounted, watch } from 'vue'

const sportStore = useSportStore()
const teams = ref<Array<{ league: string; slug: string }>>([])

async function loadTeams() {
  try {
    const data = await getTeams(sportStore.activeSport)
    teams.value = (data || []).map((t) => ({ league: String(t.league), slug: String(t.league).toLowerCase() }))
  } catch (e) {
    console.error('Failed to load teams for nav:', e)
  }
}

onMounted(async () => {
  await sportStore.fetchSports()
  await loadTeams()
})

// Reload teams when sport changes
watch(() => sportStore.activeSport, () => loadTeams())

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
    { label: 'Swag', to: '/swag' },
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
