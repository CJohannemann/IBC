<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { getSchedule, type ScheduleEntry } from '@/api/schedule'
import { getNews, type NewsArticle } from '@/api/news'
import { getTeams, type Team } from '@/api/teams'
import { getPlayers, type Player } from '@/api/players'
import { useSportStore } from '@/stores/sport'
import logo from '@/assets/Logo2.png'

const sportStore = useSportStore()

const entries = ref<ScheduleEntry[]>([])
const articles = ref<NewsArticle[]>([])
const teams = ref<Team[]>([])
const players = ref<Player[]>([])

// One failing section should not blank the whole page, so each request is
// settled on its own and a failure just leaves that list empty.
async function loadHome() {
  const sport = sportStore.activeSport

  const [schedule, news, teamList, playerList] = await Promise.allSettled([
    getSchedule({ sport }),
    getNews(sport),
    getTeams(sport),
    getPlayers(),
  ])

  if (schedule.status === 'fulfilled') entries.value = schedule.value
  if (news.status === 'fulfilled') articles.value = news.value
  if (teamList.status === 'fulfilled') teams.value = teamList.value
  if (playerList.status === 'fulfilled') {
    players.value = playerList.value.filter((p) => p.sport === sport)
  }
}

onMounted(loadHome)
watch(() => sportStore.activeSport, loadHome)

// Dates are stored as YYYY-MM-DD, which compares correctly as text - no
// parsing needed, and no timezone to shift the day out from under us.
const today = new Date()
const todayStr = [
  today.getFullYear(),
  String(today.getMonth() + 1).padStart(2, '0'),
  String(today.getDate()).padStart(2, '0'),
].join('-')

const upcoming = computed(() =>
  entries.value
    .filter((e) => e.date >= todayStr)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 3)
)

const latestNews = computed(() => articles.value.slice(0, 3))

const leagues = computed(() =>
  [...new Set(teams.value.map((t) => t.league))].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true })
  )
)

const playerCount = computed(() => players.value.length)

const gameCount = computed(
  () => entries.value.filter((e) => e.type === 'Game').length
)

const formatEventDate = (dateStr: string) => {
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

const formatNewsDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

const excerpt = (content: string, limit = 140) => {
  const text = content.replace(/\s+/g, ' ').trim()
  return text.length > limit ? text.slice(0, limit).trimEnd() + '…' : text
}
</script>

<template>
  <div class="bg-ibc-cream">
    <!-- ================= HERO ================= -->
    <!-- To drop in a team photo later: put it behind this section with
         bg-cover bg-center and keep the dark overlay for text contrast. -->
    <section class="relative bg-ibc-navy overflow-hidden">
      <!-- Faint chalk-line texture so the block is not flat navy -->
      <div
        class="absolute inset-0 opacity-[0.07]"
        style="background-image: repeating-linear-gradient(-45deg, #fff 0 2px, transparent 2px 22px)"
      />
      <div class="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-ibc-red/20 blur-3xl" />

      <div class="relative max-w-5xl mx-auto px-6 py-20 sm:py-28 text-center">
        <img
          :src="logo"
          alt="Independence Baseball Club"
          class="h-24 w-24 sm:h-32 sm:w-32 object-contain mx-auto mb-8 rounded-full drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
        />
        <h1 class="text-4xl sm:text-6xl font-black text-white uppercase tracking-tight leading-none">
          Independence
        </h1>
        <p class="mt-3 text-ibc-red font-bold uppercase text-sm sm:text-lg tracking-[0.3em]">
          Baseball Club
        </p>
        <p class="mt-8 text-white/70 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed">
          Developing confident athletes, strong leaders, and outstanding
          teammates in Northern Kentucky.
        </p>

        <div class="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <router-link
            to="/schedule"
            class="px-8 py-4 bg-ibc-red text-white rounded font-black uppercase tracking-widest text-sm hover:bg-red-600 transition"
          >
            View Schedule
          </router-link>
          <router-link
            to="/news"
            class="px-8 py-4 border-2 border-white/30 text-white rounded font-black uppercase tracking-widest text-sm hover:bg-white/10 transition"
          >
            Latest News
          </router-link>
        </div>
      </div>

      <!-- Stat band across the base of the hero -->
      <div class="relative border-t border-white/10 bg-black/20">
        <div class="max-w-5xl mx-auto px-6 py-6 grid grid-cols-3 divide-x divide-white/10 text-center">
          <div>
            <div class="text-2xl sm:text-4xl font-black text-white">
              {{ leagues.length || '—' }}
            </div>
            <div class="text-[10px] sm:text-xs text-white/50 uppercase tracking-widest mt-1">
              Teams
            </div>
          </div>
          <div>
            <div class="text-2xl sm:text-4xl font-black text-white">
              {{ playerCount || '—' }}
            </div>
            <div class="text-[10px] sm:text-xs text-white/50 uppercase tracking-widest mt-1">
              Players
            </div>
          </div>
          <div>
            <div class="text-2xl sm:text-4xl font-black text-white">
              {{ gameCount || '—' }}
            </div>
            <div class="text-[10px] sm:text-xs text-white/50 uppercase tracking-widest mt-1">
              Games
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ================= NEXT UP ================= -->
    <section v-if="upcoming.length" class="max-w-5xl mx-auto px-4 sm:px-8 py-14">
      <div class="flex items-end justify-between gap-4 mb-6">
        <h2 class="text-2xl sm:text-3xl font-black text-ibc-navy uppercase tracking-widest">
          Next Up
        </h2>
        <router-link to="/schedule" class="text-ibc-red font-bold text-sm hover:underline shrink-0">
          Full schedule &rarr;
        </router-link>
      </div>

      <div class="grid gap-4 sm:grid-cols-3">
        <router-link
          v-for="entry in upcoming"
          :key="entry.id"
          to="/schedule"
          class="bg-white rounded-lg shadow border-l-4 p-5 hover:shadow-lg transition"
          :class="entry.type === 'Practice' ? 'border-blue-600' : 'border-ibc-red'"
        >
          <div class="flex items-center gap-2 mb-3">
            <span
              class="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded text-white"
              :class="entry.type === 'Practice' ? 'bg-blue-600' : 'bg-ibc-red'"
            >
              {{ entry.type }}
            </span>
            <span class="text-sm font-bold text-ibc-navy">{{ entry.league }}</span>
          </div>
          <div class="text-lg font-black text-ibc-navy">
            {{ formatEventDate(entry.date) }}
          </div>
          <div class="text-sm text-slate-600">{{ formatTime(entry.time) }}</div>
          <div class="text-xs text-slate-500 mt-2">
            {{ entry.location || 'Location TBD' }}
          </div>
          <div v-if="entry.opponent" class="text-xs text-slate-500 mt-1">
            vs {{ entry.opponent }}
          </div>
        </router-link>
      </div>
    </section>

    <!-- ================= LATEST NEWS ================= -->
    <section v-if="latestNews.length" class="bg-white border-y border-slate-200">
      <div class="max-w-5xl mx-auto px-4 sm:px-8 py-14">
        <div class="flex items-end justify-between gap-4 mb-6">
          <h2 class="text-2xl sm:text-3xl font-black text-ibc-navy uppercase tracking-widest">
            Latest News
          </h2>
          <router-link to="/news" class="text-ibc-red font-bold text-sm hover:underline shrink-0">
            All news &rarr;
          </router-link>
        </div>

        <div class="grid gap-6 sm:grid-cols-3">
          <router-link v-for="article in latestNews" :key="article.id" to="/news" class="group">
            <div class="aspect-[16/10] rounded-lg overflow-hidden bg-ibc-navy/5 mb-3">
              <img
                v-if="article.image_path"
                :src="article.image_path"
                :alt="article.title"
                class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center text-ibc-navy/20 text-4xl font-black"
              >
                IBC
              </div>
            </div>
            <div class="text-xs text-slate-500 uppercase tracking-widest">
              {{ formatNewsDate(article.created_at) }}
            </div>
            <h3 class="font-black text-ibc-navy leading-snug mt-1 group-hover:text-ibc-red transition">
              {{ article.title }}
            </h3>
            <p class="text-sm text-slate-600 mt-2 leading-relaxed">
              {{ excerpt(article.content) }}
            </p>
          </router-link>
        </div>
      </div>
    </section>

    <!-- ================= TEAMS ================= -->
    <section v-if="leagues.length" class="max-w-5xl mx-auto px-4 sm:px-8 py-14">
      <h2 class="text-2xl sm:text-3xl font-black text-ibc-navy uppercase tracking-widest mb-6">
        Our Teams
      </h2>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <router-link
          v-for="league in leagues"
          :key="league"
          :to="`/teams/${league}`"
          class="bg-ibc-navy text-white rounded-lg p-6 text-center hover:bg-[#16324f] transition group"
        >
          <div class="text-3xl font-black group-hover:text-ibc-red transition">
            {{ league }}
          </div>
          <div class="text-[10px] uppercase tracking-widest text-white/50 mt-1">
            Roster
          </div>
        </router-link>
      </div>
    </section>

    <!-- ================= WHO WE ARE ================= -->
    <section class="bg-ibc-navy">
      <div class="max-w-3xl mx-auto px-6 py-16 text-center">
        <h2 class="text-2xl sm:text-3xl font-black text-white uppercase tracking-widest mb-6">
          Who We Are
        </h2>
        <p class="text-white/70 text-base sm:text-lg leading-relaxed">
          We are a youth baseball organization in Northern Kentucky that is
          committed to developing confident athletes, strong leaders, and
          outstanding teammates through competitive baseball, character
          development, and family-first culture.
        </p>
      </div>
    </section>
  </div>
</template>
