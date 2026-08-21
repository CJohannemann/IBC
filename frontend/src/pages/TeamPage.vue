<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getTeam } from '@/api/teams'
import { type Player } from '@/api/players'
import { usePlayerStore } from '@/stores/players'

const route = useRoute()
const playerStore = usePlayerStore()

interface RosterPlayer {
  number: number
  first_name: string
  last_name: string
  name: string
  photo_path: string
  favorite_food: string
  favorite_movie: string
  bio: string
}

const team = reactive({
  name: '',
  ageGroup: '',
  headCoach: null as string | null,
  roster: [] as RosterPlayer[],
  wins: 0,
  losses: 0,
})

const ageGroup = computed(() => (route.params.ageGroup as string || '10u').toLowerCase())

async function loadTeam(league: string) {
  try {
    const data = await getTeam(league)

    const leagueName = (data.league || league).toString()
    team.name = `${leagueName.toUpperCase()} Team`
    team.ageGroup = leagueName
    team.headCoach = data.headCoach || null
    team.roster = (data.players || []).map((p) => ({
      number: p.player_number,
      first_name: p.first_name,
      last_name: p.last_name,
      name: `${p.first_name} ${p.last_name}`,
      photo_path: p.photo_path,
      favorite_food: p.favorite_food,
      favorite_movie: p.favorite_movie,
      bio: p.bio,
    }))
  } catch (e) {
    console.error('Failed to load team:', e)
    team.name = `${league.toUpperCase()} Team`
    team.ageGroup = league
    team.headCoach = null
    team.roster = []
  }
}

watch(ageGroup, (v) => loadTeam(v), { immediate: true })

const selectedPlayer = ref<Player | RosterPlayer | null>(null)
const showPlayerModal = ref(false)

async function openPlayer(number: number) {
  try {
    const data = await playerStore.fetchOne(number)
    if (data && data.player_number) {
      selectedPlayer.value = data
      showPlayerModal.value = true
      return
    }
  } catch {
    // fall back to local roster data
  }
  const local = (team.roster || []).find((p) => p.number === number)
  if (local) {
    selectedPlayer.value = local
    showPlayerModal.value = true
  }
}

function closePlayerModal() {
  showPlayerModal.value = false
  selectedPlayer.value = null
}
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
     <!-- Coach Section (kept minimal) -->
     <div class="mb-12">
       <h2 class="text-2xl font-black text-ibc-navy uppercase tracking-wide mb-4">Head Coach</h2>
       <div class="bg-white p-6 rounded-lg shadow max-w-sm">
         <p class="text-lg font-semibold text-ibc-navy">{{ team.headCoach}}</p>
       </div>
     </div>

     <!-- Roster Section -->
     <div>
       <h2 class="text-2xl font-black text-ibc-navy uppercase tracking-wide mb-4">Roster</h2>

       <!-- Grid of compact player cards -->
       <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
         <button
           v-for="player in team.roster"
           :key="player.number"
           @click="openPlayer(player.number)"
           class="bg-white rounded-lg shadow p-3 flex items-center gap-3 hover:shadow-lg transition text-left"
         >
           <img :src="player.photo_path || '/placeholder-player.png'" alt="player photo" class="w-14 h-14 object-cover rounded-full border-2 border-white/20" />
           <div class="flex-1">
             <div class="font-bold text-ibc-navy">{{ player.name }}</div>
             <div class="text-sm text-slate-500">#{{ player.number }}</div>
           </div>
         </button>
       </div>
     </div>
   </div>

   <!-- Player Modal -->
   <Teleport to="body">
     <div v-if="showPlayerModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="closePlayerModal">
       <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6" @click.stop>
         <div class="flex items-start justify-between mb-4">
           <div class="flex items-center gap-4">
             <img :src="selectedPlayer?.photo_path || '/placeholder-player.png'" alt="photo" class="w-20 h-20 object-cover rounded-full border-2 border-white/20" />
             <div>
               <h3 class="text-2xl font-black text-ibc-navy">{{ selectedPlayer?.first_name ? (selectedPlayer.first_name + ' ' + selectedPlayer.last_name) : selectedPlayer?.name }}</h3>
               <div class="text-sm text-slate-600">#{{ selectedPlayer?.player_number || selectedPlayer?.number }}</div>
             </div>
           </div>
           <button @click="closePlayerModal" class="text-slate-400 hover:text-slate-600 text-2xl">×</button>
         </div>

         <div class="space-y-4">
           <p class="text-slate-700">{{ selectedPlayer?.bio }}</p>

           <div class="grid grid-cols-2 gap-4">
             <div>
               <div class="text-xs text-slate-500 uppercase font-bold">Favorite Food</div>
               <div class="font-semibold text-ibc-navy">{{ selectedPlayer?.favorite_food || selectedPlayer?.favoriteFood }}</div>
             </div>
             <div>
               <div class="text-xs text-slate-500 uppercase font-bold">Favorite Movie</div>
               <div class="font-semibold text-ibc-navy">{{ selectedPlayer?.favorite_movie || selectedPlayer?.favoriteMovie }}</div>
             </div>
           </div>

           <div class="text-right">
             <button @click="closePlayerModal" class="px-4 py-2 bg-ibc-red text-white rounded font-semibold hover:bg-ibc-gold">Close</button>
           </div>
         </div>
       </div>
     </div>
   </Teleport>
  </div>
</template>
