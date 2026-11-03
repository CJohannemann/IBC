<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { getPlayerCareer, type PlayerCareer, type PlayerSeason } from '@/api/stats'
import placeholderPlayer from '@/assets/placeholder-player.png'

const route = useRoute()

const career = ref<PlayerCareer | null>(null)
const loading = ref(true)
const notFound = ref(false)

// Put back on the way out, so the next page does not keep this player's name.
const originalTitle = document.title
onUnmounted(() => { document.title = originalTitle })

async function load(slug: string) {
  loading.value = true
  notFound.value = false
  try {
    career.value = await getPlayerCareer(slug)
    document.title = `${career.value.name} – Stats – Independence Baseball Club`
  } catch (err: any) {
    career.value = null
    notFound.value = err?.response?.status === 404
    if (!notFound.value) console.error('Failed to load player:', err)
  } finally {
    loading.value = false
  }
}

watch(() => route.params.slug as string, (slug) => load(slug), { immediate: true })

const seasonLabel = (s: PlayerSeason) => [s.season, s.year].filter(Boolean).join(' ')

const battingSeasons = computed(() => (career.value?.seasons || []).filter((s) => s.batting))
const pitchingSeasons = computed(() => (career.value?.seasons || []).filter((s) => s.pitching))

/** The team and season of their newest stats, else their newest roster spot. */
const latest = computed(() => {
  const seasons = career.value?.seasons || []
  const last = seasons[seasons.length - 1]
  if (last) return `${last.league} · ${seasonLabel(last)}`
  const r = career.value?.roster
  return r ? `${r.league} · ${[r.season, r.year].filter(Boolean).join(' ')}` : ''
})

const n = (v: number | null | undefined) => v ?? 0

// ---- batting -------------------------------------------------------------

const battingTotals = computed(() => {
  const t = { hits: 0, at_bats: 0, runs: 0, rbis: 0, doubles: 0, triples: 0, home_runs: 0, stolen_bases: 0 }
  for (const s of battingSeasons.value) {
    const b = s.batting!
    for (const k of Object.keys(t) as (keyof typeof t)[]) t[k] += n(b[k])
  }
  return { ...t, avg: t.at_bats ? t.hits / t.at_bats : null }
})

// Batting-average style: .452, not 0.452
const formatAvg = (v: number | null | undefined) =>
  v == null ? '–' : v.toFixed(3).replace(/^0/, '')

// ---- pitching ------------------------------------------------------------

/** GameChanger writes innings as 5.1 for 5⅓, so add them up as outs. */
const toOuts = (ip: number | null) => {
  if (ip == null) return 0
  const whole = Math.trunc(ip)
  return whole * 3 + Math.round((ip - whole) * 10)
}
const fromOuts = (outs: number) => `${Math.floor(outs / 3)}.${outs % 3}`

const pitchingTotals = computed(() => {
  let outs = 0, bf = 0, k = 0, bb = 0, h = 0, w = 0, l = 0, sv = 0
  let pitches = 0, strikes = 0, strikeKnown = 0
  for (const s of pitchingSeasons.value) {
    const p = s.pitching!
    outs += toOuts(p.innings_pitched)
    bf += n(p.batters_faced)
    k += n(p.strikeouts)
    bb += n(p.walks)
    h += n(p.hits_allowed)
    w += n(p.wins)
    l += n(p.losses)
    sv += n(p.saves)
    // Strike % is weighted by pitches, and only over seasons that have both.
    if (p.pitches && p.strike_pct != null) {
      pitches += p.pitches
      strikes += p.pitches * p.strike_pct
      strikeKnown++
    }
  }
  return {
    ip: fromOuts(outs), bf, k, bb, h, w, l, sv,
    kbb: bf ? (k - bb) / bf : null,
    strikePct: strikeKnown ? strikes / pitches : null,
  }
})

const formatRate = (v: number | null) => (v == null ? '–' : `${(v * 100).toFixed(1)}%`)
const formatPct = (v: number | null | undefined) => (v == null ? '–' : `${v.toFixed(1)}%`)
const formatIp = (v: number | null | undefined) => (v == null ? '–' : v.toFixed(1))
const formatEra = (v: number | null | undefined) => (v == null ? '–' : v.toFixed(2))
const kbbOf = (s: PlayerSeason) => {
  const p = s.pitching!
  return p.batters_faced ? (n(p.strikeouts) - n(p.walks)) / p.batters_faced : null
}

// The first column reads left-aligned; the numbers are centred under their heading.
const cell = 'px-3 sm:px-4 py-3 whitespace-nowrap'
const th = `${cell} text-center text-xs font-bold text-ibc-navy uppercase tracking-wider`
const thFirst = `${cell} text-left text-xs font-bold text-ibc-navy uppercase tracking-wider`
const td = `${cell} text-sm text-center text-slate-700`
const tdFirst = `${cell} text-sm text-left`
</script>

<template>
  <div class="min-h-screen bg-ibc-cream">
    <div v-if="loading" class="text-center py-24">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-ibc-red"></div>
    </div>

    <div v-else-if="!career" class="max-w-xl mx-auto px-4 py-24 text-center">
      <h1 class="text-2xl font-black text-ibc-navy uppercase tracking-widest mb-3">
        {{ notFound ? 'Player not found' : 'Could not load this player' }}
      </h1>
      <p class="text-slate-600 mb-6">
        {{ notFound ? 'There are no stats on file under this name.' : 'Please try again in a moment.' }}
      </p>
      <router-link to="/stats/batting" class="text-ibc-red font-bold hover:underline">Browse stats &rarr;</router-link>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="bg-ibc-navy text-white">
        <div class="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-10 flex items-center gap-5">
          <img
            v-if="career.roster"
            :src="career.roster.photo_path || placeholderPlayer"
            alt=""
            class="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-full border-2 border-white/20 shrink-0"
          />
          <div class="min-w-0">
            <h1 class="text-2xl sm:text-4xl font-black uppercase tracking-widest text-white break-words">
              {{ career.name }}
            </h1>
            <p class="text-ibc-gold font-bold mt-1">
              <span v-if="career.roster?.player_number != null">#{{ career.roster.player_number }} · </span>{{ latest }}
            </p>
          </div>
        </div>
      </div>

      <div class="max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-10">
        <p v-if="!career.seasons.length" class="text-slate-600">No stats on file yet.</p>

        <!-- Batting -->
        <section v-if="battingSeasons.length" class="bg-white rounded-lg shadow overflow-hidden">
          <h2 class="bg-ibc-navy text-white px-4 sm:px-8 py-4 text-xl font-black uppercase tracking-wide">Batting</h2>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-slate-100 border-b-2 border-ibc-navy">
                  <th :class="thFirst">Season</th>
                  <th :class="th">Team</th>
                  <th :class="th">Avg</th>
                  <th :class="th">AB</th>
                  <th :class="th">H</th>
                  <th :class="th">2B</th>
                  <th :class="th">3B</th>
                  <th :class="th">HR</th>
                  <th :class="th">R</th>
                  <th :class="th">RBI</th>
                  <th :class="th">SB</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in battingSeasons" :key="`${s.league}-${s.season}-${s.year}`" class="border-b border-slate-200">
                  <td :class="tdFirst" class="font-semibold text-ibc-navy">{{ seasonLabel(s) }}</td>
                  <td :class="td">{{ s.league }}</td>
                  <td :class="td" class="font-bold text-ibc-red">{{ formatAvg(s.batting!.avg) }}</td>
                  <td :class="td">{{ n(s.batting!.at_bats) }}</td>
                  <td :class="td">{{ n(s.batting!.hits) }}</td>
                  <td :class="td">{{ n(s.batting!.doubles) }}</td>
                  <td :class="td">{{ n(s.batting!.triples) }}</td>
                  <td :class="td">{{ n(s.batting!.home_runs) }}</td>
                  <td :class="td">{{ n(s.batting!.runs) }}</td>
                  <td :class="td">{{ n(s.batting!.rbis) }}</td>
                  <td :class="td">{{ n(s.batting!.stolen_bases) }}</td>
                </tr>
                <tr v-if="battingSeasons.length > 1" class="bg-slate-50 font-bold">
                  <td :class="tdFirst" class="text-ibc-navy">Career</td>
                  <td :class="td"></td>
                  <td :class="td" class="text-ibc-red">{{ formatAvg(battingTotals.avg) }}</td>
                  <td :class="td">{{ battingTotals.at_bats }}</td>
                  <td :class="td">{{ battingTotals.hits }}</td>
                  <td :class="td">{{ battingTotals.doubles }}</td>
                  <td :class="td">{{ battingTotals.triples }}</td>
                  <td :class="td">{{ battingTotals.home_runs }}</td>
                  <td :class="td">{{ battingTotals.runs }}</td>
                  <td :class="td">{{ battingTotals.rbis }}</td>
                  <td :class="td">{{ battingTotals.stolen_bases }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Pitching -->
        <section v-if="pitchingSeasons.length" class="bg-white rounded-lg shadow overflow-hidden">
          <h2 class="bg-ibc-navy text-white px-4 sm:px-8 py-4 text-xl font-black uppercase tracking-wide">Pitching</h2>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-slate-100 border-b-2 border-ibc-navy">
                  <th :class="thFirst">Season</th>
                  <th :class="th">Team</th>
                  <th :class="th" title="(Strikeouts − walks) ÷ batters faced">K-BB%</th>
                  <th :class="th" title="Share of all pitches that were strikes">Strike %</th>
                  <th :class="th" title="First-pitch strike percentage">FPS %</th>
                  <th :class="th" title="Innings pitched">IP</th>
                  <th :class="th" title="Batters faced">BF</th>
                  <th :class="th">K</th>
                  <th :class="th">BB</th>
                  <th :class="th">H</th>
                  <th :class="th">W-L</th>
                  <th :class="th">SV</th>
                  <th :class="th">ERA</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in pitchingSeasons" :key="`${s.league}-${s.season}-${s.year}`" class="border-b border-slate-200">
                  <td :class="tdFirst" class="font-semibold text-ibc-navy">{{ seasonLabel(s) }}</td>
                  <td :class="td">{{ s.league }}</td>
                  <td :class="td" class="font-bold text-ibc-red">{{ formatRate(kbbOf(s)) }}</td>
                  <td :class="td">{{ formatPct(s.pitching!.strike_pct) }}</td>
                  <td :class="td">{{ formatPct(s.pitching!.first_pitch_strike_pct) }}</td>
                  <td :class="td">{{ formatIp(s.pitching!.innings_pitched) }}</td>
                  <td :class="td">{{ s.pitching!.batters_faced ?? '–' }}</td>
                  <td :class="td">{{ n(s.pitching!.strikeouts) }}</td>
                  <td :class="td">{{ n(s.pitching!.walks) }}</td>
                  <td :class="td">{{ n(s.pitching!.hits_allowed) }}</td>
                  <td :class="td">{{ n(s.pitching!.wins) }}-{{ n(s.pitching!.losses) }}</td>
                  <td :class="td">{{ n(s.pitching!.saves) }}</td>
                  <td :class="td" class="text-slate-500">{{ formatEra(s.pitching!.era) }}</td>
                </tr>
                <!-- No career ERA: earned runs are not stored, only each season's ERA. -->
                <tr v-if="pitchingSeasons.length > 1" class="bg-slate-50 font-bold">
                  <td :class="tdFirst" class="text-ibc-navy">Career</td>
                  <td :class="td"></td>
                  <td :class="td" class="text-ibc-red">{{ formatRate(pitchingTotals.kbb) }}</td>
                  <td :class="td">{{ formatPct(pitchingTotals.strikePct) }}</td>
                  <td :class="td">–</td>
                  <td :class="td">{{ pitchingTotals.ip }}</td>
                  <td :class="td">{{ pitchingTotals.bf }}</td>
                  <td :class="td">{{ pitchingTotals.k }}</td>
                  <td :class="td">{{ pitchingTotals.bb }}</td>
                  <td :class="td">{{ pitchingTotals.h }}</td>
                  <td :class="td">{{ pitchingTotals.w }}-{{ pitchingTotals.l }}</td>
                  <td :class="td">{{ pitchingTotals.sv }}</td>
                  <td :class="td">–</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </template>
  </div>
</template>
