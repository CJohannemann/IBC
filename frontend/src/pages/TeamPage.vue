<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  getTeam,
  getTeamSeasons,
  parseSeasonSlug,
  seasonSlug,
  formatRecord,
  type TeamSeasonSummary,
} from '@/api/teams'
import { getTeamStats } from '@/api/stats'
import { getSchedule, type ScheduleEntry } from '@/api/schedule'
import { useSportStore } from '@/stores/sport'
import { mapsUrl } from '@/lib/maps'
import placeholderPlayer from '@/assets/placeholder-player.png'
import { playerSlug } from '@/lib/slug'

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
  // False once the team is archived: there is no season, so no record to show.
  hasSeason: false,
  season: '',
  year: null as number | null,
  // A past season, opened from its own link rather than the live team page.
  archived: false,
  // Whether a record was ever entered. A new season shows 0-0 regardless; a
  // past one with nothing entered shows no record rather than a made-up 0-0.
  hasRecord: false,
})

// /teams/10u/fall-2026 pins the page to that season; /teams/10u is the live one.
const pinnedSeason = computed(() => parseSeasonSlug(route.params.season as string | undefined))

// Every season this team has had, for the past-seasons list and the way back
// to the live team from an old one.
const allSeasons = ref<TeamSeasonSummary[]>([])
const sameLeague = (s: TeamSeasonSummary) => s.league.toLowerCase() === ageGroup.value
const liveSeason = computed(() => allSeasons.value.find((s) => sameLeague(s) && !s.archived) || null)
const pastSeasons = computed(() =>
  allSeasons.value.filter((s) =>
    sameLeague(s) && s.archived &&
    // Not the one already on screen.
    !(team.archived && s.season.toLowerCase() === team.season.toLowerCase() && s.year === team.year)
  )
)

async function loadSeasons() {
  try {
    allSeasons.value = await getTeamSeasons(sportStore.activeSport)
  } catch (e) {
    console.error('Failed to load past seasons:', e)
    allSeasons.value = []
  }
}

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

// Asked for by season, the same one the roster comes from. Left unscoped, the
// server answers with the newest season on file, so an archived team kept
// showing its final record and a new season would open on the old one.
async function loadRecord(league: string, season: string | null, year: number | null) {
  team.wins = 0
  team.losses = 0
  team.ties = 0
  team.hasRecord = false
  if (!season || year == null) return

  try {
    const stats = await getTeamStats({ league, season, year })
    const teamStat = stats[0]

    team.wins = teamStat?.wins || 0
    team.losses = teamStat?.losses || 0
    team.ties = teamStat?.ties || 0
    team.hasRecord = !!teamStat
  } catch (e) {
    console.error('Failed to load team record:', e)
    team.wins = 0
    team.losses = 0
    team.ties = 0
  }
}

// Navigating between seasons fires loads back to back; only the newest may
// write to the page, or a slow earlier one could land on top of it.
let loadToken = 0

async function loadTeam(league: string, pinned: { season: string; year: number } | null) {
  const token = ++loadToken
  loadNextGame(league)

  try {
    const data = await getTeam(league, pinned)
    if (token !== loadToken) return

    const leagueName = (data.league || league).toString()
    team.name = `${leagueName.toUpperCase()} Team`
    team.ageGroup = leagueName
    team.headCoach = data.headCoach || null
    team.hasSeason = !!data.season
    team.season = data.season || ''
    team.year = data.year
    team.archived = !!data.archived
    loadRecord(league, data.season, data.year)
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
    if (token !== loadToken) return
    console.error('Failed to load team:', e)
    team.name = `${league.toUpperCase()} Team`
    team.ageGroup = league
    team.headCoach = null
    team.hasSeason = false
    team.season = ''
    team.year = null
    team.archived = false
    loadRecord(league, null, null)
    team.assistantCoaches = []
    team.roster = []
  }
}

watch([ageGroup, pinnedSeason], ([league, pinned]) => loadTeam(league, pinned), { immediate: true })
watch(() => sportStore.activeSport, loadSeasons, { immediate: true })

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
       <h1 class="text-3xl sm:text-4xl font-black uppercase tracking-widest text-white">{{ team.name }}</h1>
       <p v-if="team.archived" class="text-white/70 text-sm font-bold uppercase tracking-widest mt-2">
         {{ team.season }} {{ team.year }} season
       </p>
       <p v-if="team.hasSeason && (!team.archived || team.hasRecord)" class="text-ibc-gold text-lg font-bold mt-1">{{ record }} Record</p>
     </div>

   </div>

   <!-- Schedule strip: the next game on a phone, the next three on a wide
        screen. Hidden entirely once the season has no games left.

        Deliberately light rather than a second navy - a tint close to the
        header reads as a mistake, so the seam is a red rule against cream
        instead. Sits outside the navy block so nothing inherits text-white. -->
   <div
     v-if="upcomingGames.length && !team.archived"
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

   <!-- A past season: say so, and offer the way back to the current team. -->
   <div v-if="team.archived" class="bg-ibc-cream border-b border-slate-200">
     <div class="max-w-6xl mx-auto px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-2 text-sm">
       <span class="text-slate-600">
         Archived season. Tap a player for their stats from every season.
       </span>
       <router-link
         v-if="liveSeason"
         :to="`/teams/${ageGroup}`"
         class="font-bold text-ibc-red hover:underline"
       >
         Current {{ team.ageGroup }} team &rarr;
       </router-link>
     </div>
   </div>

   <!-- Team Details -->
   <div class="max-w-6xl mx-auto px-4 sm:px-8 py-12">
     <!-- No team to show: between seasons, or a season link that matches nothing. -->
     <div v-if="!team.hasSeason" class="mb-12">
       <h2 class="text-2xl font-black text-ibc-navy uppercase tracking-wide mb-2">
         {{ pinnedSeason ? 'Season not found' : 'No team this season' }}
       </h2>
       <p class="text-slate-600">
         {{ pinnedSeason
           ? `There is no ${team.ageGroup.toUpperCase()} team on file for that season.`
           : pastSeasons.length
             ? `${team.ageGroup.toUpperCase()} isn't playing right now. Its past seasons are below.`
             : `${team.ageGroup.toUpperCase()} isn't playing right now.` }}
       </p>
     </div>

     <template v-else>
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
     </template>

     <!-- Past seasons: archiving takes a team off the site, and this keeps its
          old rosters, coaches and records a tap away. -->
     <div v-if="pastSeasons.length" class="mt-12">
       <h2 class="text-2xl font-black text-ibc-navy uppercase tracking-wide mb-4">Past Seasons</h2>
       <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
         <router-link
           v-for="s in pastSeasons"
           :key="seasonSlug(s)"
           :to="`/teams/${ageGroup}/${seasonSlug(s)}`"
           class="bg-white rounded-lg shadow p-4 hover:shadow-lg transition block"
         >
           <div class="font-black text-ibc-navy uppercase tracking-wide">{{ s.season }} {{ s.year }}</div>
           <div class="text-sm text-slate-600 mt-1">Coach {{ s.headCoach }}</div>
           <div v-if="formatRecord(s)" class="text-sm font-bold text-ibc-red mt-1">{{ formatRecord(s) }}</div>
         </router-link>
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

           <div class="flex items-center justify-between gap-3">
             <router-link
               v-if="selectedPlayer"
               :to="`/players/${playerSlug(selectedPlayer.name)}`"
               class="text-ibc-red font-bold hover:underline"
             >
               View stats &rarr;
             </router-link>
             <button @click="closePlayerModal" class="px-4 py-2 bg-ibc-red text-white rounded font-semibold hover:bg-ibc-gold">Close</button>
           </div>
         </div>
       </div>
     </div>
   </Teleport>
  </div>
</template>
