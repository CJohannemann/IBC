<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  getTeamSeasons,
  seasonSlug,
  formatRecord,
  type TeamSeasonSummary,
} from '@/api/teams'
import { useSportStore } from '@/stores/sport'

const sportStore = useSportStore()

const seasons = ref<TeamSeasonSummary[]>([])
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    seasons.value = (await getTeamSeasons(sportStore.activeSport)).filter((s) => s.archived)
  } catch (e) {
    console.error('Failed to load past seasons:', e)
    seasons.value = []
  } finally {
    loading.value = false
  }
}

watch(() => sportStore.activeSport, load, { immediate: true })

/** Grouped under "Fall 2026" and so on; the list already arrives newest first. */
const groups = computed(() => {
  const out: { label: string; teams: TeamSeasonSummary[] }[] = []
  for (const s of seasons.value) {
    const label = `${s.season} ${s.year}`
    const last = out[out.length - 1]
    if (last && last.label === label) last.teams.push(s)
    else out.push({ label, teams: [s] })
  }
  return out
})
</script>

<template>
  <div class="min-h-screen bg-ibc-cream">
    <div class="bg-ibc-navy text-white">
      <div class="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-10">
        <h1 class="text-3xl sm:text-4xl font-black uppercase tracking-widest text-white">Past Seasons</h1>
        <p class="text-white/70 mt-2">Every team the club has fielded: rosters, coaches, records and player stats.</p>
      </div>
    </div>

    <div class="max-w-6xl mx-auto px-4 sm:px-8 py-12">
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-ibc-red"></div>
      </div>

      <p v-else-if="!groups.length" class="text-slate-600">No past seasons yet.</p>

      <div v-else class="space-y-10">
        <section v-for="g in groups" :key="g.label">
          <h2 class="text-2xl font-black text-ibc-navy uppercase tracking-wide mb-4">{{ g.label }}</h2>
          <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <router-link
              v-for="t in g.teams"
              :key="`${t.league}-${seasonSlug(t)}`"
              :to="`/teams/${t.league.toLowerCase()}/${seasonSlug(t)}`"
              class="bg-white rounded-lg shadow p-4 hover:shadow-lg transition block"
            >
              <div class="font-black text-xl text-ibc-navy uppercase tracking-wide">{{ t.league }}</div>
              <div class="text-sm text-slate-600 mt-1">Coach {{ t.headCoach }}</div>
              <div v-if="formatRecord(t)" class="text-sm font-bold text-ibc-red mt-1">{{ formatRecord(t) }}</div>
            </router-link>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
