<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getTeam } from '@/api/teams'
import { getTeamStats } from '@/api/stats'
import { getSchedule, type ScheduleEntry } from '@/api/schedule'
import { useSportStore } from '@/stores/sport'
import { mapsUrl } from '@/lib/maps'
import placeholderPlayer from '@/assets/placeholder-player.png'

const route = useRoute()
const sportStore = useSportStore()

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
  assistantCoaches: [] as string[],
  roster: [] as RosterPlayer[],
  wins: 0,
  losses: 0,
  ties: 0,
})

const record = computed(() =>
  team.ties > 0
    ? `${team.wins}-${team.losses}-${team.ties}`
    : `${team.wins}-${team.losses}`
)

const ageGroup = computed(() => (route.params.ageGroup as string || '10u').toLowerCase())

// Dates are stored as YYYY-MM-DD, which compares correctly as text - no
// parsing needed, and no timezone to shift the day out from under us.
const games = ref<ScheduleEntry[]>([])

const todayStr = (() => {
  const d = new Date()
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
})()

// A phone only has room for the next game; a wide screen shows the two after
// it as well, so the same list is fetched and the extras hidden by breakpoint.
const upcomingGames = computed(() =>
  games.value
    .filter((g) => g.date >= todayStr)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 3)
)

async function loadNextGame(league: string) {
  try {
    games.value = await getSchedule({
      league,
      sport: sportStore.activeSport,
      type: 'Game',
    })
  } catch (e) {
    console.error('Failed to load team schedule:', e)
    games.value = []
  }
}

const formatGameDate = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

const formatTime = (timeStr: string) => {
  if (!timeStr) return ''
  const [h, m] = timeStr.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${displayHour}:${m} ${ampm}`
}

async function loadRecord(league: string) {
  try {
    const stats = await getTeamStats({ league })
    const teamStat = stats[0]

    team.wins = teamStat?.wins || 0
    team.losses = teamStat?.losses || 0
    team.ties = teamStat?.ties || 0
  } catch (e) {
    console.error('Failed to load team record:', e)
    team.wins = 0
    team.losses = 0
    team.ties = 0
  }
}

async function loadTeam(league: string) {
  loadRecord(league)
  loadNextGame(league)

  try {
    const data = await getTeam(league)

    const leagueName = (data.league || league).toString()
    team.name = `${leagueName.toUpperCase()} Team`
    team.ageGroup = leagueName
    team.headCoach = data.headCoach || null
    team.assistantCoaches = data.assistantCoaches || []
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
    team.assistantCoaches = []
    team.roster = []
  }
}

watch(ageGroup, (v) => loadTeam(v), { immediate: true })

const selectedPlayer = ref<RosterPlayer | null>(null)
const showPlayerModal = ref(false)

function openPlayer(number: number) {
  // Look the player up in this team's roster, not globally by jersey number:
  // numbers repeat across teams, so #0 exists in both 10U and 14U. The roster
  // came from /teams/:league and already carries everything the modal shows,
  // so there is nothing to fetch.
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
   <div class="bg-ibc-navy text-white">
     <div class="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-10">
       <h1 class="text-3xl sm:text-4xl font-black uppercase tracking-widest">{{ team.name }}</h1>
       <p class="text-ibc-gold text-lg font-bold mt-1">{{ record }} Record</p>
     </div>

   </div>

   <!-- Schedule strip: the next game on a phone, the next three on a wide
        screen. Hidden entirely once the season has no games left.

        Deliberately light rather than a second navy - a tint close to the
        header reads as a mistake, so the seam is a red rule against cream
        instead. Sits outside the navy block so nothing inherits text-white. -->
   <div
     v-if="upcomingGames.length"
     class="bg-ibc-cream border-t-[3px] border-t-ibc-red border-b border-b-slate-200"
   >
     <div class="max-w-6xl mx-auto px-4 sm:px-8 py-4">
       <div class="flex items-center justify-between gap-4 mb-3">
         <span class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
           {{ upcomingGames.length === 1 ? 'Next Game' : 'Upcoming' }}
         </span>
         <router-link
           to="/schedule"
           class="text-xs font-bold text-ibc-red hover:underline shrink-0"
         >
           Full schedule &rarr;
         </router-link>
       </div>

       <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-3 md:divide-x md:divide-slate-300">
         <div
           v-for="(game, i) in upcomingGames"
           :key="game.id"
           class="min-w-0 md:px-5 md:first:pl-0"
           :class="{ 'hidden md:block': i === 1, 'hidden lg:block': i === 2 }"
         >
           <div class="flex items-baseline gap-2 flex-wrap">
             <span class="font-black text-lg text-ibc-navy">{{ formatGameDate(game.date) }}</span>
             <span class="text-slate-600 text-sm">{{ formatTime(game.time) }}</span>
           </div>
           <div class="flex items-center gap-2 mt-1 min-w-0">
             <span
               v-if="game.home_away"
               class="text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded shrink-0"
               :class="game.home_away === 'Home' ? 'bg-ibc-red text-white' : 'bg-slate-200 text-slate-700'"
             >
               {{ game.home_away }}
             </span>
             <span class="font-semibold truncate text-ibc-navy">vs {{ game.opponent || 'TBD' }}</span>
           </div>
           <a
             v-if="game.location"
             :href="mapsUrl(game.location, game.address)"
             target="_blank"
             rel="noopener noreferrer"
             class="block text-xs text-slate-500 mt-1 truncate underline decoration-slate-300 underline-offset-2 hover:text-ibc-red"
           >
             {{ game.location }}
           </a>
           <div v-else class="text-xs text-slate-500 mt-1">Location TBD</div>
         </div>
       </div>
     </div>
   </div>

   <!-- Team Details -->
   <div class="max-w-6xl mx-auto px-8 py-12">
     <!-- Coach Section (kept minimal) -->
     <div class="mb-12">
       <h2 class="text-2xl font-black text-ibc-navy uppercase tracking-wide mb-4">Coaching Staff</h2>
       <div class="bg-white p-6 rounded-lg shadow max-w-sm">
         <p class="text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">Head Coach</p>
         <p class="text-lg font-semibold text-ibc-navy">{{ team.headCoach || 'Not assigned' }}</p>

         <div v-if="team.assistantCoaches.length" class="mt-4 pt-4 border-t border-slate-200">
           <p class="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
             {{ team.assistantCoaches.length === 1 ? 'Assistant Coach' : 'Assistant Coaches' }}
           </p>
           <ul class="space-y-1">
             <li v-for="assistant in team.assistantCoaches" :key="assistant"
               class="text-base font-medium text-ibc-navy">
               {{ assistant }}
             </li>
           </ul>
         </div>
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
           <img :src="player.photo_path || placeholderPlayer" alt="player photo" class="w-14 h-14 object-cover rounded-full border-2 border-white/20" />
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
             <img :src="selectedPlayer?.photo_path || placeholderPlayer" alt="photo" class="w-20 h-20 object-cover rounded-full border-2 border-white/20" />
             <div>
               <h3 class="text-2xl font-black text-ibc-navy">{{ selectedPlayer?.first_name ? (selectedPlayer.first_name + ' ' + selectedPlayer.last_name) : selectedPlayer?.name }}</h3>
               <div class="text-sm text-slate-600">#{{ selectedPlayer?.number }}</div>
             </div>
           </div>
           <button @click="closePlayerModal" class="text-slate-400 hover:text-slate-600 text-2xl">×</button>
         </div>

         <div class="space-y-4">
           <p class="text-slate-700">{{ selectedPlayer?.bio }}</p>

           <div class="grid grid-cols-2 gap-4">
             <div>
               <div class="text-xs text-slate-500 uppercase font-bold">Favorite Food</div>
               <div class="font-semibold text-ibc-navy">{{ selectedPlayer?.favorite_food }}</div>
             </div>
             <div>
               <div class="text-xs text-slate-500 uppercase font-bold">Favorite Movie</div>
               <div class="font-semibold text-ibc-navy">{{ selectedPlayer?.favorite_movie }}</div>
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
