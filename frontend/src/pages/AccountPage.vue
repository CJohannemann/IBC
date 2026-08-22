<template>
  <div class="min-h-screen flex items-start justify-center p-4 sm:p-8">
    <div class="w-full max-w-md">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-8">
        <h1 class="text-2xl sm:text-3xl font-black text-ibc-navy">Your Account</h1>
        <router-link to="/admin/players" class="text-sm font-semibold text-ibc-blue hover:underline">
          &larr; Back to admin
        </router-link>
      </div>

      <div v-if="auth.user" class="bg-white rounded-lg shadow p-4 mb-6 text-sm">
        <div class="flex justify-between py-1">
          <span class="text-slate-500">Signed in as</span>
          <span class="font-bold text-ibc-navy">{{ auth.user.username }}</span>
        </div>
        <div class="flex justify-between py-1">
          <span class="text-slate-500">Role</span>
          <span class="font-semibold text-ibc-navy capitalize">{{ auth.user.role }}</span>
        </div>
      </div>

      <h2 class="text-xl font-bold text-ibc-navy mb-4 pb-2 border-b-2 border-ibc-navy">
        Change Password
      </h2>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-semibold mb-1">Current password</label>
          <input v-model="current" type="password" class="w-full p-2 border rounded"
            required autocomplete="current-password" />
        </div>

        <div>
          <label class="block text-sm font-semibold mb-1">New password</label>
          <input v-model="next" type="password" class="w-full p-2 border rounded"
            required autocomplete="new-password" />
          <p class="text-xs mt-1" :class="next.length === 0 ? 'text-slate-500' : tooShort ? 'text-red-600' : 'text-green-700'">
            At least {{ MIN_LENGTH }} characters. A short phrase is easier to remember and harder to guess
            than a single word.
          </p>
        </div>

        <div>
          <label class="block text-sm font-semibold mb-1">Confirm new password</label>
          <input v-model="confirm" type="password" class="w-full p-2 border rounded"
            required autocomplete="new-password" />
          <p v-if="confirm.length > 0 && !matches" class="text-xs text-red-600 mt-1">
            These do not match.
          </p>
        </div>

        <div v-if="error" class="text-red-600 text-sm bg-red-50 p-2 rounded">{{ error }}</div>
        <div v-if="success" class="text-green-800 text-sm bg-green-50 p-2 rounded">
          Password changed. Any other devices you were signed in on have been signed out.
        </div>

        <button type="submit" :disabled="loading || !canSubmit"
          class="w-full py-2 bg-ibc-navy text-white font-bold rounded hover:bg-ibc-blue transition disabled:opacity-50">
          {{ loading ? 'Saving...' : 'Change Password' }}
        </button>
      </form>

      <div class="mt-10 pt-6 border-t">
        <button @click="handleLogout"
          class="text-sm font-semibold text-red-600 hover:underline">
          Log out
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { changePassword } from '@/api/admin'

const MIN_LENGTH = 12

const router = useRouter()
const auth = useAuthStore()

const current = ref('')
const next = ref('')
const confirm = ref('')
const error = ref('')
const success = ref(false)
const loading = ref(false)

const tooShort = computed(() => next.value.length > 0 && next.value.length < MIN_LENGTH)
const matches = computed(() => next.value === confirm.value)
const canSubmit = computed(
  () => current.value.length > 0 && next.value.length >= MIN_LENGTH && matches.value
)

async function handleSubmit() {
  error.value = ''
  success.value = false

  // Checked here as well as on the server so the mistake is caught before a round trip.
  if (!matches.value) {
    error.value = 'The new passwords do not match.'
    return
  }

  loading.value = true
  const result = await changePassword(current.value, next.value)
  loading.value = false

  if (result.ok) {
    success.value = true
    current.value = ''
    next.value = ''
    confirm.value = ''
  } else {
    error.value = result.error ?? 'Something went wrong.'
  }
}

async function handleLogout() {
  await auth.logout()
  router.push('/admin/login')
}
</script>
