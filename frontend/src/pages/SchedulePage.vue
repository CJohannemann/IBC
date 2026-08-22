<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { getSchedule, type ScheduleEntry } from '@/api/schedule'
import { useSportStore } from '@/stores/sport'
import { mapsUrl } from '@/lib/maps'

const sportStore = useSportStore()

const entries = ref<ScheduleEntry[]>([])

async function loadSchedule() {
  try {
    entries.value = await getSchedule({ sport: sportStore.activeSport })
  } catch (e) {
    console.error('Failed to load schedule:', e)
  }
}

onMounted(loadSchedule)
watch(() => sportStore.activeSport, loadSchedule)

const currentDate = ref(new Date())
const selectedEntry = ref<ScheduleEntry | null>(null)
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
  const days: (number | null)[] = []
  for (let i = 0; i < firstDayOfMonth.value; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth.value; i++) {
    days.push(i)
  }
  return days
})

const getEntriesForDay = (day: number | null) => {
  if (!day) return []
  const dateStr = `${currentDate.value.getFullYear()}-${String(currentDate.value.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  return entries.value.filter(e => e.date === dateStr)
}

const entryColor = (type: string) => {
  return type === 'Practice' ? 'bg-blue-600' : 'bg-ibc-red'
}

const entryBorder = (type: string) => {
  return type === 'Practice' ? 'border-blue-600' : 'border-ibc-red'
}

const openEntryDetails = (entry: ScheduleEntry) => {
  selectedEntry.value = entry
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedEntry.value = null
}

const previousMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

const entriesForMonth = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = String(currentDate.value.getMonth() + 1).padStart(2, '0')
  const prefix = `${year}-${month}`
  return entries.value
    .filter(e => e.date.startsWith(prefix))
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
})

const groupedByDate = computed(() => {
  const groups: Array<{ date: string; entries: ScheduleEntry[] }> = []
  let currentGroup: { date: string; entries: ScheduleEntry[] } | null = null

  for (const entry of entriesForMonth.value) {
    if (!currentGroup || currentGroup.date !== entry.date) {
      currentGroup = { date: entry.date, entries: [] }
      groups.push(currentGroup)
    }
    currentGroup.entries.push(entry)
  }
  return groups
})

const formatDateForList = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

const formatTime = (time: string) => {
  const [h, m] = time.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${displayHour}:${m} ${ampm}`
}
</script>

<template>
  <div class="min-h-screen bg-ibc-cream py-12 px-4 sm:px-8">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <h1 class="text-4xl font-black text-ibc-navy uppercase tracking-widest mb-8">Schedule</h1>

      <!-- Month Navigation -->
      <div class="bg-white rounded-lg shadow p-4 sm:p-6 mb-8">
        <div class="flex items-center justify-between gap-2 sm:gap-4 mb-6">
          <button
            @click="previousMonth"
            class="w-20 sm:w-24 shrink-0 px-2 sm:px-4 py-2 bg-ibc-navy text-white rounded text-sm sm:text-base font-semibold hover:bg-ibc-blue transition flex flex-col items-center gap-1"
          >
            <span>Previous</span>
            <span>←</span>
          </button>
          <h2 class="text-xl sm:text-2xl font-black text-ibc-navy text-center flex-1 min-w-0 break-words">{{ monthYear }}</h2>
          <button
            @click="nextMonth"
            class="w-20 sm:w-24 shrink-0 px-2 sm:px-4 py-2 bg-ibc-navy text-white rounded text-sm sm:text-base font-semibold hover:bg-ibc-blue transition flex flex-col items-center gap-1"
          >
            <span>Next</span>
            <span>→</span>
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

            <!-- Entries for this day -->
            <div v-if="day" class="space-y-1">
              <button
                v-for="entry in getEntriesForDay(day)"
                :key="entry.id"
                @click="openEntryDetails(entry)"
                class="block w-full text-left text-xs text-white p-1.5 rounded hover:opacity-80 transition cursor-pointer font-semibold truncate"
                :class="entryColor(entry.type)"
              >
                {{ entry.league }} - {{ formatTime(entry.time) }}
              </button>
            </div>
          </div>
        </div>

        <!-- MOBILE: List View -->
        <div class="md:hidden space-y-3">
          <div v-if="groupedByDate.length === 0" class="text-center text-slate-500 py-8">
            <p>No events scheduled for this month</p>
          </div>

          <div
            v-for="dayGroup in groupedByDate"
            :key="dayGroup.date"
            class="space-y-2"
          >
            <!-- Date Header -->
            <div class="text-sm font-bold text-ibc-navy bg-slate-100 px-4 py-2 rounded">
              {{ formatDateForList(dayGroup.date) }}
            </div>

            <!-- Entries for this date -->
            <button
              v-for="entry in dayGroup.entries"
              :key="entry.id"
              @click="openEntryDetails(entry)"
              class="w-full flex items-center justify-between bg-white border-l-4 p-4 rounded hover:shadow-lg transition cursor-pointer"
              :class="entryBorder(entry.type)"
            >
              <div class="text-left">
                <div class="font-bold text-ibc-navy">{{ entry.league }} {{ entry.type }}</div>
                <div class="text-sm text-slate-600">{{ formatTime(entry.time) }}</div>
                <div class="text-xs text-slate-500">{{ entry.location || 'TBD' }}</div>
              </div>
              <div class="text-ibc-red text-xl">→</div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Entry Details Modal -->
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
              <h3 class="text-2xl font-black text-ibc-navy">{{ selectedEntry?.league }} {{ selectedEntry?.type }}</h3>
              <p class="text-ibc-red font-bold">{{ selectedEntry ? formatTime(selectedEntry.time) : '' }}</p>
            </div>
            <button
              @click="closeModal"
              class="text-slate-400 hover:text-slate-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div class="space-y-4">
            <div v-if="selectedEntry?.opponent" class="flex items-center gap-2">
              <span class="text-sm font-bold text-slate-500 uppercase w-20">vs</span>
              <span class="font-semibold text-ibc-navy">{{ selectedEntry.opponent }}</span>
              <span v-if="selectedEntry.home_away" class="text-xs bg-slate-100 px-2 py-0.5 rounded">
                {{ selectedEntry.home_away }}
              </span>
            </div>

            <div v-if="selectedEntry?.location" class="flex items-start gap-2">
              <span class="text-sm font-bold text-slate-500 uppercase w-20 shrink-0">Where</span>
              <a
                :href="mapsUrl(selectedEntry.location, selectedEntry.address)"
                target="_blank"
                rel="noopener noreferrer"
                class="min-w-0 group"
              >
                <span class="text-ibc-navy underline decoration-slate-300 underline-offset-2 group-hover:text-ibc-red">
                  {{ selectedEntry.location }}
                </span>
                <span class="block text-xs font-bold text-ibc-red mt-0.5">Directions &rarr;</span>
              </a>
            </div>

            <div v-if="selectedEntry?.notes" class="flex items-start gap-2">
              <span class="text-sm font-bold text-slate-500 uppercase w-20">Notes</span>
              <span class="text-slate-700">{{ selectedEntry.notes }}</span>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-sm font-bold text-slate-500 uppercase w-20">Type</span>
              <span
                class="text-xs text-white px-2 py-0.5 rounded font-bold"
                :class="selectedEntry ? entryColor(selectedEntry.type) : ''"
              >
                {{ selectedEntry?.type }}
              </span>
            </div>

            <!-- Uniform Section -->
            <div v-if="selectedEntry?.uniform_image_path || selectedEntry?.uniform_title || selectedEntry?.jersey_color || selectedEntry?.pants_color || selectedEntry?.hat_color" class="border-t pt-4 mt-4">
              <h4 class="text-sm font-bold text-ibc-navy uppercase mb-3">Uniform</h4>

              <!-- A photo settles it faster than three colour names -->
              <div v-if="selectedEntry?.uniform_image_path" class="mb-3">
                <img :src="selectedEntry.uniform_image_path" :alt="selectedEntry.uniform_title || 'Uniform'"
                  class="w-40 h-40 object-contain rounded border bg-white" />
                <p v-if="selectedEntry.uniform_title" class="font-semibold text-ibc-navy mt-1">
                  {{ selectedEntry.uniform_title }}
                </p>
              </div>
              <p v-else-if="selectedEntry?.uniform_title" class="font-semibold text-ibc-navy mb-3">
                {{ selectedEntry.uniform_title }}
              </p>

              <div class="space-y-2">
                <div v-if="selectedEntry.jersey_color" class="flex items-center gap-3">
                  <span class="text-sm text-slate-600 w-16">Jersey</span>
                  <span class="font-semibold text-ibc-navy">{{ selectedEntry.jersey_color }}</span>
                </div>
                <div v-if="selectedEntry.pants_color" class="flex items-center gap-3">
                  <span class="text-sm text-slate-600 w-16">Pants</span>
                  <span class="font-semibold text-ibc-navy">{{ selectedEntry.pants_color }}</span>
                </div>
                <div v-if="selectedEntry.hat_color" class="flex items-center gap-3">
                  <span class="text-sm text-slate-600 w-16">Hat</span>
                  <span class="font-semibold text-ibc-navy">{{ selectedEntry.hat_color }}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            @click="closeModal"
            class="w-full mt-6 bg-ibc-red text-white font-bold py-2 rounded hover:bg-ibc-gold transition"
          >
            Close
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>
