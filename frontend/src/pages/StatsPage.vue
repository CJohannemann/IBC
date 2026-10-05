<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed, ref, onMounted } from 'vue'
import { getBattingStats, getPitchingStats, getTeamStats, getSeasons } from '@/api/stats'
import type { BattingStat, PitchingStat, TeamStat, Season } from '@/api/stats'

interface BattingPlayer {
  id: string
  name: string
  battingAverage: number
  hits: number
  atBats: number
  homeRuns: number
  rbis: number
}

interface PitchingPlayer {
  id: string
  name: string
  battersFaced: number
  /** (K - BB) / BF, as a fraction. Null when batters faced is unknown. */
  kMinusBbRate: number | null
  /** BB / BF, as a fraction. */
  walkRate: number | null
  /** Percentages straight from GameChanger: 54.0 means 54%. */
  strikePct: number | null
  firstPitchStrikePct: number | null
  era: number | null
  baa: number | null
}

interface TeamBattingStats {
  name: string
  ageGroup: string
  players: BattingPlayer[]
}

interface TeamPitchingStats {
  name: string
  ageGroup: string
  pitchers: PitchingPlayer[]
  /** Batters faced needed to be ranked. */
  minBattersFaced: number
}

// Rate stats on a handful of batters say nothing, so a pitcher needs this share
// of the team's batters faced to rank. Relative rather than a fixed count, so
// it works in week one and in week twelve alike.
const QUALIFYING_SHARE_OF_BF = 0.05

const route = useRoute()

// Reactive data from API
const battingStatsData = ref<BattingStat[]>([])
const pitchingStatsData = ref<PitchingStat[]>([])
const teamStatsData = ref<TeamStat[]>([])
const loading = ref(true)

const seasons = ref<Season[]>([])
// '' means "whatever is current" - the server picks the newest season on file.
const selectedSeason = ref('')

/** Seasons are keyed by two values, so the dropdown uses one combined string. */
function seasonKey(s: Season): string {
  return `${s.season} ${s.year}`
}

function selectedParams(): { season?: string; year?: number } {
  const match = seasons.value.find((s) => seasonKey(s) === selectedSeason.value)
  return match ? { season: match.season, year: match.year } : {}
}

async function loadStats() {
  try {
    loading.value = true
    const params = selectedParams()
    const [batting, pitching, teams] = await Promise.all([
      getBattingStats(params),
      getPitchingStats(params),
      getTeamStats(params)
    ])
    battingStatsData.value = batting
    pitchingStatsData.value = pitching
    teamStatsData.value = teams
  } catch (error) {
    console.error('Failed to load stats:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    seasons.value = await getSeasons()
    // Default to the newest season, which the endpoint returns first.
    if (seasons.value.length) selectedSeason.value = seasonKey(seasons.value[0])
  } catch (error) {
    console.error('Failed to load seasons:', error)
  }

  await loadStats()
})

// Transform API data to component format - group by league
const battingData = computed<TeamBattingStats[]>(() => {
  const grouped = new Map<string, BattingPlayer[]>()
  
  battingStatsData.value.forEach(stat => {
    const league = stat.league || 'Unknown'
    if (!grouped.has(league)) {
      grouped.set(league, [])
    }
    
    grouped.get(league)!.push({
      id: stat.id.toString(),
      name: stat.player_name,
      battingAverage: stat.avg || 0,
      hits: stat.hits || 0,
      atBats: stat.at_bats || 0,
      homeRuns: stat.home_runs || 0,
      rbis: stat.rbis || 0
    })
  })
  
  // Sort players by batting average within each league
  const result: TeamBattingStats[] = []
  grouped.forEach((players, league) => {
    players.sort((a, b) => b.battingAverage - a.battingAverage)
    result.push({
      name: `${league} Team`,
      ageGroup: league,
      players: players
    })
  })
  
  return result.sort((a, b) => a.ageGroup.localeCompare(b.ageGroup))
})

const pitchingData = computed<TeamPitchingStats[]>(() => {
  const grouped = new Map<string, PitchingPlayer[]>()

  pitchingStatsData.value.forEach(stat => {
    const league = stat.league || 'Unknown'
    if (!grouped.has(league)) {
      grouped.set(league, [])
    }

    const bf = stat.batters_faced || 0
    const strikeouts = stat.strikeouts || 0
    const walks = stat.walks || 0

    grouped.get(league)!.push({
      id: stat.id.toString(),
      name: stat.player_name,
      battersFaced: bf,
      kMinusBbRate: bf ? (strikeouts - walks) / bf : null,
      walkRate: bf ? walks / bf : null,
      strikePct: stat.strike_pct,
      firstPitchStrikePct: stat.first_pitch_strike_pct,
      era: stat.era,
      baa: stat.baa
    })
  })

  const result: TeamPitchingStats[] = []
  grouped.forEach((pitchers, league) => {
    const totalBattersFaced = pitchers.reduce((sum, p) => sum + p.battersFaced, 0)
    result.push({
      name: `${league} Team`,
      ageGroup: league,
      pitchers,
      minBattersFaced: Math.max(1, Math.ceil(totalBattersFaced * QUALIFYING_SHARE_OF_BF))
    })
  })

  return result.sort((a, b) => a.ageGroup.localeCompare(b.ageGroup))
})

const category = computed(() => (route.params.category as string).toLowerCase())

const getTopBattingLeaders = (team: TeamBattingStats) => {
  return [...team.players].sort((a, b) => b.battingAverage - a.battingAverage).slice(0, 3)
}

// Ranked by K-BB%, the best single measure of pitching skill at this age.
// Fewer walks breaks a tie, since walks drive the most runs at 10U.
// ERA and BAA are shown but never sorted on: they lean on the defence.
const getTopPitchingLeaders = (team: TeamPitchingStats) => {
  return team.pitchers
    .filter(p => p.kMinusBbRate !== null && p.battersFaced >= team.minBattersFaced)
    .sort((a, b) => (b.kMinusBbRate! - a.kMinusBbRate!) || (a.walkRate! - b.walkRate!))
    .slice(0, 3)
}

const formatRate = (value: number | null) => value === null ? '–' : `${(value * 100).toFixed(1)}%`
const formatPct = (value: number | null) => value === null ? '–' : `${value.toFixed(1)}%`
const formatEra = (value: number | null) => value === null ? '–' : value.toFixed(2)
// Batting-average style: .452, not 0.452
const formatBaa = (value: number | null) => value === null ? '–' : value.toFixed(3).replace(/^0/, '')

const getRunDiff = (team: TeamStat) => (team.runs_scored || 0) - (team.runs_allowed || 0)
</script>

<template>
  <div class="min-h-screen bg-ibc-cream py-12 px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <h1 class="text-4xl font-black text-ibc-navy uppercase tracking-widest mb-2">
        <span v-if="category === 'batting'">Batting Leaders</span>
        <span v-else-if="category === 'pitching'">Pitching Leaders</span>
        <span v-else>Team Stats</span>
      </h1>
      <p class="text-slate-500 mb-6">Top performers across all age groups</p>

      <!-- Only worth showing once more than one season exists -->
      <div v-if="seasons.length > 1" class="mb-12 flex items-center gap-3">
        <label class="text-sm font-semibold text-ibc-navy">Season</label>
        <select v-model="selectedSeason" @change="loadStats"
          class="p-2 border rounded bg-white text-ibc-navy font-semibold">
          <option v-for="s in seasons" :key="`${s.season}-${s.year}`" :value="`${s.season} ${s.year}`">
            {{ s.season }} {{ s.year }}
          </option>
        </select>
      </div>
      <div v-else class="mb-12"></div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-ibc-red"></div>
        <p class="mt-4 text-slate-600">Loading stats...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="battingData.length === 0 && pitchingData.length === 0" class="text-center py-12">
        <p class="text-slate-600">No stats available. Upload CSV files in the admin panel.</p>
      </div>

      <!-- Team Tables -->
      <div v-else-if="category === 'batting'" class="space-y-12">
        <div
          v-for="team in battingData"
          :key="team.ageGroup"
          class="bg-white rounded-lg shadow overflow-hidden"
        >
          <!-- Team Header -->
          <div class="bg-ibc-navy text-white px-8 py-4">
            <h2 class="text-2xl font-black uppercase tracking-wide">{{ team.name }}</h2>
          </div>

          <!-- Table -->
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-slate-100 border-b-2 border-ibc-navy">
                  <th class="px-6 py-4 text-left text-sm font-bold text-ibc-navy">Rank</th>
                  <th class="px-6 py-4 text-left text-sm font-bold text-ibc-navy">Player</th>
                  <th class="px-6 py-4 text-center text-sm font-bold text-ibc-navy">Avg</th>
                  <th class="px-6 py-4 text-center text-sm font-bold text-ibc-navy">Hits</th>
                  <th class="px-6 py-4 text-center text-sm font-bold text-ibc-navy">At Bats</th>
                  <th class="px-6 py-4 text-center text-sm font-bold text-ibc-navy">HRs</th>
                  <th class="px-6 py-4 text-center text-sm font-bold text-ibc-navy">RBIs</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(player, idx) in getTopBattingLeaders(team)"
                  :key="player.id"
                  class="border-b border-slate-200 hover:bg-slate-50 transition"
                  :class="{
                    'bg-ibc-gold/10': idx === 0,
                    'bg-slate-100/50': idx === 1,
                  }"
                >
                  <td class="px-6 py-4 text-sm font-bold text-ibc-navy">
                    <span
                      class="inline-flex items-center justify-center w-8 h-8 rounded-full"
                      :class="{
                        'bg-ibc-gold text-ibc-navy': idx === 0,
                        'bg-slate-400 text-white': idx === 1,
                        'bg-orange-400 text-white': idx === 2,
                      }"
                    >
                      {{ idx + 1 }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm font-semibold text-ibc-navy">{{ player.name }}</td>
                  <td class="px-6 py-4 text-sm font-bold text-center text-ibc-red">
                    {{ player.battingAverage.toFixed(3) }}
                  </td>
                  <td class="px-6 py-4 text-sm text-center text-slate-700">{{ player.hits }}</td>
                  <td class="px-6 py-4 text-sm text-center text-slate-700">{{ player.atBats }}</td>
                  <td class="px-6 py-4 text-sm font-semibold text-center text-ibc-navy">
                    {{ player.homeRuns }}
                  </td>
                  <td class="px-6 py-4 text-sm font-semibold text-center text-ibc-navy">
                    {{ player.rbis }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Pitching Stats Tables -->
      <div v-else-if="category === 'pitching'" class="space-y-12">
        <div
          v-for="team in pitchingData"
          :key="team.ageGroup"
          class="bg-white rounded-lg shadow overflow-hidden"
        >
          <!-- Team Header -->
          <div class="bg-ibc-navy text-white px-8 py-4">
            <h2 class="text-2xl font-black uppercase tracking-wide">{{ team.name }}</h2>
          </div>

          <!-- Table -->
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-slate-100 border-b-2 border-ibc-navy">
                  <th class="px-6 py-4 text-left text-sm font-bold text-ibc-navy">Rank</th>
                  <th class="px-6 py-4 text-left text-sm font-bold text-ibc-navy">Pitcher</th>
                  <th class="px-6 py-4 text-center text-sm font-bold text-ibc-navy whitespace-nowrap" title="(Strikeouts − walks) ÷ batters faced">K-BB%</th>
                  <th class="px-6 py-4 text-center text-sm font-bold text-ibc-navy" title="Share of all pitches that were strikes">Strike %</th>
                  <th class="px-6 py-4 text-center text-sm font-bold text-ibc-navy" title="First-pitch strike percentage">FPS %</th>
                  <th class="px-6 py-4 text-center text-sm font-bold text-ibc-navy" title="Walks ÷ batters faced">BB/BF</th>
                  <th class="px-6 py-4 text-center text-sm font-bold text-ibc-navy" title="Batters faced">BF</th>
                  <th class="px-6 py-4 text-center text-sm font-medium text-slate-500">ERA</th>
                  <th class="px-6 py-4 text-center text-sm font-medium text-slate-500" title="Opponent batting average">BAA</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(pitcher, idx) in getTopPitchingLeaders(team)"
                  :key="pitcher.id"
                  class="border-b border-slate-200 hover:bg-slate-50 transition"
                  :class="{
                    'bg-ibc-gold/10': idx === 0,
                    'bg-slate-100/50': idx === 1,
                  }"
                >
                  <td class="px-6 py-4 text-sm font-bold text-ibc-navy">
                    <span
                      class="inline-flex items-center justify-center w-8 h-8 rounded-full"
                      :class="{
                        'bg-ibc-gold text-ibc-navy': idx === 0,
                        'bg-slate-400 text-white': idx === 1,
                        'bg-orange-400 text-white': idx === 2,
                      }"
                    >
                      {{ idx + 1 }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm font-semibold text-ibc-navy">{{ pitcher.name }}</td>
                  <td class="px-6 py-4 text-sm font-bold text-center text-ibc-red">
                    {{ formatRate(pitcher.kMinusBbRate) }}
                  </td>
                  <td class="px-6 py-4 text-sm font-semibold text-center text-ibc-navy">{{ formatPct(pitcher.strikePct) }}</td>
                  <td class="px-6 py-4 text-sm font-semibold text-center text-ibc-navy">{{ formatPct(pitcher.firstPitchStrikePct) }}</td>
                  <td class="px-6 py-4 text-sm font-semibold text-center text-ibc-navy">{{ formatRate(pitcher.walkRate) }}</td>
                  <td class="px-6 py-4 text-sm text-center text-slate-700">{{ pitcher.battersFaced }}</td>
                  <td class="px-6 py-4 text-sm text-center text-slate-500">{{ formatEra(pitcher.era) }}</td>
                  <td class="px-6 py-4 text-sm text-center text-slate-500">{{ formatBaa(pitcher.baa) }}</td>
                </tr>
                <tr v-if="getTopPitchingLeaders(team).length === 0">
                  <td colspan="9" class="px-6 py-8 text-sm text-center text-slate-500">
                    No batters-faced numbers for this season yet. Re-upload its GameChanger CSV to rank pitchers.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="px-6 py-3 text-xs text-slate-500 border-t border-slate-200">
            Ranked by K-BB%: (strikeouts − walks) ÷ batters faced.
            Minimum {{ team.minBattersFaced }} batters faced.
          </p>
        </div>
      </div>

      <!-- Team Stats -->
      <div v-else-if="category === 'team'" class="space-y-12">
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <!-- Header -->
          <div class="bg-ibc-navy text-white px-8 py-4">
            <h2 class="text-2xl font-black uppercase tracking-wider">Team Standings</h2>
          </div>

          <!-- Team Stats Table -->
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-200">
              <thead class="bg-slate-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    League
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Team
                  </th>
                  <th class="px-6 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">
                    W
                  </th>
                  <th class="px-6 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">
                    L
                  </th>
                  <th class="px-6 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">
                    T
                  </th>
                  <th class="px-6 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Runs Scored
                  </th>
                  <th class="px-6 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Runs Allowed
                  </th>
                  <th class="px-6 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Run Diff
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-slate-200">
                <tr
                  v-for="team in teamStatsData"
                  :key="team.id"
                  class="hover:bg-slate-50 transition"
                >
                  <td class="px-6 py-4 text-sm font-semibold text-ibc-navy">{{ team.league }}</td>
                  <td class="px-6 py-4 text-sm font-bold text-ibc-navy">{{ team.team_name }}</td>
                  <td class="px-6 py-4 text-sm text-center font-semibold text-green-600">
                    {{ team.wins }}
                  </td>
                  <td class="px-6 py-4 text-sm text-center font-semibold text-red-600">
                    {{ team.losses }}
                  </td>
                  <td class="px-6 py-4 text-sm text-center text-slate-700">
                    {{ team.ties }}
                  </td>
                  <td class="px-6 py-4 text-sm text-center font-semibold text-ibc-navy">
                    {{ team.runs_scored }}
                  </td>
                  <td class="px-6 py-4 text-sm text-center text-slate-700">
                    {{ team.runs_allowed }}
                  </td>
                  <td class="px-6 py-4 text-sm text-center font-bold" :class="{
                    'text-green-600': getRunDiff(team) > 0,
                    'text-red-600': getRunDiff(team) < 0,
                    'text-slate-600': getRunDiff(team) === 0
                  }">
                    {{ getRunDiff(team) > 0 ? '+' : '' }}{{ getRunDiff(team) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Placeholder for other categories -->
      <div v-else class="bg-white rounded-lg shadow p-12 text-center text-slate-500">
        <p>{{ category }} stats coming soon</p>
      </div>
    </div>
  </div>
</template>
