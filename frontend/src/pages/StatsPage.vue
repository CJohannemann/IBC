<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'

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
  era: number
  strikePercentage: number
  walks: number
  strikeouts: number
  inningsPitched: number
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
}

const route = useRoute()

// Mock batting stats data - replace with API call
const battingData: TeamBattingStats[] = [
  {
    name: '10U Team',
    ageGroup: '10U',
    players: [
      {
        id: '1',
        name: 'Alex Johnson',
        battingAverage: 0.450,
        hits: 18,
        atBats: 40,
        homeRuns: 2,
        rbis: 12,
      },
      {
        id: '2',
        name: 'Jordan Smith',
        battingAverage: 0.400,
        hits: 16,
        atBats: 40,
        homeRuns: 1,
        rbis: 10,
      },
      {
        id: '3',
        name: 'Casey Williams',
        battingAverage: 0.375,
        hits: 15,
        atBats: 40,
        homeRuns: 0,
        rbis: 8,
      },
      {
        id: '4',
        name: 'Morgan Brown',
        battingAverage: 0.350,
        hits: 14,
        atBats: 40,
        homeRuns: 1,
        rbis: 9,
      },
    ],
  },
  {
    name: '14U Team',
    ageGroup: '14U',
    players: [
      {
        id: '5',
        name: 'Tyler Davis',
        battingAverage: 0.480,
        hits: 24,
        atBats: 50,
        homeRuns: 4,
        rbis: 18,
      },
      {
        id: '6',
        name: 'Marcus Wilson',
        battingAverage: 0.420,
        hits: 21,
        atBats: 50,
        homeRuns: 3,
        rbis: 15,
      },
      {
        id: '7',
        name: 'Jackson Martinez',
        battingAverage: 0.400,
        hits: 20,
        atBats: 50,
        homeRuns: 2,
        rbis: 14,
      },
      {
        id: '8',
        name: 'Ryan Garcia',
        battingAverage: 0.360,
        hits: 18,
        atBats: 50,
        homeRuns: 1,
        rbis: 12,
      },
    ],
  },
]

// Mock pitching stats data - replace with API call
const pitchingData: TeamPitchingStats[] = [
  {
    name: '10U Team',
    ageGroup: '10U',
    pitchers: [
      {
        id: '101',
        name: 'Emma Davis',
        era: 1.50,
        strikePercentage: 0.68,
        walks: 8,
        strikeouts: 45,
        inningsPitched: 36,
      },
      {
        id: '102',
        name: 'Sofia Rodriguez',
        era: 2.10,
        strikePercentage: 0.62,
        walks: 12,
        strikeouts: 38,
        inningsPitched: 32,
      },
      {
        id: '103',
        name: 'Olivia Chen',
        era: 2.80,
        strikePercentage: 0.58,
        walks: 14,
        strikeouts: 30,
        inningsPitched: 28,
      },
      {
        id: '104',
        name: 'Madison Taylor',
        era: 3.25,
        strikePercentage: 0.54,
        walks: 18,
        strikeouts: 25,
        inningsPitched: 24,
      },
    ],
  },
  {
    name: '14U Team',
    ageGroup: '14U',
    pitchers: [
      {
        id: '105',
        name: 'Jacob Anderson',
        era: 1.25,
        strikePercentage: 0.72,
        walks: 6,
        strikeouts: 72,
        inningsPitched: 48,
      },
      {
        id: '106',
        name: 'Brandon Lee',
        era: 1.95,
        strikePercentage: 0.68,
        walks: 10,
        strikeouts: 58,
        inningsPitched: 44,
      },
      {
        id: '107',
        name: 'Christopher White',
        era: 2.40,
        strikePercentage: 0.65,
        walks: 13,
        strikeouts: 52,
        inningsPitched: 40,
      },
      {
        id: '108',
        name: 'Nathan Harris',
        era: 3.10,
        strikePercentage: 0.60,
        walks: 16,
        strikeouts: 40,
        inningsPitched: 32,
      },
    ],
  },
]

const category = computed(() => (route.params.category as string).toLowerCase())

const getTopBattingLeaders = (team: TeamBattingStats) => {
  return [...team.players].sort((a, b) => b.battingAverage - a.battingAverage).slice(0, 3)
}

const getTopPitchingLeaders = (team: TeamPitchingStats) => {
  return [...team.pitchers].sort((a, b) => a.era - b.era).slice(0, 3)
}
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
      <p class="text-slate-500 mb-12">Top performers across all age groups</p>

      <!-- Team Tables -->
      <div v-if="category === 'batting'" class="space-y-12">
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
                  <th class="px-6 py-4 text-center text-sm font-bold text-ibc-navy">ERA</th>
                 <th class="px-6 py-4 text-center text-sm font-bold text-ibc-navy">Strike %</th>
                 <th class="px-6 py-4 text-center text-sm font-bold text-ibc-navy">Walks</th>
                  <th class="px-6 py-4 text-center text-sm font-bold text-ibc-navy">Ks</th>
                  <th class="px-6 py-4 text-center text-sm font-bold text-ibc-navy">IP</th>
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
                    {{ pitcher.era.toFixed(2) }}
                  </td>
                  <td class="px-6 py-4 text-sm text-center text-slate-700">{{ (pitcher.strikePercentage * 100).toFixed(1) }}%</td>
                  <td class="px-6 py-4 text-sm text-center text-slate-700">{{ pitcher.walks }}</td>
                  <td class="px-6 py-4 text-sm font-semibold text-center text-ibc-navy">
                    {{ pitcher.strikeouts }}
                  </td>
                  <td class="px-6 py-4 text-sm font-semibold text-center text-ibc-navy">
                    {{ pitcher.inningsPitched }}
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
