<script setup lang="ts">
import { ref, computed } from 'vue'

interface Game {
  id: string
  team: string
  time: string
  location: string
  address: string
  city: string
  state: string
  zip: string
}

// Mock game data - replace with API call
const games: Record<string, Game[]> = {
  '2026-07-04': [
    {
      id: '1',
      team: '10U',
      time: '6:30 PM',
      location: 'Central Park Field',
      address: '123 Main St',
      city: 'Your City',
      state: 'ST',
      zip: '12345',
    },
  ],
  '2026-07-11': [
    {
      id: '2',
      team: '14U',
      time: '7:00 PM',
      location: 'Lincoln Field',
      address: '456 Oak Ave',
      city: 'Your City',
      state: 'ST',
      zip: '12345',
    },
    {
      id: '3',
      team: '10U',
      time: '5:30 PM',
      location: 'Central Park Field',
      address: '123 Main St',
      city: 'Your City',
      state: 'ST',
      zip: '12345',
    },
  ],
  '2026-07-18': [
    {
      id: '4',
      team: '14U',
      time: '6:30 PM',
      location: 'Lincoln Field',
      address: '456 Oak Ave',
      city: 'Your City',
      state: 'ST',
      zip: '12345',
    },
  ],
}

const currentDate = ref(new Date(2026, 6, 1)) // July 2026
const selectedGame = ref<Game | null>(null)
const showModal = ref(false)

const monthYear = computed(() => {
  const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' }
  return currentDate.value.toLocaleDateString('en-US', options)
})

const daysInMonth = computed(() => {
  return new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0).getDate()
})

const firstDayOfMonth = computed(() => {
  return new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1).getDay()
})

const calendarDays = computed(() => {
  const days = []
  for (let i = 0; i < firstDayOfMonth.value; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth.value; i++) {
    days.push(i)
  }
  return days
})

const getGamesForDay = (day: number | null) => {
  if (!day) return []
  const dateStr = `${currentDate.value.getFullYear()}-${String(currentDate.value.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  return games[dateStr] || []
}

const openGameDetails = (game: Game) => {
  selectedGame.value = game
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedGame.value = null
}

const previousMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1)
}

const nextMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  )
}

const getAllGamesForMonth = computed(() => {
  const allGames: Array<{ date: string; games: Game[] }> = []
  const entries = Object.entries(games).sort()
  for (const [date, gameList] of entries) {
    allGames.push({ date, games: gameList })
  }
  return allGames
})

const formatDateForList = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="min-h-screen bg-ibc-cream py-12 px-8">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <h1 class="text-4xl font-black text-ibc-navy uppercase tracking-widest mb-8">Schedule</h1>

      <!-- Month Navigation -->
      <div class="bg-white rounded-lg shadow p-6 mb-8">
        <div class="flex items-center justify-between mb-6">
          <button
            @click="previousMonth"
            class="px-4 py-2 bg-ibc-navy text-white rounded font-semibold hover:bg-ibc-blue transition"
          >
            ← Previous
          </button>
          <h2 class="text-2xl font-black text-ibc-navy">{{ monthYear }}</h2>
          <button
            @click="nextMonth"
            class="px-4 py-2 bg-ibc-navy text-white rounded font-semibold hover:bg-ibc-blue transition"
          >
            Next →
          </button>
        </div>

        <!-- DESKTOP: Calendar Grid -->
        <div class="hidden md:grid grid-cols-7 gap-2">
          <!-- Day headers -->
          <div
            v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']"
            :key="day"
            class="text-center font-bold text-ibc-navy py-2 text-sm"
          >
            {{ day }}
          </div>

          <!-- Calendar cells -->
          <div
            v-for="(day, idx) in calendarDays"
            :key="idx"
            class="min-h-24 border border-slate-200 bg-white rounded p-2 overflow-hidden"
            :class="{ 'bg-slate-50': !day }"
          >
            <div v-if="day" class="text-sm font-bold text-ibc-navy mb-1">{{ day }}</div>

            <!-- Games for this day -->
            <div v-if="day" class="space-y-1">
              <button
                v-for="game in getGamesForDay(day)"
                :key="game.id"
                @click="openGameDetails(game)"
                class="block w-full text-left text-xs bg-ibc-red text-white p-1.5 rounded hover:bg-ibc-gold transition cursor-pointer font-semibold truncate"
              >
                {{ game.team }} - {{ game.time }}
              </button>
            </div>
          </div>
        </div>

        <!-- MOBILE: List View -->
        <div class="md:hidden space-y-3">
          <div v-if="getAllGamesForMonth.length === 0" class="text-center text-slate-500 py-8">
            <p>No games scheduled for this month</p>
          </div>

          <div
            v-for="dayGroup in getAllGamesForMonth"
            :key="dayGroup.date"
            class="space-y-2"
          >
            <!-- Date Header -->
            <div class="text-sm font-bold text-ibc-navy bg-slate-100 px-4 py-2 rounded">
              {{ formatDateForList(dayGroup.date) }}
            </div>

            <!-- Games for this date -->
            <button
              v-for="game in dayGroup.games"
              :key="game.id"
              @click="openGameDetails(game)"
              class="w-full flex items-center justify-between bg-white border-l-4 border-ibc-red p-4 rounded hover:shadow-lg transition cursor-pointer"
            >
              <div class="text-left">
                <div class="font-bold text-ibc-navy">{{ game.team }} Team</div>
                <div class="text-sm text-slate-600">{{ game.time }}</div>
                <div class="text-xs text-slate-500">{{ game.location }}</div>
              </div>
              <div class="text-ibc-red text-xl">→</div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Game Details Modal -->
    <Teleport to="body">
      <div
        v-if="showModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click="closeModal"
      >
        <div
          class="bg-white rounded-lg shadow-xl max-w-sm w-full p-8"
          @click.stop
        >
          <div class="flex items-start justify-between mb-6">
            <div>
              <h3 class="text-2xl font-black text-ibc-navy">{{ selectedGame?.team }} Game</h3>
              <p class="text-ibc-red font-bold">{{ selectedGame?.time }}</p>
            </div>
            <button
              @click="closeModal"
              class="text-slate-400 hover:text-slate-600 text-2xl"
            >
              ×
            </button>
          </div>

          <!-- Address Card -->
          <div class="bg-ibc-navy text-white p-6 rounded-lg mb-6">
            <h4 class="font-bold text-lg mb-3">{{ selectedGame?.location }}</h4>
            <div class="space-y-1 text-sm mb-6 pb-6 border-b border-white/20">
              <p>{{ selectedGame?.address }}</p>
              <p>{{ selectedGame?.city }}, {{ selectedGame?.state }} {{ selectedGame?.zip }}</p>
            </div>

            <!-- Uniform Section -->
            <div>
              <h5 class="font-bold text-sm uppercase tracking-wide mb-3">Uniform</h5>
              <div class="space-y-2 text-sm">
                <div class="flex items-center">
                  <span class="w-20">Shirt</span>
                  <div class="w-5 h-5 bg-blue-500 rounded border border-white/30"></div>
                  <span class="ml-2">Blue</span>
                </div>
                <div class="flex items-center">
                  <span class="w-20">Pants</span>
                  <div class="w-5 h-5 bg-white rounded border border-white/30"></div>
                  <span class="ml-2">White</span>
                </div>
                <div class="flex items-center">
                  <span class="w-20">Hat</span>
                  <div class="w-5 h-5 bg-ibc-red rounded border border-white/30"></div>
                  <span class="ml-2">Red</span>
                </div>
              </div>
            </div>
          </div>

          <button
            @click="closeModal"
            class="w-full bg-ibc-red text-white font-bold py-2 rounded hover:bg-ibc-gold transition"
          >
            Close
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>
