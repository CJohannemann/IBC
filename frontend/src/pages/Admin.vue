<template>
  <div class="min-h-screen flex items-start justify-center p-8">
    <!-- Admin UI (login removed) -->
    <div class="w-full max-w-4xl">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-black">Admin</h1>
      </div>

      <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <!-- Add Player card -->
        <button @click="openAddModal"
          class="bg-white rounded-lg shadow p-4 w-40 flex flex-col items-center justify-center hover:shadow-lg transition text-left">
          <div class="mt-4 font-bold text-ibc-navy">Add Player</div>
        </button>

        <!-- Edit Player card -->
        <button @click="openEditModal"
          class="bg-white rounded-lg shadow p-4 w-40 flex flex-col items-center justify-center hover:shadow-lg transition text-left">
          <div class="mt-4 font-bold text-ibc-navy">Edit Player</div>
        </button>

        <!-- Delete Player card -->
        <button @click="openDeleteModal"
          class="bg-white rounded-lg shadow p-4 w-40 flex flex-col items-center justify-center hover:shadow-lg transition text-left">
          <div class="mt-4 font-bold text-ibc-navy">Delete Player</div>
        </button>
      </div>

      <!-- Add Player Modal -->
      <Teleport to="body">
        <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          @click="closeModal">
          <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6" @click.stop>
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="text-2xl font-black text-ibc-navy">Add Player</h3>
                <div class="text-sm text-slate-600">Fill player details and click Create</div>
              </div>
              <button @click="closeModal" class="text-slate-400 hover:text-slate-600 text-2xl">×</button>
            </div>

            <form @submit.prevent="modalSubmit" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold">Player Number</label>
                  <input v-model.number="modalForm.player_number" type="number"
                    class="mt-1 block w-full p-2 border rounded" required />
                </div>
                <div>
                  <label class="block text-sm font-semibold">League</label>
                  <input v-model="modalForm.league" type="text" class="mt-1 block w-full p-2 border rounded"
                    placeholder="e.g., 14u" required />
                </div>
                <div>
                  <label class="block text-sm font-semibold">Season</label>
                  <input v-model="modalForm.season" type="text" class="mt-1 block w-full p-2 border rounded"
                    placeholder="e.g., Fall" required />
                </div>
                <div>
                  <label class="block text-sm font-semibold">Year</label>
                  <input v-model.number="modalForm.year" type="number" class="mt-1 block w-full p-2 border rounded"
                    required />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold">First name</label>
                  <input v-model="modalForm.first_name" type="text" class="mt-1 block w-full p-2 border rounded"
                    required />
                </div>
                <div>
                  <label class="block text-sm font-semibold">Last name</label>
                  <input v-model="modalForm.last_name" type="text" class="mt-1 block w-full p-2 border rounded"
                    required />
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold">Bio</label>
                <textarea v-model="modalForm.bio" class="mt-1 block w-full p-2 border rounded" rows="3"></textarea>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold">Favorite food</label>
                  <input v-model="modalForm.favorite_food" type="text" class="mt-1 block w-full p-2 border rounded" />
                </div>
                <div>
                  <label class="block text-sm font-semibold">Favorite movie</label>
                  <input v-model="modalForm.favorite_movie" type="text" class="mt-1 block w-full p-2 border rounded" />
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold">Photo path (optional)</label>
                <input v-model="modalForm.photo_path" type="text" class="mt-1 block w-full p-2 border rounded"
                  placeholder="/uploads/players/..." />
              </div>

              <div class="flex justify-end gap-3 pt-2">
                <button type="button" @click="closeModal" class="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" class="px-4 py-2 bg-ibc-navy text-white rounded">Create</button>
              </div>

              <div v-if="modalMessage" :class="modalMsgClass" class="mt-2 p-2 rounded">{{ modalMessage }}</div>
            </form>
          </div>
        </div>
      </Teleport>

      <!--Delete Player Modal-->
      <div v-if="showDeleteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click="closeDeleteModal">

      </div>
      <!-- Edit Player Modal (placeholder) -->
      <Teleport to="body">
        <div v-if="showEditModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          @click="closeEditModal">
          <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6" @click.stop>
            <div>
              <label class="block text-sm font-medium mb-1">
                Select Player
              </label>

              <select v-model="selectedEditPlayerId" @change="loadEditPlayer" class="w-full border rounded p-2">
                <option disabled value="">
                  Choose a player
                </option>

                <option v-for="player in players" :key="player.id" :value="player.id">
                  #{{ player.player_number }} - {{ player.first_name }} {{ player.last_name }}
                </option>
              </select>
            </div>
            <!-- Edit Form -->
            <div v-if="selectedEditPlayerId" class="space-y-4 mt-4">

              <div class="grid grid-cols-2 gap-4">

                <div>
                  <label class="block text-sm font-medium mb-1">
                    Player Number
                  </label>

                  <input v-model="editPlayer.player_number" class="w-full border rounded p-2 bg-gray-100" readonly />
                </div>

                <div>
                  <label class="block text-sm font-medium mb-1">
                    Year
                  </label>

                  <input type="number" v-model="editPlayer.year" class="w-full border rounded p-2" />
                </div>

              </div>

              <div class="grid grid-cols-2 gap-4">

                <div>
                  <label class="block text-sm font-medium mb-1">
                    First Name
                  </label>

                  <input v-model="editPlayer.first_name" class="w-full border rounded p-2" />
                </div>

                <div>
                  <label class="block text-sm font-medium mb-1">
                    Last Name
                  </label>

                  <input v-model="editPlayer.last_name" class="w-full border rounded p-2" />
                </div>

              </div>

              <div class="grid grid-cols-2 gap-4">

                <div>
                  <label class="block text-sm font-medium mb-1">
                    League
                  </label>

                  <input v-model="editPlayer.league" class="w-full border rounded p-2" />
                </div>

                <div>
                  <label class="block text-sm font-medium mb-1">
                    Season
                  </label>

                  <select v-model="editPlayer.season" class="w-full border rounded p-2">
                    <option>Spring</option>
                    <option>Summer</option>
                    <option>Fall</option>
                  </select>
                </div>

              </div>

              <div>
                <label class="block text-sm font-medium mb-1">
                  Favorite Food
                </label>

                <input v-model="editPlayer.favorite_food" class="w-full border rounded p-2" />
              </div>

              <div>
                <label class="block text-sm font-medium mb-1">
                  Favorite Movie
                </label>

                <input v-model="editPlayer.favorite_movie" class="w-full border rounded p-2" />
              </div>

              <div>
                <label class="block text-sm font-medium mb-1">
                  Photo Path
                </label>

                <input v-model="editPlayer.photo_path" class="w-full border rounded p-2" />
              </div>

              <div>
                <label class="block text-sm font-medium mb-1">
                  Bio
                </label>

                <textarea v-model="editPlayer.bio" rows="4" class="w-full border rounded p-2" />
              </div>

            </div>

            <div class="flex justify-end gap-2 pt-4">

              <button @click="closeEditModal" class="px-4 py-2 border rounded">
                Cancel
              </button>

              <button @click="savePlayer" class="px-4 py-2 bg-ibc-red text-white rounded"
              >
                Save Changes
              </button>

            </div>

          </div>
        </div>
      </Teleport>


    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'

//****Edit Player Items****
interface PlayerForm {
  id: number | null
  player_number: number | null
  first_name: string
  last_name: string
  favorite_food: string
  favorite_movie: string
  bio: string
  photo_path: string
  league: string
  season: string
  year: number | null
}

const editPlayer = reactive<PlayerForm>({
  id: null,
  player_number: null,
  first_name: '',
  last_name: '',
  favorite_food: '',
  favorite_movie: '',
  bio: '',
  photo_path: '',
  league: '',
  season: '',
  year: null
})

const loadEditPlayer = () => {
  const player = players.value.find(
    p => p.id === selectedEditPlayerId.value
  )

  if (player) {
    Object.assign(editPlayer, player)
  }
}

const savePlayer = async () => {
  console.log("Saving:", editPlayer)

  try {
    const response = await fetch(`/api/players/${editPlayer.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(editPlayer)
    })

    console.log("Response status:", response.status)

    const data = await response.json()
    console.log("Response:", data)

  } catch (error) {
    console.error("Save error:", error)
  }

  closeEditModal()
}
//***********************

//**** Create Player ******/
interface NewPlayerForm {
  player_number: number | null
  first_name: string
  last_name: string
  favorite_food: string
  favorite_movie: string
  bio: string
  photo_path: string
  league: string
  season: string
  year: number | null
}

const modalForm = reactive<NewPlayerForm>({
  player_number: null,
  first_name: '',
  last_name: '',
  favorite_food: '',
  favorite_movie: '',
  bio: '',
  photo_path: '',
  league: '',
  season: '',
  year: null
})
//***********************
const players = ref<any[]>([])
console.log(players)
const selectedEditPlayerId = ref<number | null>(null)


async function loadPlayers() {
  const res = await fetch('/api/players')
  players.value = await res.json()
}

onMounted(() => {
  loadPlayers()
})

const showModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const modalMessage = ref('')
const modalMsgClass = ref('')

function resetModalForm() {
  modalForm.player_number = 0
  modalForm.first_name = ''
  modalForm.last_name = ''
  modalForm.favorite_food = ''
  modalForm.favorite_movie = ''
  modalForm.bio = ''
  modalForm.photo_path = ''
  modalForm.league = ''
  modalForm.season = ''
  modalForm.year = new Date().getFullYear()
  modalMessage.value = ''
  modalMsgClass.value = ''
}

function openAddModal() {
  resetModalForm()
  showModal.value = true
}

function openEditModal() {
  showEditModal.value = true
}

function openDeleteModal() {
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
}

function closeEditModal() {
  showEditModal.value = false
}

function closeModal() {
  showModal.value = false
  modalMessage.value = ''
}

const modalSubmit = async () => {
  try {
    console.log("Submitting:", modalForm)

    const response = await fetch('/api/players', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(modalForm)
    })

    console.log("POST status:", response.status)

    const result = await response.json()

    console.log("Server response:", result)

    await loadPlayers()
    closeModal()

  } catch (err) {
    console.error("Create player error:", err)
  }
}
</script>
