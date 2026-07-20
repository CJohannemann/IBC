<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// Mock team data - replace with API call later
const teamData: Record<string, any> = {
  '10u': {
    name: '10U Team',
    ageGroup: '10U',
    coach: 'Derek Uhl',
    assistantCoaches: [
      {asstCoach: 'Bryan Kenton'},
      {asstCoach: 'Mike Collins'},
      {asstCoach: 'Kevin Hutchins'},
      {asstCoach: 'Chris Johannemann'},
    ],
    roster: [
      { number: 1, name: 'Player One', position: 'Pitcher' },
      { number: 2, name: 'Player Two', position: 'Catcher' },
      { number: 3, name: 'Player Three', position: 'Outfield' },
    ],
    wins: 0,
    losses: 0,
  },
  '14u': {
    name: '14U Team',
    ageGroup: '14U',
    coach: 'Darren Farrar',
    assistantCoaches: [
      {asstCoach: 'Dwight Wood'},
      {asstCoach: 'Mike Collins'},
      {asstCoach: 'Adam Grubbs'},
  ],
    roster: [
      { number: 1, name: 'Player One', position: 'Pitcher' },
      { number: 2, name: 'Player Two', position: 'Catcher' },
      { number: 3, name: 'Player Three', position: 'Outfield' },
    ],
    wins: 18,
    losses: 2,
  },
}

const team = computed(() => {
  const ageGroup = (route.params.ageGroup as string).toLowerCase()
  return teamData[ageGroup] || teamData['10u']
})
</script>

<template>
  <div class="min-h-screen bg-ibc-cream">
    <!-- Team Header -->
    <div class="bg-ibc-navy text-white py-12 px-8">
      <div class="max-w-6xl mx-auto">
        <h1 class="text-4xl font-black uppercase tracking-widest mb-2">{{ team.name }}</h1>
        <p class="text-ibc-gold text-lg font-bold">{{ team.wins }}-{{ team.losses }} Record</p>
      </div>
    </div>

    <!-- Team Details -->
    <div class="max-w-6xl mx-auto px-8 py-12">
      <!-- Coach Section -->
      <div class="mb-12">
        <h2 class="text-2xl font-black text-ibc-navy uppercase tracking-wide mb-4">Head Coach</h2>
        <div class="bg-white p-6 rounded-lg shadow max-w-sm">
          <p class="text-lg font-semibold text-ibc-navy">{{ team.coach }}</p>
        </div>
      </div>

      <div class="mb-12">
        <h4 class="text-2xl font-black text-ibc-navy uppercase tracking-wide mb-4">Assistant Coaches</h4>
        <div class="grid gap-4 max-w-sm">
          <div
            v-for="assistCoach in team.assistantCoaches"
            :key="assistCoach.asstCoach"
            class="bg-white p-6 rounded-lg shadow">
            <p class="text-lg font-semibold text-ibc-navy">{{ assistCoach.asstCoach }}</p>
          </div>
        </div>
      </div>

      <!-- Roster Section -->
      <div>
        <h2 class="text-2xl font-black text-ibc-navy uppercase tracking-wide mb-4">Roster</h2>
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="player in team.roster"
            :key="player.number"
            class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <div class="flex items-start justify-between mb-2">
              <h3 class="text-xl font-bold text-ibc-navy">{{ player.name }}</h3>
              <span class="text-2xl font-black text-ibc-gold">#{{ player.number }}</span>
            </div>
            <p class="text-slate-600 font-semibold">{{ player.position }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
