<template>
  <div class="min-h-screen flex items-start justify-center p-8">
    <!-- Admin UI (login removed) -->
    <div class="w-full max-w-6xl">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-black text-ibc-navy">Admin Dashboard</h1>
        <div class="flex items-center gap-4 text-sm">
          <span v-if="auth.user" class="text-slate-500">
            Signed in as <span class="font-bold text-ibc-navy">{{ auth.user.username }}</span>
          </span>
          <router-link v-if="auth.isAdmin" to="/admin/users"
            class="font-semibold text-ibc-blue hover:underline">
            Accounts
          </router-link>
          <router-link to="/admin/account" class="font-semibold text-ibc-blue hover:underline">
            Account
          </router-link>
          <button @click="handleLogout" class="font-semibold text-red-600 hover:underline">
            Log out
          </button>
        </div>
      </div>

      <!-- Players Section -->
      <div class="mb-8">
        <h2 class="text-xl font-bold text-ibc-navy mb-4 pb-2 border-b-2 border-ibc-navy">Players</h2>
        <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <button @click="openAddModal"
            class="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center hover:shadow-lg transition-all hover:scale-105">
            <svg class="w-12 h-12 text-ibc-navy mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <div class="font-bold text-ibc-navy">Add Player</div>
          </button>

          <button @click="openEditModal"
            class="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center hover:shadow-lg transition-all hover:scale-105">
            <svg class="w-12 h-12 text-ibc-navy mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <div class="font-bold text-ibc-navy">Edit Player</div>
          </button>

          <button @click="openDeleteModal"
            class="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center hover:shadow-lg transition-all hover:scale-105">
            <svg class="w-12 h-12 text-red-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <div class="font-bold text-red-600">Delete Player</div>
          </button>
        </div>
      </div>

      <!-- Coaches Section -->
      <div class="mb-8">
        <h2 class="text-xl font-bold text-ibc-navy mb-4 pb-2 border-b-2 border-ibc-navy">Coaches</h2>
        <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <button @click="openAddCoachModal"
            class="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center hover:shadow-lg transition-all hover:scale-105">
            <svg class="w-12 h-12 text-ibc-navy mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <div class="font-bold text-ibc-navy">Add Coach</div>
          </button>

          <button @click="openEditCoachModal"
            class="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center hover:shadow-lg transition-all hover:scale-105">
            <svg class="w-12 h-12 text-ibc-navy mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <div class="font-bold text-ibc-navy">Edit Coach</div>
          </button>

          <button @click="openDeleteCoachModal"
            class="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center hover:shadow-lg transition-all hover:scale-105">
            <svg class="w-12 h-12 text-red-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <div class="font-bold text-red-600">Delete Coach</div>
          </button>
        </div>
      </div>

      <!-- Assistant Coaches Section -->
      <div class="mb-8">
        <h2 class="text-xl font-bold text-ibc-navy mb-4 pb-2 border-b-2 border-ibc-navy">Assistant Coaches</h2>
        <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <button @click="openAddAssistantCoachModal"
            class="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center hover:shadow-lg transition-all hover:scale-105">
            <svg class="w-12 h-12 text-ibc-navy mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <div class="font-bold text-ibc-navy">Add Assistant Coach</div>
          </button>

          <button @click="openEditAssistantCoachModal"
            class="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center hover:shadow-lg transition-all hover:scale-105">
            <svg class="w-12 h-12 text-ibc-navy mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <div class="font-bold text-ibc-navy">Edit Assistant Coach</div>
          </button>

          <button @click="openDeleteAssistantCoachModal"
            class="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center hover:shadow-lg transition-all hover:scale-105">
            <svg class="w-12 h-12 text-red-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <div class="font-bold text-red-600">Delete Assistant Coach</div>
          </button>
        </div>
      </div>

      <!-- Schedule Section -->
      <div class="mb-8">
        <h2 class="text-xl font-bold text-ibc-navy mb-4 pb-2 border-b-2 border-ibc-navy">Schedule</h2>
        <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <button @click="openScheduleModal"
            class="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center hover:shadow-lg transition-all hover:scale-105">
            <svg class="w-12 h-12 text-ibc-navy mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <div class="font-bold text-ibc-navy">Add Schedule</div>
          </button>

          <button @click="openEditScheduleModal"
            class="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center hover:shadow-lg transition-all hover:scale-105">
            <svg class="w-12 h-12 text-ibc-navy mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <div class="font-bold text-ibc-navy">Edit Schedule</div>
          </button>

          <button @click="openDeleteScheduleModal"
            class="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center hover:shadow-lg transition-all hover:scale-105">
            <svg class="w-12 h-12 text-red-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <div class="font-bold text-red-600">Delete Schedule</div>
          </button>
        </div>
      </div>

      <!-- News Section -->
      <div class="mb-8">
        <h2 class="text-xl font-bold text-ibc-navy mb-4 pb-2 border-b-2 border-ibc-navy">News</h2>
        <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <button @click="openNewsModal"
            class="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center hover:shadow-lg transition-all hover:scale-105">
            <svg class="w-12 h-12 text-ibc-navy mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <div class="font-bold text-ibc-navy">Add News</div>
          </button>

          <button @click="openEditNewsModal"
            class="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center hover:shadow-lg transition-all hover:scale-105">
            <svg class="w-12 h-12 text-ibc-navy mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <div class="font-bold text-ibc-navy">Edit News</div>
          </button>

          <button @click="openDeleteNewsModal"
            class="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center hover:shadow-lg transition-all hover:scale-105">
            <svg class="w-12 h-12 text-red-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <div class="font-bold text-red-600">Delete News</div>
          </button>
        </div>
      </div>

      <!-- Swag Section -->
      <div class="mb-8">
        <h2 class="text-xl font-bold text-ibc-navy mb-4 pb-2 border-b-2 border-ibc-navy">Swag</h2>
        <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <button @click="openSwagModal"
            class="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center hover:shadow-lg transition-all hover:scale-105">
            <svg class="w-12 h-12 text-ibc-navy mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <div class="font-bold text-ibc-navy">Add Swag</div>
          </button>

          <button @click="openEditSwagModal"
            class="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center hover:shadow-lg transition-all hover:scale-105">
            <svg class="w-12 h-12 text-ibc-navy mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <div class="font-bold text-ibc-navy">Edit Swag</div>
          </button>

          <button @click="openDeleteSwagModal"
            class="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center hover:shadow-lg transition-all hover:scale-105">
            <svg class="w-12 h-12 text-red-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <div class="font-bold text-red-600">Delete Swag</div>
          </button>
        </div>
      </div>

      <!-- Data & Files Section -->
      <div class="mb-8">
        <h2 class="text-xl font-bold text-ibc-navy mb-4 pb-2 border-b-2 border-ibc-navy">Data & Files</h2>
        <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <button @click="openStatsModal"
            class="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center hover:shadow-lg transition-all hover:scale-105">
            <svg class="w-12 h-12 text-ibc-navy mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <div class="font-bold text-ibc-navy">Upload Stats</div>
          </button>

          <button @click="openUniformModal"
            class="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center hover:shadow-lg transition-all hover:scale-105">
            <svg class="w-12 h-12 text-ibc-navy mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <div class="font-bold text-ibc-navy">Upload Uniform</div>
          </button>

          <button @click="openRecordModal"
            class="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center hover:shadow-lg transition-all hover:scale-105">
            <svg class="w-12 h-12 text-ibc-navy mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <div class="font-bold text-ibc-navy">Update Team Record</div>
          </button>
        </div>
      </div>

      <!-- Add Player Modal -->
      <Teleport to="body">
        <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          @click="closeModal">
          <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6" @click.stop>
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
                    placeholder="e.g., 12U, Softball" required @blur="modalForm.league = modalForm.league.toUpperCase()" />
                </div>
                <div>
                  <label class="block text-sm font-semibold">Season</label>
                  <select v-model="modalForm.season" class="mt-1 block w-full p-2 border rounded" required>
                    <option disabled value="">Select season</option>
                    <option v-for="s in seasonOptions" :key="s" :value="s">{{ s }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-semibold">Year</label>
                  <input v-model.number="modalForm.year" type="number" class="mt-1 block w-full p-2 border rounded"
                    required />
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold">Sport</label>
                <select v-model="modalForm.sport" class="mt-1 block w-full p-2 border rounded" required>
                  <option v-for="sp in sportStore.availableSports" :key="sp" :value="sp">{{ sp }}</option>
                </select>
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
                <label class="block text-sm font-semibold mb-2">Photo</label>
                
                <!-- Hidden file input -->
                <input
                  type="file"
                  ref="fileInputPlayerAdd"
                  accept="image/*"
                  @change="handleFileSelect($event, 'player-add')"
                  class="hidden"
                />

                <!-- Drag and drop zone -->
                <div
                  @click="triggerFileInput('player-add')"
                  @drop.prevent="handleDrop($event, 'player-add')"
                  @dragover.prevent="dragActive = true"
                  @dragleave.prevent="dragActive = false"
                  :class="{ 'border-ibc-red bg-red-50': dragActive }"
                  class="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-ibc-red transition"
                >
                  <div v-if="uploadingPlayerAdd" class="py-4">
                    <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-ibc-red"></div>
                    <p class="mt-2 text-sm text-slate-600">Uploading...</p>
                  </div>

                  <div v-else-if="modalForm.photo_path" class="relative">
                    <img :src="modalForm.photo_path" alt="Preview" class="max-h-40 mx-auto rounded" />
                    <button
                      type="button"
                      @click.stop="removeImage('player-add')"
                      class="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                    <p class="mt-2 text-xs text-slate-500">Click to change image</p>
                  </div>

                  <div v-else class="py-4">
                    <svg class="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <p class="mt-2 text-sm text-slate-600">Click or drag image here</p>
                    <p class="mt-1 text-xs text-slate-500">PNG, JPG, GIF up to 5MB</p>
                  </div>
                </div>
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
      <Teleport to="body">
        <div v-if="showDeleteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          @click="closeDeleteModal">
          <div class="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 max-h-[90vh] overflow-y-auto" @click.stop>
            <div class="flex items-start justify-between mb-4">
              <h3 class="text-2xl font-black text-ibc-navy">Delete Player</h3>
              <button @click="closeDeleteModal" class="text-slate-400 hover:text-slate-600 text-2xl">×</button>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-semibold mb-1">Select Player</label>
              <select v-model="selectedDeletePlayerId" class="w-full border rounded p-2">
                <option disabled value="">Choose a player</option>
                <option v-for="player in playerStore.players" :key="player.id" :value="player.player_number">
                  #{{ player.player_number }} - {{ player.first_name }} {{ player.last_name }}
                </option>
              </select>
            </div>

            <div v-if="selectedDeletePlayerId" class="bg-red-50 border border-red-200 rounded p-3 mb-4">
              <p class="text-sm text-red-700">
                Are you sure you want to delete
                <strong>{{ deletePlayerName }}</strong>?
                This cannot be undone.
              </p>
            </div>

            <div v-if="deleteMessage" :class="deleteMsgClass" class="mb-4 p-2 rounded text-sm">
              {{ deleteMessage }}
            </div>

            <div class="flex justify-end gap-3">
              <button @click="closeDeleteModal" class="px-4 py-2 border rounded">Cancel</button>
              <button
                @click="confirmDelete"
                :disabled="!selectedDeletePlayerId"
                class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </Teleport>
      <!-- Edit Player Modal (placeholder) -->
      <Teleport to="body">
        <div v-if="showEditModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          @click="closeEditModal">
          <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6" @click.stop>
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium mb-1">Select Team</label>
                <select v-model="editTeamKey" @change="onEditTeamChange" class="w-full border rounded p-2">
                  <option value="">Choose a team</option>
                  <option v-for="team in editTeamOptions" :key="team.key" :value="team.key">
                    {{ team.label }} ({{ team.count }})
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium mb-1">Select Player</label>
                <select v-model="selectedEditPlayerId" @change="loadEditPlayer"
                  :disabled="!editTeamKey" class="w-full border rounded p-2 disabled:bg-slate-100">
                  <option disabled value="">
                    {{ editTeamKey ? 'Choose a player' : 'Choose a team first' }}
                  </option>

                  <option v-for="player in editTeamPlayers" :key="player.id" :value="player.id">
                    #{{ player.player_number }} - {{ player.first_name }} {{ player.last_name }}
                  </option>
                </select>
              </div>
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

                  <input v-model="editPlayer.league" class="w-full border rounded p-2" @blur="editPlayer.league = editPlayer.league.toUpperCase()" />
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
                <label class="block text-sm font-medium mb-2">
                  Photo
                </label>

                <!-- Hidden file input -->
                <input
                  type="file"
                  ref="fileInputPlayerEdit"
                  accept="image/*"
                  @change="handleFileSelect($event, 'player-edit')"
                  class="hidden"
                />

                <!-- Drag and drop zone -->
                <div
                  @click="triggerFileInput('player-edit')"
                  @drop.prevent="handleDrop($event, 'player-edit')"
                  @dragover.prevent="dragActive = true"
                  @dragleave.prevent="dragActive = false"
                  :class="{ 'border-ibc-red bg-red-50': dragActive }"
                  class="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-ibc-red transition"
                >
                  <div v-if="uploadingPlayerEdit" class="py-4">
                    <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-ibc-red"></div>
                    <p class="mt-2 text-sm text-slate-600">Uploading...</p>
                  </div>

                  <div v-else-if="editPlayer.photo_path" class="relative">
                    <img :src="editPlayer.photo_path" alt="Preview" class="max-h-40 mx-auto rounded" />
                    <button
                      type="button"
                      @click.stop="removeImage('player-edit')"
                      class="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                    <p class="mt-2 text-xs text-slate-500">Click to change image</p>
                  </div>

                  <div v-else class="py-4">
                    <svg class="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <p class="mt-2 text-sm text-slate-600">Click or drag image here</p>
                    <p class="mt-1 text-xs text-slate-500">PNG, JPG, GIF up to 5MB</p>
                  </div>
                </div>
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

      <!-- Add Schedule Modal -->
      <Teleport to="body">
        <div v-if="showScheduleModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          @click="closeScheduleModal">
          <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto" @click.stop>
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="text-2xl font-black text-ibc-navy">Add Schedule Entry</h3>
                <div class="text-sm text-slate-600">Add a game or practice to the schedule</div>
              </div>
              <button @click="closeScheduleModal" class="text-slate-400 hover:text-slate-600 text-2xl">×</button>
            </div>

            <form @submit.prevent="submitSchedule" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold">Type</label>
                  <select v-model="scheduleForm.type" class="mt-1 block w-full p-2 border rounded" required>
                    <option value="Game">Game (Red)</option>
                    <option value="Practice">Practice (Blue)</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-semibold">Sport</label>
                  <select v-model="scheduleForm.sport" class="mt-1 block w-full p-2 border rounded" required>
                    <option v-for="sp in sportStore.availableSports" :key="sp" :value="sp">{{ sp }}</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold">Date</label>
                  <input v-model="scheduleForm.date" type="date" class="mt-1 block w-full p-2 border rounded" required />
                </div>
                <div>
                  <label class="block text-sm font-semibold">Time</label>
                  <input v-model="scheduleForm.time" type="time" class="mt-1 block w-full p-2 border rounded" required />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold">League</label>
                  <input v-model="scheduleForm.league" type="text" class="mt-1 block w-full p-2 border rounded"
                    placeholder="e.g., 14U" required @blur="scheduleForm.league = scheduleForm.league.toUpperCase()" />
                </div>
                <div>
                  <label class="block text-sm font-semibold">Season</label>
                  <select v-model="scheduleForm.season" class="mt-1 block w-full p-2 border rounded">
                    <option value="">—</option>
                    <option v-for="s in seasonOptions" :key="s" :value="s">{{ s }}</option>
                  </select>
                </div>
              </div>

              <div v-if="scheduleForm.type === 'Game'" class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold">Opponent</label>
                  <input v-model="scheduleForm.opponent" type="text" class="mt-1 block w-full p-2 border rounded"
                    placeholder="Team name" />
                </div>
                <div>
                  <label class="block text-sm font-semibold">Home / Away</label>
                  <select v-model="scheduleForm.home_away" class="mt-1 block w-full p-2 border rounded">
                    <option value="">—</option>
                    <option value="Home">Home</option>
                    <option value="Away">Away</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold">Location</label>
                <input v-model="scheduleForm.location" type="text" class="mt-1 block w-full p-2 border rounded"
                  placeholder="Field name or address" />
              </div>

              <div>
                <label class="block text-sm font-semibold">Notes (optional)</label>
                <textarea v-model="scheduleForm.notes" class="mt-1 block w-full p-2 border rounded" rows="2"
                  placeholder="e.g., Bring extra water"></textarea>
              </div>

              <div class="border-t pt-4 mt-4">
                <label class="block text-sm font-semibold mb-3">Uniform</label>

                <div v-if="uniforms.length" class="grid grid-cols-3 gap-3 mb-4">
                  <label v-for="u in uniforms" :key="u.id"
                    class="cursor-pointer border-2 rounded-lg p-2 flex flex-col items-center gap-1 transition"
                    :class="scheduleForm.uniform_id === u.id
                      ? 'border-ibc-navy bg-ibc-navy/5'
                      : 'border-slate-200 hover:border-slate-400'">
                    <img v-if="u.image_path" :src="u.image_path" :alt="u.title"
                      class="w-full h-20 object-contain" />
                    <div v-else
                      class="w-full h-20 flex items-center justify-center text-xs text-slate-400 bg-slate-50 rounded">
                      No photo
                    </div>
                    <div class="flex items-center gap-1">
                      <input type="radio" :value="u.id" v-model="scheduleForm.uniform_id" />
                      <span class="text-xs font-semibold text-ibc-navy text-center">{{ u.title }}</span>
                    </div>
                  </label>
                </div>

                <p v-else class="text-xs text-slate-500 mb-4">
                  No uniforms yet. Add them from the Uniform section on the dashboard.
                </p>

                <button v-if="scheduleForm.uniform_id" type="button"
                  @click="scheduleForm.uniform_id = null"
                  class="text-xs font-semibold text-slate-500 hover:underline mb-4">
                  Clear selection
                </button>

                <details class="text-sm">
                  <summary class="cursor-pointer text-xs font-semibold text-slate-500">
                    Or describe the colours instead
                  </summary>
                  <div class="grid grid-cols-3 gap-3 mt-3">
                    <div>
                      <label class="block text-xs text-slate-600 mb-1">Jersey</label>
                      <input v-model="scheduleForm.jersey_color" type="text"
                        class="block w-full p-2 border rounded text-sm" placeholder="e.g., Blue" />
                    </div>
                    <div>
                      <label class="block text-xs text-slate-600 mb-1">Pants</label>
                      <input v-model="scheduleForm.pants_color" type="text"
                        class="block w-full p-2 border rounded text-sm" placeholder="e.g., White" />
                    </div>
                    <div>
                      <label class="block text-xs text-slate-600 mb-1">Hat</label>
                      <input v-model="scheduleForm.hat_color" type="text"
                        class="block w-full p-2 border rounded text-sm" placeholder="e.g., Red" />
                    </div>
                  </div>
                </details>
              </div>

              <div v-if="scheduleMessage" :class="scheduleMsgClass" class="p-2 rounded text-sm">
                {{ scheduleMessage }}
              </div>

              <div class="flex justify-end gap-3 pt-2">
                <button type="button" @click="closeScheduleModal" class="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" class="px-4 py-2 bg-ibc-navy text-white rounded">Add to Schedule</button>
              </div>
            </form>
          </div>
        </div>
      </Teleport>

      <!-- Edit Schedule Modal -->
      <Teleport to="body">
        <div v-if="showEditScheduleModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          @click="closeEditScheduleModal">
          <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto" @click.stop>
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="text-2xl font-black text-ibc-navy">Edit Schedule Entry</h3>
                <div class="text-sm text-slate-600">Select and update an entry</div>
              </div>
              <button @click="closeEditScheduleModal" class="text-slate-400 hover:text-slate-600 text-2xl">×</button>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-semibold mb-1">Select Entry</label>
              <select v-model="selectedEditScheduleId" @change="loadEditSchedule" class="w-full border rounded p-2">
                <option disabled value="">Choose an entry</option>
                <option v-for="entry in scheduleEntries" :key="entry.id" :value="entry.id">
                  {{ entry.date }} - {{ entry.league }} {{ entry.type }}
                </option>
              </select>
            </div>

            <form v-if="selectedEditScheduleId" @submit.prevent="submitEditSchedule" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold">Type</label>
                  <select v-model="editScheduleForm.type" class="mt-1 block w-full p-2 border rounded" required>
                    <option value="Game">Game (Red)</option>
                    <option value="Practice">Practice (Blue)</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-semibold">Sport</label>
                  <select v-model="editScheduleForm.sport" class="mt-1 block w-full p-2 border rounded" required>
                    <option v-for="sp in sportStore.availableSports" :key="sp" :value="sp">{{ sp }}</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold">Date</label>
                  <input v-model="editScheduleForm.date" type="date" class="mt-1 block w-full p-2 border rounded" required />
                </div>
                <div>
                  <label class="block text-sm font-semibold">Time</label>
                  <input v-model="editScheduleForm.time" type="time" class="mt-1 block w-full p-2 border rounded" required />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold">League</label>
                  <input v-model="editScheduleForm.league" type="text" class="mt-1 block w-full p-2 border rounded"
                    placeholder="e.g., 14U" required @blur="editScheduleForm.league = editScheduleForm.league.toUpperCase()" />
                </div>
                <div>
                  <label class="block text-sm font-semibold">Season</label>
                  <select v-model="editScheduleForm.season" class="mt-1 block w-full p-2 border rounded">
                    <option value="">—</option>
                    <option v-for="s in seasonOptions" :key="s" :value="s">{{ s }}</option>
                  </select>
                </div>
              </div>

              <div v-if="editScheduleForm.type === 'Game'" class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold">Opponent</label>
                  <input v-model="editScheduleForm.opponent" type="text" class="mt-1 block w-full p-2 border rounded"
                    placeholder="Team name" />
                </div>
                <div>
                  <label class="block text-sm font-semibold">Home / Away</label>
                  <select v-model="editScheduleForm.home_away" class="mt-1 block w-full p-2 border rounded">
                    <option value="">—</option>
                    <option value="Home">Home</option>
                    <option value="Away">Away</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold">Location</label>
                <input v-model="editScheduleForm.location" type="text" class="mt-1 block w-full p-2 border rounded"
                  placeholder="Field name or address" />
              </div>

              <div>
                <label class="block text-sm font-semibold">Notes (optional)</label>
                <textarea v-model="editScheduleForm.notes" class="mt-1 block w-full p-2 border rounded" rows="2"
                  placeholder="e.g., Bring extra water"></textarea>
              </div>

              <div class="border-t pt-4 mt-4">
                <label class="block text-sm font-semibold mb-3">Uniform</label>

                <div v-if="uniforms.length" class="grid grid-cols-3 gap-3 mb-4">
                  <label v-for="u in uniforms" :key="u.id"
                    class="cursor-pointer border-2 rounded-lg p-2 flex flex-col items-center gap-1 transition"
                    :class="editScheduleForm.uniform_id === u.id
                      ? 'border-ibc-navy bg-ibc-navy/5'
                      : 'border-slate-200 hover:border-slate-400'">
                    <img v-if="u.image_path" :src="u.image_path" :alt="u.title"
                      class="w-full h-20 object-contain" />
                    <div v-else
                      class="w-full h-20 flex items-center justify-center text-xs text-slate-400 bg-slate-50 rounded">
                      No photo
                    </div>
                    <div class="flex items-center gap-1">
                      <input type="radio" :value="u.id" v-model="editScheduleForm.uniform_id" />
                      <span class="text-xs font-semibold text-ibc-navy text-center">{{ u.title }}</span>
                    </div>
                  </label>
                </div>

                <p v-else class="text-xs text-slate-500 mb-4">
                  No uniforms yet. Add them from the Uniform section on the dashboard.
                </p>

                <button v-if="editScheduleForm.uniform_id" type="button"
                  @click="editScheduleForm.uniform_id = null"
                  class="text-xs font-semibold text-slate-500 hover:underline mb-4">
                  Clear selection
                </button>

                <details class="text-sm">
                  <summary class="cursor-pointer text-xs font-semibold text-slate-500">
                    Or describe the colours instead
                  </summary>
                  <div class="grid grid-cols-3 gap-3 mt-3">
                    <div>
                      <label class="block text-xs text-slate-600 mb-1">Jersey</label>
                      <input v-model="editScheduleForm.jersey_color" type="text"
                        class="block w-full p-2 border rounded text-sm" placeholder="e.g., Blue" />
                    </div>
                    <div>
                      <label class="block text-xs text-slate-600 mb-1">Pants</label>
                      <input v-model="editScheduleForm.pants_color" type="text"
                        class="block w-full p-2 border rounded text-sm" placeholder="e.g., White" />
                    </div>
                    <div>
                      <label class="block text-xs text-slate-600 mb-1">Hat</label>
                      <input v-model="editScheduleForm.hat_color" type="text"
                        class="block w-full p-2 border rounded text-sm" placeholder="e.g., Red" />
                    </div>
                  </div>
                </details>
              </div>

              <div v-if="editScheduleMessage" :class="editScheduleMsgClass" class="p-2 rounded text-sm">
                {{ editScheduleMessage }}
              </div>

              <div class="flex justify-end gap-3 pt-2">
                <button type="button" @click="closeEditScheduleModal" class="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" class="px-4 py-2 bg-ibc-navy text-white rounded">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      </Teleport>

      <!-- Delete Schedule Modal -->
      <Teleport to="body">
        <div v-if="showDeleteScheduleModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          @click="closeDeleteScheduleModal">
          <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto" @click.stop>
            <div class="flex items-start justify-between mb-4">
              <h3 class="text-2xl font-black text-ibc-navy">Delete Schedule Entry</h3>
              <button @click="closeDeleteScheduleModal" class="text-slate-400 hover:text-slate-600 text-2xl">×</button>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-semibold mb-1">Select Entry to Delete</label>
              <select v-model="selectedDeleteScheduleId" class="w-full border rounded p-2">
                <option disabled value="">Choose an entry</option>
                <option v-for="entry in scheduleEntries" :key="entry.id" :value="entry.id">
                  {{ entry.date }} {{ entry.time }} - {{ entry.league }} {{ entry.type }}
                  {{ entry.opponent ? `vs ${entry.opponent}` : '' }}
                </option>
              </select>
            </div>

            <div v-if="selectedDeleteScheduleId" class="bg-red-50 border border-red-200 rounded p-3 mb-4">
              <p class="text-sm text-red-700">
                Are you sure you want to delete this schedule entry? This cannot be undone.
              </p>
            </div>

            <div v-if="deleteScheduleMessage" :class="deleteScheduleMsgClass" class="mb-4 p-2 rounded text-sm">
              {{ deleteScheduleMessage }}
            </div>

            <div class="flex justify-end gap-3">
              <button @click="closeDeleteScheduleModal" class="px-4 py-2 border rounded">Cancel</button>
              <button @click="confirmDeleteSchedule" :disabled="!selectedDeleteScheduleId"
                class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50">
                Delete
              </button>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- Add News Modal -->
      <Teleport to="body">
        <div v-if="showNewsModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          @click="closeNewsModal">
          <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" @click.stop>
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="text-2xl font-black text-ibc-navy">Add News Article</h3>
                <div class="text-sm text-slate-600">Post a new update</div>
              </div>
              <button @click="closeNewsModal" class="text-slate-400 hover:text-slate-600 text-2xl">×</button>
            </div>

            <form @submit.prevent="submitNews" class="space-y-4">
              <div>
                <label class="block text-sm font-semibold">Title</label>
                <input v-model="newsForm.title" type="text" class="mt-1 block w-full p-2 border rounded"
                  placeholder="Article headline" required />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold">Author (optional)</label>
                  <input v-model="newsForm.author" type="text" class="mt-1 block w-full p-2 border rounded"
                    placeholder="e.g., Coach Smith" />
                </div>
                <div>
                  <label class="block text-sm font-semibold">Sport</label>
                  <select v-model="newsForm.sport" class="mt-1 block w-full p-2 border rounded" required>
                    <option v-for="sp in sportStore.availableSports" :key="sp" :value="sp">{{ sp }}</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold">Content</label>
                <textarea v-model="newsForm.content" class="mt-1 block w-full p-2 border rounded" rows="8"
                  placeholder="Write your article here..." required></textarea>
              </div>

              <div>
                <label class="block text-sm font-semibold">Image (optional)</label>
                
                <!-- Drag and Drop Zone -->
                <div 
                  @drop.prevent="handleDrop($event, 'add')"
                  @dragover.prevent="dragActive = true"
                  @dragleave.prevent="dragActive = false"
                  @click="triggerFileInput('add')"
                  :class="{ 'border-ibc-red bg-red-50': dragActive, 'border-gray-300': !dragActive }"
                  class="mt-1 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-ibc-navy transition">
                  
                  <div v-if="!newsForm.image_path" class="text-slate-600">
                    <svg class="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <p class="mt-2 text-sm">
                      <span class="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p class="text-xs text-slate-500">PNG, JPG, GIF up to 5MB</p>
                  </div>

                  <div v-else class="relative">
                    <img :src="newsForm.image_path" class="max-h-48 mx-auto rounded" alt="Preview" />
                    <button 
                      type="button"
                      @click.stop="removeImage('add')" 
                      class="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700">
                      ×
                    </button>
                    <p class="mt-2 text-sm text-slate-600">Click to change image</p>
                  </div>
                </div>

                <input 
                  ref="fileInputAdd"
                  type="file" 
                  accept="image/*" 
                  @change="handleFileSelect($event, 'add')"
                  class="hidden" />

                <div v-if="uploadingAdd" class="mt-2 text-sm text-ibc-navy">
                  Uploading...
                </div>
              </div>

              <div v-if="newsMessage" :class="newsMsgClass" class="p-2 rounded text-sm">
                {{ newsMessage }}
              </div>

              <div class="flex justify-end gap-3 pt-2">
                <button type="button" @click="closeNewsModal" class="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" class="px-4 py-2 bg-ibc-navy text-white rounded">Publish</button>
              </div>
            </form>
          </div>
        </div>
      </Teleport>

      <!-- Edit News Modal -->
      <Teleport to="body">
        <div v-if="showEditNewsModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          @click="closeEditNewsModal">
          <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" @click.stop>
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="text-2xl font-black text-ibc-navy">Edit News Article</h3>
                <div class="text-sm text-slate-600">Update an existing article</div>
              </div>
              <button @click="closeEditNewsModal" class="text-slate-400 hover:text-slate-600 text-2xl">×</button>
            </div>

            <form @submit.prevent="submitEditNews" class="space-y-4">
              <div>
                <label class="block text-sm font-semibold">Select Article</label>
                <select v-model="selectedEditNewsId" @change="loadNewsForEdit" class="mt-1 block w-full p-2 border rounded" required>
                  <option :value="null" disabled>Choose an article...</option>
                  <option v-for="article in allNews" :key="article.id" :value="article.id">
                    {{ article.title }} ({{ article.sport }})
                  </option>
                </select>
              </div>

              <template v-if="selectedEditNewsId">
                <div>
                  <label class="block text-sm font-semibold">Title</label>
                  <input v-model="editNewsForm.title" type="text" class="mt-1 block w-full p-2 border rounded"
                    placeholder="Article headline" required />
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold">Author (optional)</label>
                    <input v-model="editNewsForm.author" type="text" class="mt-1 block w-full p-2 border rounded"
                      placeholder="e.g., Coach Smith" />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold">Sport</label>
                    <select v-model="editNewsForm.sport" class="mt-1 block w-full p-2 border rounded" required>
                      <option v-for="sp in sportStore.availableSports" :key="sp" :value="sp">{{ sp }}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-semibold">Content</label>
                  <textarea v-model="editNewsForm.content" class="mt-1 block w-full p-2 border rounded" rows="8"
                    placeholder="Write your article here..." required></textarea>
                </div>

                <div>
                  <label class="block text-sm font-semibold">Image (optional)</label>
                  
                  <!-- Drag and Drop Zone -->
                  <div 
                    @drop.prevent="handleDrop($event, 'edit')"
                    @dragover.prevent="dragActive = true"
                    @dragleave.prevent="dragActive = false"
                    @click="triggerFileInput('edit')"
                    :class="{ 'border-ibc-red bg-red-50': dragActive, 'border-gray-300': !dragActive }"
                    class="mt-1 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-ibc-navy transition">
                    
                    <div v-if="!editNewsForm.image_path" class="text-slate-600">
                      <svg class="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                      <p class="mt-2 text-sm">
                        <span class="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p class="text-xs text-slate-500">PNG, JPG, GIF up to 5MB</p>
                    </div>

                    <div v-else class="relative">
                      <img :src="editNewsForm.image_path" class="max-h-48 mx-auto rounded" alt="Preview" />
                      <button 
                        type="button"
                        @click.stop="removeImage('edit')" 
                        class="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700">
                        ×
                      </button>
                      <p class="mt-2 text-sm text-slate-600">Click to change image</p>
                    </div>
                  </div>

                  <input 
                    ref="fileInputEdit"
                    type="file" 
                    accept="image/*" 
                    @change="handleFileSelect($event, 'edit')"
                    class="hidden" />

                  <div v-if="uploadingEdit" class="mt-2 text-sm text-ibc-navy">
                    Uploading...
                  </div>
                </div>

                <div v-if="editNewsMessage" :class="editNewsMsgClass" class="p-2 rounded text-sm">
                  {{ editNewsMessage }}
                </div>

                <div class="flex justify-end gap-3 pt-2">
                  <button type="button" @click="closeEditNewsModal" class="px-4 py-2 border rounded">Cancel</button>
                  <button type="submit" class="px-4 py-2 bg-ibc-navy text-white rounded">Save Changes</button>
                </div>
              </template>
            </form>
          </div>
        </div>
      </Teleport>

      <!-- Delete News Modal -->
      <Teleport to="body">
        <div v-if="showDeleteNewsModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          @click="closeDeleteNewsModal">
          <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto" @click.stop>
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="text-2xl font-black text-ibc-navy">Delete News Article</h3>
                <div class="text-sm text-slate-600">This action cannot be undone</div>
              </div>
              <button @click="closeDeleteNewsModal" class="text-slate-400 hover:text-slate-600 text-2xl">×</button>
            </div>

            <form @submit.prevent="submitDeleteNews" class="space-y-4">
              <div>
                <label class="block text-sm font-semibold">Select Article to Delete</label>
                <select v-model="selectedDeleteNewsId" class="mt-1 block w-full p-2 border rounded" required>
                  <option :value="null" disabled>Choose an article...</option>
                  <option v-for="article in allNews" :key="article.id" :value="article.id">
                    {{ article.title }} ({{ article.sport }})
                  </option>
                </select>
              </div>

              <div v-if="deleteNewsMessage" :class="deleteNewsMsgClass" class="p-2 rounded text-sm">
                {{ deleteNewsMessage }}
              </div>

              <div class="flex justify-end gap-3 pt-2">
                <button type="button" @click="closeDeleteNewsModal" class="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" class="px-4 py-2 bg-red-600 text-white rounded">Delete</button>
              </div>
            </form>
          </div>
        </div>
      </Teleport>

      <!-- Add Swag Modal -->
      <Teleport to="body">
        <div v-if="showSwagModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          @click="closeSwagModal">
          <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" @click.stop>
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="text-2xl font-black text-ibc-navy">Add Swag Item</h3>
                <div class="text-sm text-slate-600">Add spirit wear to the store</div>
              </div>
              <button @click="closeSwagModal" class="text-slate-400 hover:text-slate-600 text-2xl">×</button>
            </div>

            <form @submit.prevent="submitSwag" class="space-y-4">
              <div>
                <label class="block text-sm font-semibold">Title *</label>
                <input v-model="swagForm.title" type="text" class="mt-1 block w-full p-2 border rounded"
                  placeholder="e.g., Team Hoodie" required />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold">Price *</label>
                  <input v-model.number="swagForm.price" type="number" step="0.01" min="0" 
                    class="mt-1 block w-full p-2 border rounded" placeholder="29.99" required />
                </div>
                <div>
                  <label class="block text-sm font-semibold">Sport</label>
                  <select v-model="swagForm.sport" class="mt-1 block w-full p-2 border rounded" required>
                    <option v-for="sp in sportStore.availableSports" :key="sp" :value="sp">{{ sp }}</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold">Description (optional)</label>
                <textarea v-model="swagForm.description" class="mt-1 block w-full p-2 border rounded" rows="3"
                  placeholder="Size, color, material, etc."></textarea>
              </div>

              <div>
                <label class="block text-sm font-semibold">Link URL (optional)</label>
                <input v-model="swagForm.url" type="url" class="mt-1 block w-full p-2 border rounded"
                  placeholder="https://store.com/product" />
                <p class="text-xs text-slate-500 mt-1">Make the title clickable (e.g., link to order page)</p>
              </div>

              <div>
                <label class="block text-sm font-semibold">Image (optional)</label>
                
                <div 
                  @drop.prevent="handleDrop($event, 'swag-add')"
                  @dragover.prevent="dragActive = true"
                  @dragleave.prevent="dragActive = false"
                  @click="triggerFileInput('swag-add')"
                  :class="{ 'border-ibc-red bg-red-50': dragActive, 'border-gray-300': !dragActive }"
                  class="mt-1 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-ibc-navy transition">
                  
                  <div v-if="!swagForm.image_path" class="text-slate-600">
                    <svg class="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <p class="mt-2 text-sm">
                      <span class="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p class="text-xs text-slate-500">PNG, JPG, GIF up to 5MB</p>
                  </div>

                  <div v-else class="relative">
                    <img :src="swagForm.image_path" class="max-h-48 mx-auto rounded" alt="Preview" />
                    <button 
                      type="button"
                      @click.stop="removeImage('swag-add')" 
                      class="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700">
                      ×
                    </button>
                    <p class="mt-2 text-sm text-slate-600">Click to change image</p>
                  </div>
                </div>

                <input 
                  ref="fileInputSwagAdd"
                  type="file" 
                  accept="image/*" 
                  @change="handleFileSelect($event, 'swag-add')"
                  class="hidden" />

                <div v-if="uploadingSwagAdd" class="mt-2 text-sm text-ibc-navy">
                  Uploading...
                </div>
              </div>

              <div v-if="swagMessage" :class="swagMsgClass" class="p-2 rounded text-sm">
                {{ swagMessage }}
              </div>

              <div class="flex justify-end gap-3 pt-2">
                <button type="button" @click="closeSwagModal" class="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" class="px-4 py-2 bg-ibc-navy text-white rounded">Add Item</button>
              </div>
            </form>
          </div>
        </div>
      </Teleport>

      <!-- Edit Swag Modal -->
      <Teleport to="body">
        <div v-if="showEditSwagModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          @click="closeEditSwagModal">
          <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" @click.stop>
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="text-2xl font-black text-ibc-navy">Edit Swag Item</h3>
                <div class="text-sm text-slate-600">Update spirit wear details</div>
              </div>
              <button @click="closeEditSwagModal" class="text-slate-400 hover:text-slate-600 text-2xl">×</button>
            </div>

            <form @submit.prevent="submitEditSwag" class="space-y-4">
              <div>
                <label class="block text-sm font-semibold">Select Item</label>
                <select v-model="selectedEditSwagId" @change="loadSwagForEdit" class="mt-1 block w-full p-2 border rounded" required>
                  <option :value="null" disabled>Choose an item...</option>
                  <option v-for="item in allSwag" :key="item.id" :value="item.id">
                    {{ item.title }} (${{ item.price }})
                  </option>
                </select>
              </div>

              <template v-if="selectedEditSwagId">
                <div>
                  <label class="block text-sm font-semibold">Title *</label>
                  <input v-model="editSwagForm.title" type="text" class="mt-1 block w-full p-2 border rounded" required />
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold">Price *</label>
                    <input v-model.number="editSwagForm.price" type="number" step="0.01" min="0" 
                      class="mt-1 block w-full p-2 border rounded" required />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold">Sport</label>
                    <select v-model="editSwagForm.sport" class="mt-1 block w-full p-2 border rounded" required>
                      <option v-for="sp in sportStore.availableSports" :key="sp" :value="sp">{{ sp }}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-semibold">Description (optional)</label>
                  <textarea v-model="editSwagForm.description" class="mt-1 block w-full p-2 border rounded" rows="3"></textarea>
                </div>

                <div>
                  <label class="block text-sm font-semibold">Link URL (optional)</label>
                  <input v-model="editSwagForm.url" type="url" class="mt-1 block w-full p-2 border rounded"
                    placeholder="https://store.com/product" />
                  <p class="text-xs text-slate-500 mt-1">Make the title clickable (e.g., link to order page)</p>
                </div>

                <div>
                  <label class="block text-sm font-semibold">Image (optional)</label>
                  
                  <div 
                    @drop.prevent="handleDrop($event, 'swag-edit')"
                    @dragover.prevent="dragActive = true"
                    @dragleave.prevent="dragActive = false"
                    @click="triggerFileInput('swag-edit')"
                    :class="{ 'border-ibc-red bg-red-50': dragActive, 'border-gray-300': !dragActive }"
                    class="mt-1 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-ibc-navy transition">
                    
                    <div v-if="!editSwagForm.image_path" class="text-slate-600">
                      <svg class="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                      <p class="mt-2 text-sm">
                        <span class="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p class="text-xs text-slate-500">PNG, JPG, GIF up to 5MB</p>
                    </div>

                    <div v-else class="relative">
                      <img :src="editSwagForm.image_path" class="max-h-48 mx-auto rounded" alt="Preview" />
                      <button 
                        type="button"
                        @click.stop="removeImage('swag-edit')" 
                        class="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700">
                        ×
                      </button>
                      <p class="mt-2 text-sm text-slate-600">Click to change image</p>
                    </div>
                  </div>

                  <input 
                    ref="fileInputSwagEdit"
                    type="file" 
                    accept="image/*" 
                    @change="handleFileSelect($event, 'swag-edit')"
                    class="hidden" />

                  <div v-if="uploadingSwagEdit" class="mt-2 text-sm text-ibc-navy">
                    Uploading...
                  </div>
                </div>

                <div v-if="editSwagMessage" :class="editSwagMsgClass" class="p-2 rounded text-sm">
                  {{ editSwagMessage }}
                </div>

                <div class="flex justify-end gap-3 pt-2">
                  <button type="button" @click="closeEditSwagModal" class="px-4 py-2 border rounded">Cancel</button>
                  <button type="submit" class="px-4 py-2 bg-ibc-navy text-white rounded">Save Changes</button>
                </div>
              </template>
            </form>
          </div>
        </div>
      </Teleport>

      <!-- Delete Swag Modal -->
      <Teleport to="body">
        <div v-if="showDeleteSwagModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          @click="closeDeleteSwagModal">
          <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto" @click.stop>
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="text-2xl font-black text-ibc-navy">Delete Swag Item</h3>
                <div class="text-sm text-slate-600">This action cannot be undone</div>
              </div>
              <button @click="closeDeleteSwagModal" class="text-slate-400 hover:text-slate-600 text-2xl">×</button>
            </div>

            <form @submit.prevent="submitDeleteSwag" class="space-y-4">
              <div>
                <label class="block text-sm font-semibold">Select Item to Delete</label>
                <select v-model="selectedDeleteSwagId" class="mt-1 block w-full p-2 border rounded" required>
                  <option :value="null" disabled>Choose an item...</option>
                  <option v-for="item in allSwag" :key="item.id" :value="item.id">
                    {{ item.title }} (${{ item.price }})
                  </option>
                </select>
              </div>

              <div v-if="deleteSwagMessage" :class="deleteSwagMsgClass" class="p-2 rounded text-sm">
                {{ deleteSwagMessage }}
              </div>

              <div class="flex justify-end gap-3 pt-2">
                <button type="button" @click="closeDeleteSwagModal" class="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" class="px-4 py-2 bg-red-600 text-white rounded">Delete</button>
              </div>
            </form>
          </div>
        </div>
      </Teleport>

      <!-- Add Uniform Modal -->
      <Teleport to="body">
        <div v-if="showUniformModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
             @click="closeUniformModal">
          <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" @click.stop>
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="text-2xl font-black text-ibc-navy">Add Uniform</h3>
              </div>
              <button @click="closeUniformModal" class="text-slate-400 hover:text-slate-600 text-2xl">×</button>
            </div>

            <form @submit.prevent="submitUniform" class="space-y-4">
              <div>
                <label class="block text-sm font-semibold">Title *</label>
                <input v-model="uniformForm.title" type="text" class="mt-1 block w-full p-2 border rounded"
                       placeholder="e.g., 10U 2026 Fall Red Uniform" required />
              </div>

              <div>
                <label class="block text-sm font-semibold">Image (optional)</label>

                <div
                    @drop.prevent="handleDrop($event, 'uniform-add')"
                    @dragover.prevent="dragActive = true"
                    @dragleave.prevent="dragActive = false"
                    @click="triggerFileInput('uniform-add')"
                    :class="{ 'border-ibc-red bg-red-50': dragActive, 'border-gray-300': !dragActive }"
                    class="mt-1 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-ibc-navy transition">

                  <div v-if="!uniformForm.image_path" class="text-slate-600">
                    <svg class="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <p class="mt-2 text-sm">
                      <span class="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p class="text-xs text-slate-500">PNG, JPG, GIF up to 5MB</p>
                  </div>

                  <div v-else class="relative">
                    <img :src="uniformForm.image_path" class="max-h-48 mx-auto rounded" alt="Preview" />
                    <button
                        type="button"
                        @click.stop="removeImage('swag-add')"
                        class="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700">
                      ×
                    </button>
                    <p class="mt-2 text-sm text-slate-600">Click to change image</p>
                  </div>
                </div>

                <input
                    ref="fileInputUniformAdd"
                    type="file"
                    accept="image/*"
                    @change="handleFileSelect($event, 'uniform-add')"
                    class="hidden" />

                <div v-if="uploadingUniformAdd" class="mt-2 text-sm text-ibc-navy">
                  Uploading...
                </div>
              </div>

              <div v-if="swagMessage" :class="swagMsgClass" class="p-2 rounded text-sm">
                {{ swagMessage }}
              </div>

              <div class="flex justify-end gap-3 pt-2">
                <button type="button" @click="closeUniformModal" class="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" class="px-4 py-2 bg-ibc-navy text-white rounded">Add Uniform</button>
              </div>
            </form>

            <div v-if="uniforms.length" class="border-t mt-6 pt-4">
              <p class="text-sm font-semibold text-ibc-navy mb-3">Existing uniforms</p>
              <div class="grid grid-cols-3 gap-3">
                <div v-for="u in uniforms" :key="u.id" class="border rounded-lg p-2 text-center">
                  <img v-if="u.image_path" :src="u.image_path" :alt="u.title"
                    class="w-full h-20 object-contain" />
                  <div v-else class="w-full h-20 flex items-center justify-center text-xs text-slate-400 bg-slate-50 rounded">
                    No photo
                  </div>
                  <div class="text-xs font-semibold text-ibc-navy mt-1">{{ u.title }}</div>
                  <button type="button" @click="removeUniform(u)"
                    class="text-xs font-semibold text-red-600 hover:underline mt-1">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- Upload Stats Modal -->
      <Teleport to="body">
        <div v-if="showStatsModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          @click="closeStatsModal">
          <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" @click.stop>
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="text-2xl font-black text-ibc-navy">Upload Stats</h3>
                <div class="text-sm text-slate-600">Upload CSV files with player and team statistics</div>
              </div>
              <button @click="closeStatsModal" class="text-slate-400 hover:text-slate-600 text-2xl">×</button>
            </div>

            <form @submit.prevent="submitStats" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold">League *</label>
                  <select v-model="statsForm.league" class="mt-1 block w-full p-2 border rounded" required>
                    <option disabled value="">Select a league</option>
                    <option v-for="team in availableTeams" :key="`${team.league}-${team.sport}`" :value="team.league">
                      {{ team.league }} ({{ team.sport }})
                    </option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-semibold">Sport</label>
                  <select v-model="statsForm.sport" class="mt-1 block w-full p-2 border rounded" required>
                    <option v-for="sp in sportStore.availableSports" :key="sp" :value="sp">{{ sp }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-semibold">Season *</label>
                  <select v-model="statsForm.season" class="mt-1 block w-full p-2 border rounded" required>
                    <option v-for="s in seasonOptions" :key="s" :value="s">{{ s }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-semibold">Year *</label>
                  <input v-model.number="statsForm.year" type="number"
                    class="mt-1 block w-full p-2 border rounded" required />
                </div>
              </div>

              <p class="text-xs text-slate-600 bg-slate-50 p-2 rounded">
                Uploading replaces the stats for this league and season only. Other seasons are left alone.
              </p>

              <div>
                <label class="block text-sm font-semibold mb-2">Team Stats CSV File *</label>
                <p class="text-xs text-slate-600 mb-2">Upload one CSV with all player stats (batting & pitching) and optional team stats</p>
                
                <div 
                  @drop.prevent="handleStatsDrop"
                  @dragover.prevent="dragActive = true"
                  @dragleave.prevent="dragActive = false"
                  @click="triggerStatsFileInput"
                  :class="{ 'border-ibc-red bg-red-50': dragActive, 'border-gray-300': !dragActive }"
                  class="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-ibc-navy transition">
                  
                  <div v-if="!statsFile" class="text-slate-600">
                    <svg class="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10m-10 4h7m3-10h10M7 35h15M27 7v10M12 21l18-18m18 18L30 3m18 18a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <p class="mt-2 text-sm">
                      <span class="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p class="text-xs text-slate-500">CSV file (max 2MB)</p>
                  </div>

                  <div v-else class="text-slate-700">
                    <svg class="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    <p class="mt-2 text-sm font-semibold">{{ statsFile.name }}</p>
                    <p class="text-xs text-slate-500">{{ (statsFile.size / 1024).toFixed(1) }} KB</p>
                    <button 
                      type="button"
                      @click.stop="removeStatsFile" 
                      class="mt-2 text-red-600 hover:text-red-800 text-sm underline">
                      Remove file
                    </button>
                  </div>
                </div>

                <input 
                  ref="statsFileInput"
                  type="file" 
                  accept=".csv" 
                  @change="handleStatsFileSelect"
                  class="hidden" />

                <div class="mt-2 text-xs text-slate-600 bg-slate-50 p-3 rounded">
                  <p class="font-semibold mb-2">CSV Format (all in one file):</p>
                  <p class="mb-1"><strong>Batting columns:</strong> player_name, team, avg, hits, at_bats, runs, rbis, doubles, triples, home_runs, stolen_bases</p>
                  <p class="mb-1"><strong>Pitching columns:</strong> player_name, team, era, wins, losses, saves, innings_pitched, strikeouts, walks, hits_allowed</p>
                  <p class="text-xs text-slate-500 mt-2">Include both batting AND pitching columns for each player. System will automatically extract the stats that exist.</p>
                </div>
              </div>

              <div v-if="uploadingStats" class="p-3 bg-blue-50 text-blue-700 rounded text-sm">
                Uploading and processing CSV...
              </div>

              <div v-if="statsMessage" :class="statsMsgClass" class="p-2 rounded text-sm">
                {{ statsMessage }}
              </div>

              <div class="flex justify-end gap-3 pt-2">
                <button type="button" @click="closeStatsModal" class="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" :disabled="!statsFile || uploadingStats" class="px-4 py-2 bg-ibc-navy text-white rounded disabled:opacity-50">
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      </Teleport>

      <!-- Update Team Record Modal -->
      <Teleport to="body">
        <div v-if="showRecordModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          @click="closeRecordModal">
          <div class="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" @click.stop>
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="text-2xl font-black text-ibc-navy">Update Team Record</h3>
                <div class="text-sm text-slate-600">Sets the win-loss record shown on the team page</div>
              </div>
              <button @click="closeRecordModal" class="text-slate-400 hover:text-slate-600 text-2xl">×</button>
            </div>

            <form @submit.prevent="submitRecord" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold">League *</label>
                  <select v-model="recordForm.league" @change="loadExistingRecord"
                    class="mt-1 block w-full p-2 border rounded" required>
                    <option disabled value="">Select a league</option>
                    <option v-for="team in availableTeams" :key="`${team.league}-${team.sport}`" :value="team.league">
                      {{ team.league }} ({{ team.sport }})
                    </option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-semibold">Sport</label>
                  <select v-model="recordForm.sport" @change="loadExistingRecord"
                    class="mt-1 block w-full p-2 border rounded" required>
                    <option v-for="sp in sportStore.availableSports" :key="sp" :value="sp">{{ sp }}</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold">Season *</label>
                  <select v-model="recordForm.season" @change="loadExistingRecord"
                    class="mt-1 block w-full p-2 border rounded" required>
                    <option v-for="s in seasonOptions" :key="s" :value="s">{{ s }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-semibold">Year *</label>
                  <input v-model.number="recordForm.year" @change="loadExistingRecord" type="number"
                    class="mt-1 block w-full p-2 border rounded" required />
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold">Team Name</label>
                <input v-model="recordForm.team_name" type="text" placeholder="Defaults to the league name"
                  class="mt-1 block w-full p-2 border rounded" />
              </div>

              <div class="grid grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-semibold">Wins</label>
                  <input v-model.number="recordForm.wins" type="number" min="0"
                    class="mt-1 block w-full p-2 border rounded" />
                </div>
                <div>
                  <label class="block text-sm font-semibold">Losses</label>
                  <input v-model.number="recordForm.losses" type="number" min="0"
                    class="mt-1 block w-full p-2 border rounded" />
                </div>
                <div>
                  <label class="block text-sm font-semibold">Ties</label>
                  <input v-model.number="recordForm.ties" type="number" min="0"
                    class="mt-1 block w-full p-2 border rounded" />
                </div>
              </div>

              <div v-if="recordForm.league" class="p-3 bg-slate-50 rounded text-sm text-slate-700">
                Team page will show:
                <span class="font-bold text-ibc-navy">
                  {{ recordForm.wins || 0 }}-{{ recordForm.losses || 0 }}<span v-if="recordForm.ties">-{{ recordForm.ties }}</span> Record
                </span>
              </div>

              <div v-if="recordMessage" :class="recordMsgClass" class="p-2 rounded text-sm">
                {{ recordMessage }}
              </div>

              <div class="flex justify-end gap-3 pt-2">
                <button type="button" @click="closeRecordModal" class="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" :disabled="!recordForm.league || savingRecord"
                  class="px-4 py-2 bg-ibc-navy text-white rounded disabled:opacity-50">
                  {{ savingRecord ? 'Saving...' : 'Save Record' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Teleport>

      <!-- Add Coach Modal -->
      <Teleport to="body">
        <div v-if="showAddCoachModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          @click="closeAddCoachModal">
          <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6" @click.stop>
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="text-2xl font-black text-ibc-navy">Add Coach</h3>
                <div class="text-sm text-slate-600">Fill coach details and click Create</div>
              </div>
              <button @click="closeAddCoachModal" class="text-slate-400 hover:text-slate-600 text-2xl">×</button>
            </div>

            <form @submit.prevent="submitAddCoach" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold">First Name</label>
                  <input v-model="addCoachForm.first_name" type="text" class="mt-1 block w-full p-2 border rounded" required />
                </div>
                <div>
                  <label class="block text-sm font-semibold">Last Name</label>
                  <input v-model="addCoachForm.last_name" type="text" class="mt-1 block w-full p-2 border rounded" required />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold">League</label>
                  <input v-model="addCoachForm.league" type="text" class="mt-1 block w-full p-2 border rounded"
                    placeholder="e.g., 12U" required @blur="addCoachForm.league = addCoachForm.league.toUpperCase()" />
                </div>
                <div>
                  <label class="block text-sm font-semibold">Season</label>
                  <select v-model="addCoachForm.season" class="mt-1 block w-full p-2 border rounded" required>
                    <option disabled value="">Select season</option>
                    <option v-for="s in seasonOptions" :key="s" :value="s">{{ s }}</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold">Year</label>
                <input v-model.number="addCoachForm.year" type="number" class="mt-1 block w-full p-2 border rounded" required />
              </div>

              <div class="flex justify-end gap-3 pt-2">
                <button type="button" @click="closeAddCoachModal" class="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" class="px-4 py-2 bg-ibc-navy text-white rounded">Create</button>
              </div>

              <div v-if="addCoachMessage" :class="addCoachMsgClass" class="mt-2 p-2 rounded">{{ addCoachMessage }}</div>
            </form>
          </div>
        </div>
      </Teleport>

      <!-- Edit Coach Modal -->
      <Teleport to="body">
        <div v-if="showEditCoachModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          @click="closeEditCoachModal">
          <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6" @click.stop>
            <div class="flex items-start justify-between mb-4">
              <h3 class="text-2xl font-black text-ibc-navy">Edit Coach</h3>
              <button @click="closeEditCoachModal" class="text-slate-400 hover:text-slate-600 text-2xl">×</button>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">Select Coach</label>
              <select v-model="selectedEditCoachId" @change="loadEditCoach" class="w-full border rounded p-2">
                <option disabled value="">Choose a coach</option>
                <option v-for="coach in allCoaches" :key="`${coach.last_name}-${coach.league}-${coach.season}-${coach.year}`" 
                  :value="`${coach.last_name}|${coach.league}|${coach.season}|${coach.year}`">
                  {{ coach.first_name }} {{ coach.last_name }} - {{ coach.league }} {{ coach.season }} {{ coach.year }}
                </option>
              </select>
            </div>

            <div v-if="selectedEditCoachId" class="space-y-4 mt-4">
              <form @submit.prevent="submitEditCoach" class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold">First Name</label>
                    <input v-model="editCoachForm.first_name" type="text" class="mt-1 block w-full p-2 border rounded" required />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold">Last Name</label>
                    <input v-model="editCoachForm.last_name" type="text" class="mt-1 block w-full p-2 border rounded" required />
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold">League</label>
                    <input v-model="editCoachForm.league" type="text" class="mt-1 block w-full p-2 border rounded" required />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold">Season</label>
                    <select v-model="editCoachForm.season" class="mt-1 block w-full p-2 border rounded" required>
                      <option v-for="s in seasonOptions" :key="s" :value="s">{{ s }}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-semibold">Year</label>
                  <input v-model.number="editCoachForm.year" type="number" class="mt-1 block w-full p-2 border rounded" required />
                </div>

                <div v-if="editCoachMessage" :class="editCoachMsgClass" class="p-2 rounded text-sm">
                  {{ editCoachMessage }}
                </div>

                <div class="flex justify-end gap-3 pt-2">
                  <button type="button" @click="closeEditCoachModal" class="px-4 py-2 border rounded">Cancel</button>
                  <button type="submit" class="px-4 py-2 bg-ibc-navy text-white rounded">Update</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- Delete Coach Modal -->
      <Teleport to="body">
        <div v-if="showDeleteCoachModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          @click="closeDeleteCoachModal">
          <div class="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 max-h-[90vh] overflow-y-auto" @click.stop>
            <div class="flex items-start justify-between mb-4">
              <h3 class="text-2xl font-black text-ibc-navy">Delete Coach</h3>
              <button @click="closeDeleteCoachModal" class="text-slate-400 hover:text-slate-600 text-2xl">×</button>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-semibold mb-1">Select Coach</label>
              <select v-model="selectedDeleteCoachId" class="w-full border rounded p-2">
                <option disabled value="">Choose a coach</option>
                <option v-for="coach in allCoaches" :key="`${coach.last_name}-${coach.league}-${coach.season}-${coach.year}`"
                  :value="`${coach.last_name}|${coach.league}|${coach.season}|${coach.year}`">
                  {{ coach.first_name }} {{ coach.last_name }} - {{ coach.league }} {{ coach.season }} {{ coach.year }}
                </option>
              </select>
            </div>

            <div v-if="selectedDeleteCoachId" class="bg-red-50 border border-red-200 rounded p-3 mb-4">
              <p class="text-sm text-red-700">
                Are you sure you want to delete <strong>{{ deleteCoachName }}</strong>? This cannot be undone.
              </p>
            </div>

            <div v-if="deleteCoachMessage" :class="deleteCoachMsgClass" class="mb-4 p-2 rounded text-sm">
              {{ deleteCoachMessage }}
            </div>

            <div class="flex justify-end gap-3">
              <button @click="closeDeleteCoachModal" class="px-4 py-2 border rounded">Cancel</button>
              <button @click="confirmDeleteCoach" :disabled="!selectedDeleteCoachId"
                class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50">
                Delete
              </button>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- Add Assistant Coach Modal -->
      <Teleport to="body">
        <div v-if="showAddAssistantCoachModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          @click="closeAddAssistantCoachModal">
          <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6" @click.stop>
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="text-2xl font-black text-ibc-navy">Add Assistant Coach</h3>
                <div class="text-sm text-slate-600">Fill assistant coach details and click Create</div>
              </div>
              <button @click="closeAddAssistantCoachModal" class="text-slate-400 hover:text-slate-600 text-2xl">×</button>
            </div>

            <form @submit.prevent="submitAddAssistantCoach" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold">First Name</label>
                  <input v-model="addAssistantCoachForm.first_name" type="text" class="mt-1 block w-full p-2 border rounded" required />
                </div>
                <div>
                  <label class="block text-sm font-semibold">Last Name</label>
                  <input v-model="addAssistantCoachForm.last_name" type="text" class="mt-1 block w-full p-2 border rounded" required />
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold">Head Coach</label>
                <select v-model="selectedHeadCoachForAssistant" @change="updateHeadCoachFieldsForAssistant" class="mt-1 block w-full p-2 border rounded" required>
                  <option disabled value="">Select head coach</option>
                  <option v-for="coach in allCoaches" :key="`${coach.last_name}-${coach.league}-${coach.season}-${coach.year}`"
                    :value="`${coach.last_name}|${coach.league}|${coach.season}|${coach.year}`">
                    {{ coach.first_name }} {{ coach.last_name }} - {{ coach.league }} {{ coach.season }} {{ coach.year }}
                  </option>
                </select>
              </div>

              <div class="flex justify-end gap-3 pt-2">
                <button type="button" @click="closeAddAssistantCoachModal" class="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" :disabled="!selectedHeadCoachForAssistant" class="px-4 py-2 bg-ibc-navy text-white rounded disabled:opacity-50">Create</button>
              </div>

              <div v-if="addAssistantCoachMessage" :class="addAssistantCoachMsgClass" class="mt-2 p-2 rounded">{{ addAssistantCoachMessage }}</div>
            </form>
          </div>
        </div>
      </Teleport>

      <!-- Edit Assistant Coach Modal -->
      <Teleport to="body">
        <div v-if="showEditAssistantCoachModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          @click="closeEditAssistantCoachModal">
          <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6" @click.stop>
            <div class="flex items-start justify-between mb-4">
              <h3 class="text-2xl font-black text-ibc-navy">Edit Assistant Coach</h3>
              <button @click="closeEditAssistantCoachModal" class="text-slate-400 hover:text-slate-600 text-2xl">×</button>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">Select Assistant Coach</label>
              <select v-model="selectedEditAssistantCoachId" @change="loadEditAssistantCoach" class="w-full border rounded p-2">
                <option disabled value="">Choose an assistant coach</option>
                <option v-for="assistantCoach in allAssistantCoaches" :key="assistantCoach.id" :value="assistantCoach.id">
                  {{ assistantCoach.first_name }} {{ assistantCoach.last_name }} (under {{ assistantCoach.head_coach_last_name }})
                </option>
              </select>
            </div>

            <div v-if="selectedEditAssistantCoachId" class="space-y-4 mt-4">
              <form @submit.prevent="submitEditAssistantCoach" class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold">First Name</label>
                    <input v-model="editAssistantCoachForm.first_name" type="text" class="mt-1 block w-full p-2 border rounded" required />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold">Last Name</label>
                    <input v-model="editAssistantCoachForm.last_name" type="text" class="mt-1 block w-full p-2 border rounded" required />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-semibold">Head Coach</label>
                  <select v-model="selectedHeadCoachForEdit" @change="updateHeadCoachFieldsForEdit" class="mt-1 block w-full p-2 border rounded" required>
                    <option disabled value="">Select head coach</option>
                    <option v-for="coach in allCoaches" :key="`${coach.last_name}-${coach.league}-${coach.season}-${coach.year}`"
                      :value="`${coach.last_name}|${coach.league}|${coach.season}|${coach.year}`">
                      {{ coach.first_name }} {{ coach.last_name }} - {{ coach.league }} {{ coach.season }} {{ coach.year }}
                    </option>
                  </select>
                </div>

                <div v-if="editAssistantCoachMessage" :class="editAssistantCoachMsgClass" class="p-2 rounded text-sm">
                  {{ editAssistantCoachMessage }}
                </div>

                <div class="flex justify-end gap-3 pt-2">
                  <button type="button" @click="closeEditAssistantCoachModal" class="px-4 py-2 border rounded">Cancel</button>
                  <button type="submit" class="px-4 py-2 bg-ibc-navy text-white rounded">Update</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- Delete Assistant Coach Modal -->
      <Teleport to="body">
        <div v-if="showDeleteAssistantCoachModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          @click="closeDeleteAssistantCoachModal">
          <div class="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 max-h-[90vh] overflow-y-auto" @click.stop>
            <div class="flex items-start justify-between mb-4">
              <h3 class="text-2xl font-black text-ibc-navy">Delete Assistant Coach</h3>
              <button @click="closeDeleteAssistantCoachModal" class="text-slate-400 hover:text-slate-600 text-2xl">×</button>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-semibold mb-1">Select Assistant Coach</label>
              <select v-model="selectedDeleteAssistantCoachId" class="w-full border rounded p-2">
                <option disabled value="">Choose an assistant coach</option>
                <option v-for="assistantCoach in allAssistantCoaches" :key="assistantCoach.id" :value="assistantCoach.id">
                  {{ assistantCoach.first_name }} {{ assistantCoach.last_name }} (under {{ assistantCoach.head_coach_last_name }})
                </option>
              </select>
            </div>

            <div v-if="selectedDeleteAssistantCoachId" class="bg-red-50 border border-red-200 rounded p-3 mb-4">
              <p class="text-sm text-red-700">
                Are you sure you want to delete <strong>{{ deleteAssistantCoachName }}</strong>? This cannot be undone.
              </p>
            </div>

            <div v-if="deleteAssistantCoachMessage" :class="deleteAssistantCoachMsgClass" class="mb-4 p-2 rounded text-sm">
              {{ deleteAssistantCoachMessage }}
            </div>

            <div class="flex justify-end gap-3">
              <button @click="closeDeleteAssistantCoachModal" class="px-4 py-2 border rounded">Cancel</button>
              <button @click="confirmDeleteAssistantCoach" :disabled="!selectedDeleteAssistantCoachId"
                class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50">
                Delete
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
import { type Player } from '@/api/players'
import { createScheduleEntry, updateScheduleEntry, deleteScheduleEntry, getSchedule, type NewScheduleEntry, type ScheduleEntry } from '@/api/schedule'
import { createNews, updateNews, deleteNews, getNews, type NewNewsArticle, type NewsArticle } from '@/api/news'
import { createSwag, updateSwag, deleteSwag, getSwag, type NewSwagItem, type SwagItem } from '@/api/swag'
import { uploadTeamStats, getTeamStats, updateTeamRecord } from '@/api/stats'
import { uploadImage } from '@/api/upload'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const adminRouter = useRouter()

async function handleLogout() {
  await auth.logout()
  adminRouter.push('/admin/login')
}
import { usePlayerStore } from '@/stores/players'
import { useSportStore } from '@/stores/sport'
import { getCoaches, createCoach, updateCoach, deleteCoach, type Coach } from '@/api/coaches'
import { getAssistants, createAssistant, updateAssistant, deleteAssistant, type Assistant } from '@/api/assistants'
import { getTeams, type Team } from '@/api/teams'
import { createUniform, getUniform, deleteUniform, type NewUniformItem, type Uniform } from '@/api/uniform'

const playerStore = usePlayerStore()
const sportStore = useSportStore()

const seasonOptions = ['Spring', 'Summer', 'Fall']

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
  const player = playerStore.players.find(
    p => p.id === selectedEditPlayerId.value
  )

  if (player) {
    Object.assign(editPlayer, player)
  }
}

const savePlayer = async () => {
  try {
    const { id, ...playerData } = editPlayer
    await playerStore.update(id!, playerData as Omit<Player, 'id'>)
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
  sport: string
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
  year: null,
  sport: 'Baseball'
})
//***********************
const selectedEditPlayerId = ref<number | null>(null)

// A "team" is a league in a given season - 10U Fall 2026 is a different squad
// from 10U Spring 2027, so filtering on league alone would mix them together.
const editTeamKey = ref('')

function teamKeyOf(p: { league?: string | null; season?: string | null; year?: number | null }) {
  return [p.league || '', p.season || '', p.year ?? ''].join('|')
}

const editTeamOptions = computed(() => {
  const groups = new Map<string, { key: string; label: string; count: number; year: number }>()

  for (const p of playerStore.players) {
    const key = teamKeyOf(p)
    const existing = groups.get(key)

    if (existing) {
      existing.count++
      continue
    }

    const season = [p.season, p.year].filter(Boolean).join(' ')
    groups.set(key, {
      key,
      label: p.league ? (season ? `${p.league} — ${season}` : p.league) : 'Unassigned',
      count: 1,
      year: p.year ?? 0,
    })
  }

  // Newest season first, so the current squad is at the top of the list.
  return [...groups.values()].sort(
    (a, b) => b.year - a.year || a.label.localeCompare(b.label)
  )
})

const editTeamPlayers = computed(() =>
  playerStore.players
    .filter((p) => teamKeyOf(p) === editTeamKey.value)
    .sort((a, b) => (a.player_number ?? 0) - (b.player_number ?? 0))
)

/** Switching teams must clear the player, or the form keeps editing someone
 *  who is no longer in the visible list. */
function onEditTeamChange() {
  selectedEditPlayerId.value = null
}


onMounted(() => {
  playerStore.fetchAll()
})

const showModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const modalMessage = ref('')
const modalMsgClass = ref('')
const selectedDeletePlayerId = ref<number | null>(null)
const deleteMessage = ref('')
const deleteMsgClass = ref('')

const deletePlayerName = computed(() => {
  if (!selectedDeletePlayerId.value) return ''
  const p = playerStore.players.find(p => p.player_number === selectedDeletePlayerId.value)
  return p ? `#${p.player_number} ${p.first_name} ${p.last_name}` : ''
})

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
  modalForm.sport = sportStore.activeSport
  modalMessage.value = ''
  modalMsgClass.value = ''
}

function openAddModal() {
  resetModalForm()
  showModal.value = true
}

function openEditModal() {
  // Start clean: reopening should not land on the team picked last time.
  editTeamKey.value = ''
  selectedEditPlayerId.value = null
  // Refresh, so a player added since the page loaded appears in the list.
  playerStore.fetchAll()
  showEditModal.value = true
}

function openDeleteModal() {
  selectedDeletePlayerId.value = null
  deleteMessage.value = ''
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  selectedDeletePlayerId.value = null
  deleteMessage.value = ''
}

async function confirmDelete() {
  if (!selectedDeletePlayerId.value) return

  try {
    await playerStore.remove(selectedDeletePlayerId.value)
    closeDeleteModal()
  } catch (err) {
    deleteMessage.value = 'Failed to delete player'
    deleteMsgClass.value = 'bg-red-100 text-red-700'
  }
}

function closeEditModal() {
  showEditModal.value = false
  editTeamKey.value = ''
  selectedEditPlayerId.value = null
  playerImageFileEdit.value = null
  playerImagePreviewEdit.value = ''
}

function closeModal() {
  showModal.value = false
  modalMessage.value = ''
  playerImageFileAdd.value = null
  playerImagePreviewAdd.value = ''
}

const modalSubmit = async () => {
  try {
    await playerStore.add(modalForm as Omit<Player, 'id'>)
    closeModal()
  } catch (err) {
    console.error("Create player error:", err)
  }
}

// ======================================================
// SCHEDULE
// ======================================================

const showScheduleModal = ref(false)
const scheduleMessage = ref('')
const scheduleMsgClass = ref('')

const scheduleForm = reactive<NewScheduleEntry>({
  date: '',
  time: '',
  type: 'Game',
  league: '',
  sport: 'Baseball',
  location: null,
  opponent: null,
  home_away: null,
  notes: null,
  season: null,
  year: new Date().getFullYear(),
  uniform_id: null,
  jersey_color: null,
  pants_color: null,
  hat_color: null
})

function openScheduleModal() {
  loadUniforms()
  scheduleForm.date = ''
  scheduleForm.time = ''
  scheduleForm.type = 'Game'
  scheduleForm.league = ''
  scheduleForm.sport = sportStore.activeSport
  scheduleForm.location = null
  scheduleForm.opponent = null
  scheduleForm.home_away = null
  scheduleForm.notes = null
  scheduleForm.season = null
  scheduleForm.year = new Date().getFullYear()
  scheduleForm.jersey_color = null
  scheduleForm.pants_color = null
  scheduleForm.hat_color = null
  scheduleForm.season = null
  scheduleForm.year = new Date().getFullYear()
  scheduleMessage.value = ''
  showScheduleModal.value = true
}

function closeScheduleModal() {
  showScheduleModal.value = false
  scheduleMessage.value = ''
}

async function submitSchedule() {
  try {
    await createScheduleEntry(scheduleForm)
    scheduleMessage.value = 'Schedule entry added!'
    scheduleMsgClass.value = 'bg-green-100 text-green-700'
    setTimeout(() => closeScheduleModal(), 1000)
  } catch (err) {
    console.error('Schedule error:', err)
    scheduleMessage.value = 'Failed to add entry'
    scheduleMsgClass.value = 'bg-red-100 text-red-700'
  }
}

// ======================================================
// EDIT SCHEDULE
// ======================================================

const showEditScheduleModal = ref(false)
const scheduleEntries = ref<ScheduleEntry[]>([])
const selectedEditScheduleId = ref<number | null>(null)
const editScheduleMessage = ref('')
const editScheduleMsgClass = ref('')

const editScheduleForm = reactive<NewScheduleEntry>({
  date: '',
  time: '',
  type: 'Game',
  league: '',
  sport: 'Baseball',
  location: null,
  opponent: null,
  home_away: null,
  notes: null,
  season: null,
  year: new Date().getFullYear(),
  uniform_id: null,
  jersey_color: null,
  pants_color: null,
  hat_color: null
})

async function openEditScheduleModal() {
  loadUniforms()
  try {
    scheduleEntries.value = await getSchedule()
  } catch (err) {
    console.error('Failed to load schedule entries:', err)
  }
  selectedEditScheduleId.value = null
  editScheduleMessage.value = ''
  showEditScheduleModal.value = true
}

function loadEditSchedule() {
  const entry = scheduleEntries.value.find(e => e.id === selectedEditScheduleId.value)
  if (entry) {
    Object.assign(editScheduleForm, {
      date: entry.date,
      time: entry.time,
      type: entry.type,
      league: entry.league,
      sport: entry.sport,
      location: entry.location,
      opponent: entry.opponent,
      home_away: entry.home_away,
      notes: entry.notes,
      season: entry.season,
      year: entry.year,
      uniform_id: entry.uniform_id ?? null,
      jersey_color: entry.jersey_color,
      pants_color: entry.pants_color,
      hat_color: entry.hat_color
    })
  }
}

function closeEditScheduleModal() {
  showEditScheduleModal.value = false
  selectedEditScheduleId.value = null
  editScheduleMessage.value = ''
}

async function submitEditSchedule() {
  if (!selectedEditScheduleId.value) return

  try {
    await updateScheduleEntry(selectedEditScheduleId.value, editScheduleForm)
    editScheduleMessage.value = 'Schedule entry updated!'
    editScheduleMsgClass.value = 'bg-green-100 text-green-700'
    setTimeout(() => closeEditScheduleModal(), 1000)
  } catch (err) {
    console.error('Edit schedule error:', err)
    editScheduleMessage.value = 'Failed to update entry'
    editScheduleMsgClass.value = 'bg-red-100 text-red-700'
  }
}

// ======================================================
// DELETE SCHEDULE
// ======================================================

const showDeleteScheduleModal = ref(false)
const selectedDeleteScheduleId = ref<number | null>(null)
const deleteScheduleMessage = ref('')
const deleteScheduleMsgClass = ref('')

async function openDeleteScheduleModal() {
  try {
    scheduleEntries.value = await getSchedule()
    selectedDeleteScheduleId.value = null
    deleteScheduleMessage.value = ''
    showDeleteScheduleModal.value = true
  } catch (err) {
    console.error('Failed to load schedule entries:', err)
  }
}

function closeDeleteScheduleModal() {
  showDeleteScheduleModal.value = false
  selectedDeleteScheduleId.value = null
  deleteScheduleMessage.value = ''
}

async function confirmDeleteSchedule() {
  if (!selectedDeleteScheduleId.value) return

  try {
    await deleteScheduleEntry(selectedDeleteScheduleId.value)
    deleteScheduleMessage.value = 'Schedule entry deleted!'
    deleteScheduleMsgClass.value = 'bg-green-100 text-green-700'
    scheduleEntries.value = await getSchedule()
    setTimeout(() => closeDeleteScheduleModal(), 1000)
  } catch (err: any) {
    console.error('Delete schedule error:', err)
    deleteScheduleMessage.value = err.response?.data?.error || 'Failed to delete entry'
    deleteScheduleMsgClass.value = 'bg-red-100 text-red-700'
  }
}

// ======================================================
// NEWS
// ======================================================
const showNewsModal = ref(false)
const newsMessage = ref('')
const newsMsgClass = ref('')

const newsForm = reactive<NewNewsArticle>({
  title: '',
  content: '',
  author: null,
  sport: 'Baseball',
  image_path: null
})

function openNewsModal() {
  newsForm.title = ''
  newsForm.content = ''
  newsForm.author = null
  newsForm.sport = sportStore.activeSport
  newsForm.image_path = null
  newsMessage.value = ''
  showNewsModal.value = true
}

function closeNewsModal() {
  showNewsModal.value = false
  newsMessage.value = ''
}

async function submitNews() {
  try {
    await createNews(newsForm)
    newsMessage.value = 'News article published!'
    newsMsgClass.value = 'bg-green-100 text-green-700'
    setTimeout(() => closeNewsModal(), 1000)
  } catch (err) {
    console.error('News error:', err)
    newsMessage.value = 'Failed to publish article'
    newsMsgClass.value = 'bg-red-100 text-red-700'
  }
}

// ======================================================
// EDIT NEWS
// ======================================================

const showEditNewsModal = ref(false)
const editNewsMessage = ref('')
const editNewsMsgClass = ref('')
const selectedEditNewsId = ref<number | null>(null)
const allNews = ref<NewsArticle[]>([])

const editNewsForm = reactive<NewNewsArticle>({
  title: '',
  content: '',
  author: null,
  sport: 'Baseball',
  image_path: null
})

async function openEditNewsModal() {
  try {
    allNews.value = await getNews() // Fetch all news articles
    selectedEditNewsId.value = null
    editNewsMessage.value = ''
    showEditNewsModal.value = true
  } catch (err) {
    console.error('Failed to load news:', err)
  }
}

function loadNewsForEdit() {
  if (!selectedEditNewsId.value) return
  
  const article = allNews.value.find(a => a.id === selectedEditNewsId.value)
  if (article) {
    editNewsForm.title = article.title
    editNewsForm.content = article.content
    editNewsForm.author = article.author
    editNewsForm.sport = article.sport
    editNewsForm.image_path = article.image_path
  }
}

function closeEditNewsModal() {
  showEditNewsModal.value = false
  selectedEditNewsId.value = null
  editNewsMessage.value = ''
}

async function submitEditNews() {
  if (!selectedEditNewsId.value) return

  try {
    await updateNews(selectedEditNewsId.value, editNewsForm)
    editNewsMessage.value = 'Article updated!'
    editNewsMsgClass.value = 'bg-green-100 text-green-700'
    setTimeout(() => closeEditNewsModal(), 1000)
  } catch (err) {
    console.error('Edit news error:', err)
    editNewsMessage.value = 'Failed to update article'
    editNewsMsgClass.value = 'bg-red-100 text-red-700'
  }
}

// ======================================================
// DELETE NEWS
// ======================================================

const showDeleteNewsModal = ref(false)
const deleteNewsMessage = ref('')
const deleteNewsMsgClass = ref('')
const selectedDeleteNewsId = ref<number | null>(null)

async function openDeleteNewsModal() {
  try {
    allNews.value = await getNews() // Fetch all news articles
    selectedDeleteNewsId.value = null
    deleteNewsMessage.value = ''
    showDeleteNewsModal.value = true
  } catch (err) {
    console.error('Failed to load news:', err)
  }
}

function closeDeleteNewsModal() {
  showDeleteNewsModal.value = false
  selectedDeleteNewsId.value = null
  deleteNewsMessage.value = ''
}

async function submitDeleteNews() {
  if (!selectedDeleteNewsId.value) return

  try {
    await deleteNews(selectedDeleteNewsId.value)
    deleteNewsMessage.value = 'Article deleted!'
    deleteNewsMsgClass.value = 'bg-green-100 text-green-700'
    setTimeout(() => closeDeleteNewsModal(), 1000)
  } catch (err) {
    console.error('Delete news error:', err)
    deleteNewsMessage.value = 'Failed to delete article'
    deleteNewsMsgClass.value = 'bg-red-100 text-red-700'
  }
}

// ======================================================
// FILE UPLOAD
// ======================================================

const dragActive = ref(false)
const uploadingAdd = ref(false)
const uploadingEdit = ref(false)
const fileInputAdd = ref<HTMLInputElement | null>(null)
const fileInputEdit = ref<HTMLInputElement | null>(null)
const fileInputPlayerAdd = ref<HTMLInputElement | null>(null)
const fileInputPlayerEdit = ref<HTMLInputElement | null>(null)
const uploadingPlayerAdd = ref(false)
const uploadingPlayerEdit = ref(false)
const playerImageFileAdd = ref<File | null>(null)
const playerImagePreviewAdd = ref<string>('')
const playerImageFileEdit = ref<File | null>(null)
const playerImagePreviewEdit = ref<string>('')

async function uploadFile(file: File, mode: 'add' | 'edit' | 'swag-add' | 'uniform-add'| 'swag-edit' | 'player-add' | 'player-edit') {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('Please upload an image file')
    return
  }

  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('File too large. Maximum size is 5MB')
    return
  }

  try {
    if (mode === 'add') {
      uploadingAdd.value = true
    } else if (mode === 'edit') {
      uploadingEdit.value = true
    } else if (mode === 'swag-add') {
      uploadingSwagAdd.value = true
    } else if (mode === 'swag-edit') {
      uploadingSwagEdit.value = true
    } else if (mode === 'uniform-add') {
      uploadingUniformAdd.value = true
    } else if (mode === 'player-add') {
      uploadingPlayerAdd.value = true
    } else if (mode === 'player-edit') {
      uploadingPlayerEdit.value = true
    }

    const response = await uploadImage(file)
    
    // Update form with uploaded image path
    if (mode === 'add') {
      newsForm.image_path = response.path
    } else if (mode === 'edit') {
      editNewsForm.image_path = response.path
    } else if (mode === 'swag-add') {
      swagForm.image_path = response.path
    } else if (mode === 'swag-edit') {
      editSwagForm.image_path = response.path
    } else if (mode === 'uniform-add') {
      uniformForm.image_path = response.path
    } else if (mode === 'player-add') {
      modalForm.photo_path = response.path
    } else if (mode === 'player-edit') {
      editPlayer.photo_path = response.path
    }
  } catch (err) {
    console.error('Upload error:', err)
    alert('Failed to upload image')
  } finally {
    if (mode === 'add') {
      uploadingAdd.value = false
    } else if (mode === 'edit') {
      uploadingEdit.value = false
    } else if (mode === 'swag-add') {
      uploadingSwagAdd.value = false
    } else if (mode === 'swag-edit') {
      uploadingSwagEdit.value = false
    } else if (mode === 'uniform-add') {
      uploadingUniformAdd.value = false
    } else if (mode === 'player-add') {
      uploadingPlayerAdd.value = false
    } else if (mode === 'player-edit') {
      uploadingPlayerEdit.value = false
    }
  }
}

function removeImage(mode: 'add' | 'edit' | 'swag-add' | 'swag-edit' | 'uniform-add'| 'player-add' | 'player-edit') {
  if (mode === 'add') {
    newsForm.image_path = null
    if (fileInputAdd.value) {
      fileInputAdd.value.value = ''
    }
  } else if (mode === 'edit') {
    editNewsForm.image_path = null
    if (fileInputEdit.value) {
      fileInputEdit.value.value = ''
    }
  } else if (mode === 'swag-add') {
    swagForm.image_path = null
    if (fileInputSwagAdd.value) {
      fileInputSwagAdd.value.value = ''
    }
  } else if (mode === 'swag-edit') {
    editSwagForm.image_path = null
    if (fileInputSwagEdit.value) {
      fileInputSwagEdit.value.value = ''
    }
  } else if (mode === 'uniform-add') {
    uniformForm.image_path = null
    if (fileInputUniformAdd.value) {
      fileInputUniformAdd.value.value = ''
    }
  } else if (mode === 'player-add') {
    modalForm.photo_path = ''
    playerImageFileAdd.value = null
    playerImagePreviewAdd.value = ''
    if (fileInputPlayerAdd.value) {
      fileInputPlayerAdd.value.value = ''
    }
  } else if (mode === 'player-edit') {
    editPlayer.photo_path = ''
    playerImageFileEdit.value = null
    playerImagePreviewEdit.value = ''
    if (fileInputPlayerEdit.value) {
      fileInputPlayerEdit.value.value = ''
    }
  }
}

function triggerFileInput(mode: 'add' | 'edit' | 'swag-add' | 'swag-edit' | 'uniform-add' | 'player-add' | 'player-edit') {
  if (mode === 'add') {
    fileInputAdd.value?.click()
  } else if (mode === 'edit') {
    fileInputEdit.value?.click()
  } else if (mode === 'swag-add') {
    fileInputSwagAdd.value?.click()
  } else if (mode === 'swag-edit') {
    fileInputSwagEdit.value?.click()
  } else if (mode === 'uniform-add') {
    fileInputUniformAdd.value?.click()
  } else if (mode === 'player-add') {
    fileInputPlayerAdd.value?.click()
  } else if (mode === 'player-edit') {
    fileInputPlayerEdit.value?.click()
  }
}

async function handleFileSelect(event: Event, mode: 'add' | 'edit' | 'swag-add' | 'swag-edit' | 'uniform-add' | 'player-add' | 'player-edit') {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    await uploadFile(target.files[0], mode)
  }
}

async function handleDrop(event: DragEvent, mode: 'add' | 'edit' | 'swag-add' | 'swag-edit' | 'uniform-add' | 'player-add' | 'player-edit') {
  dragActive.value = false
  
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    await uploadFile(event.dataTransfer.files[0], mode)
  }
}

// ======================================================
// SWAG
// ======================================================
const showUniformModal = ref(false)
const uniformMsgClass = ref('')
const uniformTitle = ref('')
const uniformMessage = ref('')
const uploadingUniformAdd = ref(false)
const fileInputUniformAdd = ref<HTMLInputElement | null>(null)
// Loaded when a schedule modal opens, so the picker always reflects what exists.
const uniforms = ref<Uniform[]>([])

async function loadUniforms() {
  try {
    uniforms.value = await getUniform()
  } catch (err) {
    console.error('Failed to load uniforms:', err)
    uniforms.value = []
  }
}

const uniformForm = reactive<NewUniformItem>({
  title: '',
  image_path: null
})

function openUniformModal() {
  loadUniforms()
  uniformForm.title = ''
  uniformForm.image_path = null
  uniformTitle.value = ''
  showUniformModal.value = true
  uniformMessage.value = ''
}

function closeUniformModal() {
  showUniformModal.value = false
  uniformMessage.value = ''
}

async function removeUniform(u: Uniform) {
  if (!confirm(`Delete the "${u.title}" uniform? Schedule entries using it will lose the photo.`)) return

  try {
    await deleteUniform(u.id)
    await loadUniforms()
  } catch (err) {
    console.error('Delete uniform error:', err)
    uniformMessage.value = 'Failed to delete uniform'
    uniformMsgClass.value = 'bg-red-100 text-red-700'
  }
}

async function submitUniform() {
  try {
    await createUniform(uniformForm)
    await loadUniforms()
    uniformMessage.value = 'Uniform added!'
    uniformMsgClass.value = 'bg-green-100 text-green-700'
    setTimeout(() => closeUniformModal(), 1000)
  } catch (err) {
    console.error('Uniform error:', err)
    uniformMessage.value = 'Failed to add item'
    uniformMsgClass.value = 'bg-red-100 text-red-700'
  }
}
//
const showSwagModal = ref(false)
const swagMessage = ref('')
const swagMsgClass = ref('')
const uploadingSwagAdd = ref(false)
const fileInputSwagAdd = ref<HTMLInputElement | null>(null)

const swagForm = reactive<NewSwagItem>({
  title: '',
  description: null,
  price: 0,
  image_path: null,
  sport: 'Baseball',
  url: null
})

function openSwagModal() {
  swagForm.title = ''
  swagForm.description = null
  swagForm.price = 0
  swagForm.image_path = null
  swagForm.sport = sportStore.activeSport
  swagForm.url = null
  swagMessage.value = ''
  showSwagModal.value = true
}

function closeSwagModal() {
  showSwagModal.value = false
  swagMessage.value = ''
}

async function submitSwag() {
  try {
    await createSwag(swagForm)
    swagMessage.value = 'Swag item added!'
    swagMsgClass.value = 'bg-green-100 text-green-700'
    setTimeout(() => closeSwagModal(), 1000)
  } catch (err) {
    console.error('Swag error:', err)
    swagMessage.value = 'Failed to add item'
    swagMsgClass.value = 'bg-red-100 text-red-700'
  }
}

// ======================================================
// EDIT SWAG
// ======================================================

const showEditSwagModal = ref(false)
const editSwagMessage = ref('')
const editSwagMsgClass = ref('')
const selectedEditSwagId = ref<number | null>(null)
const allSwag = ref<SwagItem[]>([])
const uploadingSwagEdit = ref(false)
const fileInputSwagEdit = ref<HTMLInputElement | null>(null)

const editSwagForm = reactive<NewSwagItem>({
  title: '',
  description: null,
  price: 0,
  image_path: null,
  sport: 'Baseball',
  url: null
})

async function openEditSwagModal() {
  try {
    allSwag.value = await getSwag()
    selectedEditSwagId.value = null
    editSwagMessage.value = ''
    showEditSwagModal.value = true
  } catch (err) {
    console.error('Failed to load swag:', err)
  }
}

function loadSwagForEdit() {
  if (!selectedEditSwagId.value) return
  
  const item = allSwag.value.find(s => s.id === selectedEditSwagId.value)
  if (item) {
    editSwagForm.title = item.title
    editSwagForm.description = item.description
    editSwagForm.price = item.price
    editSwagForm.image_path = item.image_path
    editSwagForm.sport = item.sport
    editSwagForm.url = item.url
  }
}

function closeEditSwagModal() {
  showEditSwagModal.value = false
  selectedEditSwagId.value = null
  editSwagMessage.value = ''
}

async function submitEditSwag() {
  if (!selectedEditSwagId.value) return

  try {
    await updateSwag(selectedEditSwagId.value, editSwagForm)
    editSwagMessage.value = 'Item updated!'
    editSwagMsgClass.value = 'bg-green-100 text-green-700'
    setTimeout(() => closeEditSwagModal(), 1000)
  } catch (err) {
    console.error('Edit swag error:', err)
    editSwagMessage.value = 'Failed to update item'
    editSwagMsgClass.value = 'bg-red-100 text-red-700'
  }
}

// ======================================================
// DELETE SWAG
// ======================================================

const showDeleteSwagModal = ref(false)
const deleteSwagMessage = ref('')
const deleteSwagMsgClass = ref('')
const selectedDeleteSwagId = ref<number | null>(null)

async function openDeleteSwagModal() {
  try {
    allSwag.value = await getSwag()
    selectedDeleteSwagId.value = null
    deleteSwagMessage.value = ''
    showDeleteSwagModal.value = true
  } catch (err) {
    console.error('Failed to load swag:', err)
  }
}

function closeDeleteSwagModal() {
  showDeleteSwagModal.value = false
  selectedDeleteSwagId.value = null
  deleteSwagMessage.value = ''
}

async function submitDeleteSwag() {
  if (!selectedDeleteSwagId.value) return

  try {
    await deleteSwag(selectedDeleteSwagId.value)
    deleteSwagMessage.value = 'Item deleted!'
    deleteSwagMsgClass.value = 'bg-green-100 text-green-700'
    setTimeout(() => closeDeleteSwagModal(), 1000)
  } catch (err) {
    console.error('Delete swag error:', err)
    deleteSwagMessage.value = 'Failed to delete item'
    deleteSwagMsgClass.value = 'bg-red-100 text-red-700'
  }
}

// ======================================================
// STATS UPLOAD
// ======================================================

const showStatsModal = ref(false)
const statsMessage = ref('')
const statsMsgClass = ref('')
const uploadingStats = ref(false)
const statsFile = ref<File | null>(null)
const statsFileInput = ref<HTMLInputElement | null>(null)
const availableTeams = ref<Team[]>([])

const statsForm = reactive({
  league: '',
  sport: 'Baseball',
  // Which season this upload belongs to. Uploading a new season no longer
  // replaces the previous one, so this has to be right.
  season: 'Fall',
  year: new Date().getFullYear()
})

async function openStatsModal() {
  try {
    availableTeams.value = await getTeams()
  } catch (err) {
    console.error('Failed to load teams:', err)
    availableTeams.value = []
  }
  statsForm.league = ''
  statsForm.sport = sportStore.activeSport
  statsFile.value = null
  statsMessage.value = ''
  showStatsModal.value = true
}

function closeStatsModal() {
  showStatsModal.value = false
  statsMessage.value = ''
}

function triggerStatsFileInput() {
  statsFileInput.value?.click()
}

function handleStatsFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    statsFile.value = target.files[0]
  }
}

function handleStatsDrop(event: DragEvent) {
  dragActive.value = false
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    const file = event.dataTransfer.files[0]
    if (file.name.endsWith('.csv')) {
      statsFile.value = file
    } else {
      alert('Please upload a CSV file')
    }
  }
}

function removeStatsFile() {
  statsFile.value = null
  if (statsFileInput.value) {
    statsFileInput.value.value = ''
  }
}

async function submitStats() {
  if (!statsFile.value || !statsForm.league) return

  uploadingStats.value = true
  statsMessage.value = ''

  try {
    const result = await uploadTeamStats(
      statsFile.value, statsForm.league, statsForm.sport, statsForm.season, statsForm.year
    )

    if (result) {
      statsMessage.value = `Successfully uploaded! Batting: ${result.batting}, Pitching: ${result.pitching}, Teams: ${result.teams}`
      statsMsgClass.value = 'bg-green-100 text-green-700'
      setTimeout(() => closeStatsModal(), 3000)
    }
  } catch (err: any) {
    console.error('Stats upload error:', err)
    statsMessage.value = err.response?.data?.error || 'Failed to upload stats'
    statsMsgClass.value = 'bg-red-100 text-red-700'
  } finally {
    uploadingStats.value = false
  }
}

// ======================================================
// TEAM RECORD
// ======================================================

const showRecordModal = ref(false)
const recordMessage = ref('')
const recordMsgClass = ref('')
const savingRecord = ref(false)

const recordForm = reactive({
  league: '',
  sport: 'Baseball',
  team_name: '',
  season: 'Fall',
  year: new Date().getFullYear(),
  wins: 0,
  losses: 0,
  ties: 0
})

async function openRecordModal() {
  try {
    availableTeams.value = await getTeams()
  } catch (err) {
    console.error('Failed to load teams:', err)
    availableTeams.value = []
  }
  recordForm.league = ''
  recordForm.sport = sportStore.activeSport
  recordForm.team_name = ''
  recordForm.wins = 0
  recordForm.losses = 0
  recordForm.ties = 0
  recordMessage.value = ''
  showRecordModal.value = true
}

function closeRecordModal() {
  showRecordModal.value = false
  recordMessage.value = ''
}

// Prefill with whatever record is already stored for the chosen league
async function loadExistingRecord() {
  if (!recordForm.league) return

  try {
    const stats = await getTeamStats({
      league: recordForm.league,
      sport: recordForm.sport,
      season: recordForm.season,
      year: recordForm.year,
    })
    const existing = stats[0]

    recordForm.team_name = existing?.team_name || ''
    recordForm.wins = existing?.wins || 0
    recordForm.losses = existing?.losses || 0
    recordForm.ties = existing?.ties || 0
  } catch (err) {
    console.error('Failed to load team record:', err)
  }
}

async function submitRecord() {
  if (!recordForm.league) return

  savingRecord.value = true
  recordMessage.value = ''

  try {
    await updateTeamRecord({
      league: recordForm.league,
      sport: recordForm.sport,
      team_name: recordForm.team_name || undefined,
      season: recordForm.season,
      year: recordForm.year,
      wins: recordForm.wins || 0,
      losses: recordForm.losses || 0,
      ties: recordForm.ties || 0
    })

    recordMessage.value = 'Record updated!'
    recordMsgClass.value = 'bg-green-100 text-green-700'
    setTimeout(() => closeRecordModal(), 1500)
  } catch (err: any) {
    console.error('Team record error:', err)
    recordMessage.value = err.response?.data?.error || 'Failed to update record'
    recordMsgClass.value = 'bg-red-100 text-red-700'
  } finally {
    savingRecord.value = false
  }
}

// ======================================================
// COACH MANAGEMENT
// ======================================================

const allCoaches = ref<Coach[]>([])

// Add Coach
const showAddCoachModal = ref(false)
const addCoachMessage = ref('')
const addCoachMsgClass = ref('')

const addCoachForm = reactive({
  first_name: '',
  last_name: '',
  league: '',
  season: '',
  year: new Date().getFullYear(),
  archive: 'N'
})

async function openAddCoachModal() {
  try {
    allCoaches.value = await getCoaches()
    addCoachForm.first_name = ''
    addCoachForm.last_name = ''
    addCoachForm.league = ''
    addCoachForm.season = ''
    addCoachForm.year = new Date().getFullYear()
    addCoachForm.archive = 'N'
    addCoachMessage.value = ''
    showAddCoachModal.value = true
  } catch (err) {
    console.error('Failed to load coaches:', err)
  }
}

function closeAddCoachModal() {
  showAddCoachModal.value = false
  addCoachMessage.value = ''
}

async function submitAddCoach() {
  try {
    await createCoach(addCoachForm)
    addCoachMessage.value = 'Coach added successfully!'
    addCoachMsgClass.value = 'bg-green-100 text-green-700'
    allCoaches.value = await getCoaches()
    setTimeout(() => closeAddCoachModal(), 1500)
  } catch (err: any) {
    console.error('Add coach error:', err)
    addCoachMessage.value = err.response?.data?.error || 'Failed to add coach'
    addCoachMsgClass.value = 'bg-red-100 text-red-700'
  }
}

// Edit Coach
const showEditCoachModal = ref(false)
const selectedEditCoachId = ref('')
const editCoachMessage = ref('')
const editCoachMsgClass = ref('')
const originalCoachKey = ref({ lastName: '', league: '', season: '', year: 0 })

const editCoachForm = reactive({
  first_name: '',
  last_name: '',
  league: '',
  season: '',
  year: new Date().getFullYear(),
  archive: 'N'
})

async function openEditCoachModal() {
  try {
    allCoaches.value = await getCoaches()
    selectedEditCoachId.value = ''
    editCoachMessage.value = ''
    showEditCoachModal.value = true
  } catch (err) {
    console.error('Failed to load coaches:', err)
  }
}

function closeEditCoachModal() {
  showEditCoachModal.value = false
  selectedEditCoachId.value = ''
  editCoachMessage.value = ''
}

function loadEditCoach() {
  const [lastName, league, season, year] = selectedEditCoachId.value.split('|')
  const coach = allCoaches.value.find(
    c => c.last_name === lastName && c.league === league && c.season === season && c.year === Number(year)
  )

  if (coach) {
    originalCoachKey.value = { lastName, league, season, year: Number(year) }
    editCoachForm.first_name = coach.first_name
    editCoachForm.last_name = coach.last_name
    editCoachForm.league = coach.league
    editCoachForm.season = coach.season
    editCoachForm.year = coach.year
    editCoachForm.archive = coach.archive
  }
}

async function submitEditCoach() {
  try {
    await updateCoach(
      originalCoachKey.value.lastName,
      originalCoachKey.value.league,
      originalCoachKey.value.season,
      originalCoachKey.value.year,
      editCoachForm
    )
    editCoachMessage.value = 'Coach updated successfully!'
    editCoachMsgClass.value = 'bg-green-100 text-green-700'
    allCoaches.value = await getCoaches()
    setTimeout(() => closeEditCoachModal(), 1500)
  } catch (err: any) {
    console.error('Update coach error:', err)
    editCoachMessage.value = err.response?.data?.error || 'Failed to update coach'
    editCoachMsgClass.value = 'bg-red-100 text-red-700'
  }
}

// Delete Coach
const showDeleteCoachModal = ref(false)
const selectedDeleteCoachId = ref('')
const deleteCoachMessage = ref('')
const deleteCoachMsgClass = ref('')

const deleteCoachName = computed(() => {
  if (!selectedDeleteCoachId.value) return ''
  const [lastName, league, season, year] = selectedDeleteCoachId.value.split('|')
  const coach = allCoaches.value.find(
    c => c.last_name === lastName && c.league === league && c.season === season && c.year === Number(year)
  )
  return coach ? `${coach.first_name} ${coach.last_name}` : ''
})

async function openDeleteCoachModal() {
  try {
    allCoaches.value = await getCoaches()
    selectedDeleteCoachId.value = ''
    deleteCoachMessage.value = ''
    showDeleteCoachModal.value = true
  } catch (err) {
    console.error('Failed to load coaches:', err)
  }
}

function closeDeleteCoachModal() {
  showDeleteCoachModal.value = false
  selectedDeleteCoachId.value = ''
  deleteCoachMessage.value = ''
}

async function confirmDeleteCoach() {
  if (!selectedDeleteCoachId.value) return

  const [lastName, league, season, year] = selectedDeleteCoachId.value.split('|')

  try {
    await deleteCoach(lastName, league, season, Number(year))
    deleteCoachMessage.value = 'Coach deleted successfully!'
    deleteCoachMsgClass.value = 'bg-green-100 text-green-700'
    allCoaches.value = await getCoaches()
    setTimeout(() => closeDeleteCoachModal(), 1000)
  } catch (err: any) {
    console.error('Delete coach error:', err)
    deleteCoachMessage.value = err.response?.data?.error || 'Failed to delete coach'
    deleteCoachMsgClass.value = 'bg-red-100 text-red-700'
  }
}

// ======================================================
// ASSISTANT COACH MANAGEMENT
// ======================================================

const allAssistantCoaches = ref<Assistant[]>([])

// Add Assistant Coach
const showAddAssistantCoachModal = ref(false)
const addAssistantCoachMessage = ref('')
const addAssistantCoachMsgClass = ref('')
const selectedHeadCoachForAssistant = ref('')

const addAssistantCoachForm = reactive({
  head_coach_last_name: '',
  head_coach_league: '',
  head_coach_season: '',
  head_coach_year: 0,
  first_name: '',
  last_name: ''
})

async function openAddAssistantCoachModal() {
  try {
    allCoaches.value = await getCoaches()
    allAssistantCoaches.value = await getAssistants()
    selectedHeadCoachForAssistant.value = ''
    addAssistantCoachForm.first_name = ''
    addAssistantCoachForm.last_name = ''
    addAssistantCoachForm.head_coach_last_name = ''
    addAssistantCoachForm.head_coach_league = ''
    addAssistantCoachForm.head_coach_season = ''
    addAssistantCoachForm.head_coach_year = 0
    addAssistantCoachMessage.value = ''
    showAddAssistantCoachModal.value = true
  } catch (err) {
    // Open anyway and say what went wrong - a button that does nothing at all
    // is indistinguishable from a broken page.
    console.error('Failed to load data:', err)
    allCoaches.value = []
    allAssistantCoaches.value = []
    addAssistantCoachMessage.value = 'Could not load coaches. Please refresh and try again.'
    addAssistantCoachMsgClass.value = 'bg-red-100 text-red-700'
    showAddAssistantCoachModal.value = true
  }
}

function closeAddAssistantCoachModal() {
  showAddAssistantCoachModal.value = false
  addAssistantCoachMessage.value = ''
  selectedHeadCoachForAssistant.value = ''
}

function updateHeadCoachFieldsForAssistant() {
  const [lastName, league, season, year] = selectedHeadCoachForAssistant.value.split('|')
  addAssistantCoachForm.head_coach_last_name = lastName
  addAssistantCoachForm.head_coach_league = league
  addAssistantCoachForm.head_coach_season = season
  addAssistantCoachForm.head_coach_year = Number(year)
}

async function submitAddAssistantCoach() {
  try {
    await createAssistant(addAssistantCoachForm)
    addAssistantCoachMessage.value = 'Assistant coach added successfully!'
    addAssistantCoachMsgClass.value = 'bg-green-100 text-green-700'
    allAssistantCoaches.value = await getAssistants()
    setTimeout(() => closeAddAssistantCoachModal(), 1500)
  } catch (err: any) {
    console.error('Add assistant coach error:', err)
    addAssistantCoachMessage.value = err.response?.data?.error || 'Failed to add assistant coach'
    addAssistantCoachMsgClass.value = 'bg-red-100 text-red-700'
  }
}

// Edit Assistant Coach
const showEditAssistantCoachModal = ref(false)
const selectedEditAssistantCoachId = ref<number | null>(null)
const editAssistantCoachMessage = ref('')
const editAssistantCoachMsgClass = ref('')
const selectedHeadCoachForEdit = ref('')

const editAssistantCoachForm = reactive({
  head_coach_last_name: '',
  head_coach_league: '',
  head_coach_season: '',
  head_coach_year: 0,
  first_name: '',
  last_name: ''
})

async function openEditAssistantCoachModal() {
  try {
    allCoaches.value = await getCoaches()
    allAssistantCoaches.value = await getAssistants()
    selectedEditAssistantCoachId.value = null
    selectedHeadCoachForEdit.value = ''
    editAssistantCoachMessage.value = ''
    showEditAssistantCoachModal.value = true
  } catch (err) {
    console.error('Failed to load data:', err)
    allCoaches.value = []
    allAssistantCoaches.value = []
    editAssistantCoachMessage.value = 'Could not load assistant coaches. Please refresh and try again.'
    editAssistantCoachMsgClass.value = 'bg-red-100 text-red-700'
    showEditAssistantCoachModal.value = true
  }
}

function closeEditAssistantCoachModal() {
  showEditAssistantCoachModal.value = false
  selectedEditAssistantCoachId.value = null
  selectedHeadCoachForEdit.value = ''
  editAssistantCoachMessage.value = ''
}

function loadEditAssistantCoach() {
  const assistantCoach = allAssistantCoaches.value.find(a => a.id === selectedEditAssistantCoachId.value)

  if (assistantCoach) {
    editAssistantCoachForm.first_name = assistantCoach.first_name
    editAssistantCoachForm.last_name = assistantCoach.last_name
    editAssistantCoachForm.head_coach_last_name = assistantCoach.head_coach_last_name
    editAssistantCoachForm.head_coach_league = assistantCoach.head_coach_league
    editAssistantCoachForm.head_coach_season = assistantCoach.head_coach_season
    editAssistantCoachForm.head_coach_year = assistantCoach.head_coach_year
    selectedHeadCoachForEdit.value = `${assistantCoach.head_coach_last_name}|${assistantCoach.head_coach_league}|${assistantCoach.head_coach_season}|${assistantCoach.head_coach_year}`
  }
}

function updateHeadCoachFieldsForEdit() {
  const [lastName, league, season, year] = selectedHeadCoachForEdit.value.split('|')
  editAssistantCoachForm.head_coach_last_name = lastName
  editAssistantCoachForm.head_coach_league = league
  editAssistantCoachForm.head_coach_season = season
  editAssistantCoachForm.head_coach_year = Number(year)
}

async function submitEditAssistantCoach() {
  if (!selectedEditAssistantCoachId.value) return

  try {
    await updateAssistant(selectedEditAssistantCoachId.value, editAssistantCoachForm)
    editAssistantCoachMessage.value = 'Assistant coach updated successfully!'
    editAssistantCoachMsgClass.value = 'bg-green-100 text-green-700'
    allAssistantCoaches.value = await getAssistants()
    setTimeout(() => closeEditAssistantCoachModal(), 1500)
  } catch (err: any) {
    console.error('Update assistant coach error:', err)
    editAssistantCoachMessage.value = err.response?.data?.error || 'Failed to update assistant coach'
    editAssistantCoachMsgClass.value = 'bg-red-100 text-red-700'
  }
}

// Delete Assistant Coach
const showDeleteAssistantCoachModal = ref(false)
const selectedDeleteAssistantCoachId = ref<number | null>(null)
const deleteAssistantCoachMessage = ref('')
const deleteAssistantCoachMsgClass = ref('')

const deleteAssistantCoachName = computed(() => {
  if (!selectedDeleteAssistantCoachId.value) return ''
  const assistantCoach = allAssistantCoaches.value.find(a => a.id === selectedDeleteAssistantCoachId.value)
  return assistantCoach ? `${assistantCoach.first_name} ${assistantCoach.last_name}` : ''
})

async function openDeleteAssistantCoachModal() {
  try {
    allAssistantCoaches.value = await getAssistants()
    selectedDeleteAssistantCoachId.value = null
    deleteAssistantCoachMessage.value = ''
    showDeleteAssistantCoachModal.value = true
  } catch (err) {
    console.error('Failed to load assistant coaches:', err)
    allAssistantCoaches.value = []
    deleteAssistantCoachMessage.value = 'Could not load assistant coaches. Please refresh and try again.'
    deleteAssistantCoachMsgClass.value = 'bg-red-100 text-red-700'
    showDeleteAssistantCoachModal.value = true
  }
}

function closeDeleteAssistantCoachModal() {
  showDeleteAssistantCoachModal.value = false
  selectedDeleteAssistantCoachId.value = null
  deleteAssistantCoachMessage.value = ''
}

async function confirmDeleteAssistantCoach() {
  if (!selectedDeleteAssistantCoachId.value) return

  try {
    await deleteAssistant(selectedDeleteAssistantCoachId.value)
    deleteAssistantCoachMessage.value = 'Assistant coach deleted successfully!'
    deleteAssistantCoachMsgClass.value = 'bg-green-100 text-green-700'
    allAssistantCoaches.value = await getAssistants()
    setTimeout(() => closeDeleteAssistantCoachModal(), 1000)
  } catch (err: any) {
    console.error('Delete assistant coach error:', err)
    deleteAssistantCoachMessage.value = err.response?.data?.error || 'Failed to delete assistant coach'
    deleteAssistantCoachMsgClass.value = 'bg-red-100 text-red-700'
  }
}
</script>
