<template>
  <div class="min-h-screen p-4 sm:p-8">
    <div class="w-full max-w-4xl mx-auto">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-8">
        <h1 class="text-2xl sm:text-3xl font-black text-ibc-navy">Accounts</h1>
        <router-link to="/admin/players" class="text-sm font-semibold text-ibc-blue hover:underline">
          &larr; Back to admin
        </router-link>
      </div>

      <!-- A new password is shown once and never again, so it gets its own
           prominent block rather than a toast that can be missed. -->
      <div v-if="issued" class="bg-amber-50 border-2 border-amber-400 rounded-lg p-4 mb-6">
        <p class="font-bold text-amber-900 mb-1">Password for {{ issued.username }}</p>
        <p class="font-mono text-lg text-amber-950 bg-white rounded px-3 py-2 select-all break-all">
          {{ issued.password }}
        </p>
        <p class="text-sm text-amber-800 mt-2">
          Copy this now — it cannot be shown again. Send it to them privately; they can
          change it on their account page after signing in.
        </p>
        <button @click="issued = null" class="text-sm font-semibold text-amber-900 underline mt-2">
          Done
        </button>
      </div>

      <div v-if="error" class="text-red-700 text-sm bg-red-50 p-3 rounded mb-6">{{ error }}</div>

      <!-- Add -->
      <h2 class="text-xl font-bold text-ibc-navy mb-4 pb-2 border-b-2 border-ibc-navy">Add Account</h2>
      <form @submit.prevent="handleCreate" class="grid gap-4 sm:grid-cols-4 items-end mb-10">
        <div>
          <label class="block text-sm font-semibold mb-1">Username</label>
          <input v-model="form.username" type="text" class="w-full p-2 border rounded" required />
        </div>
        <div>
          <label class="block text-sm font-semibold mb-1">
            Email <span class="text-slate-400">(optional)</span>
          </label>
          <input v-model="form.email" type="email" class="w-full p-2 border rounded" />
        </div>
        <div>
          <label class="block text-sm font-semibold mb-1">Role</label>
          <select v-model="form.role" class="w-full p-2 border rounded">
            <option value="editor">Editor — edit site content</option>
            <option value="admin">Admin — also manage accounts</option>
          </select>
        </div>
        <button type="submit" :disabled="creating || !form.username"
          class="py-2 bg-ibc-navy text-white font-bold rounded hover:bg-ibc-blue transition disabled:opacity-50">
          {{ creating ? 'Creating...' : 'Create' }}
        </button>
      </form>

      <!-- List -->
      <h2 class="text-xl font-bold text-ibc-navy mb-4 pb-2 border-b-2 border-ibc-navy">Existing Accounts</h2>

      <p v-if="loading" class="text-slate-500 py-6">Loading...</p>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm bg-white rounded-lg shadow">
          <thead>
            <tr class="text-left border-b">
              <th class="p-3 font-bold text-ibc-navy">User</th>
              <th class="p-3 font-bold text-ibc-navy">Role</th>
              <th class="p-3 font-bold text-ibc-navy">Last login</th>
              <th class="p-3 font-bold text-ibc-navy text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id" class="border-b last:border-0"
              :class="{ 'opacity-50': !user.active }">
              <td class="p-3">
                <div class="font-semibold text-ibc-navy">
                  {{ user.username }}
                  <span v-if="user.id === auth.user?.id" class="text-xs font-normal text-slate-500">(you)</span>
                </div>
                <div class="text-xs text-slate-500">{{ user.email || 'no email' }}</div>
              </td>
              <td class="p-3">
                <select :value="user.role" @change="handleRole(user, $event)"
                  :disabled="user.id === auth.user?.id"
                  class="p-1 border rounded text-sm disabled:opacity-60">
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
                <div v-if="!user.active" class="text-xs font-bold text-red-600 mt-1">Disabled</div>
              </td>
              <td class="p-3 text-slate-600">{{ user.last_login || 'never' }}</td>
              <td class="p-3">
                <div class="flex gap-3 justify-end">
                  <template v-if="user.id !== auth.user?.id">
                    <button @click="handleReset(user)" class="font-semibold text-ibc-blue hover:underline">
                      Reset password
                    </button>
                    <button @click="handleActive(user)" class="font-semibold text-slate-600 hover:underline">
                      {{ user.active ? 'Disable' : 'Enable' }}
                    </button>
                    <button @click="handleDelete(user)" class="font-semibold text-red-600 hover:underline">
                      Delete
                    </button>
                  </template>
                  <router-link v-else to="/admin/account" class="font-semibold text-ibc-blue hover:underline">
                    Your account
                  </router-link>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="text-xs text-slate-500 mt-4">
        Disabling keeps the account and its history but blocks sign-in immediately, ending any
        open session. Deleting removes it entirely. Prefer disabling unless the account was
        created by mistake.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import {
  listUsers, createUser, setRole, setActive, resetPassword, deleteUser,
  type ManagedUser,
} from '@/api/users'

const auth = useAuthStore()

const users = ref<ManagedUser[]>([])
const loading = ref(true)
const creating = ref(false)
const error = ref('')
const issued = ref<{ username: string; password: string } | null>(null)

const form = reactive({
  username: '',
  email: '',
  role: 'editor' as 'admin' | 'editor',
})

async function refresh() {
  const result = await listUsers()

  if (result.ok && result.data) {
    users.value = result.data
    error.value = ''
  } else {
    error.value = result.error ?? 'Could not load accounts.'
  }

  loading.value = false
}

onMounted(refresh)

async function handleCreate() {
  error.value = ''
  creating.value = true

  const result = await createUser(form.username.trim(), form.email.trim(), form.role)
  creating.value = false

  if (!result.ok || !result.data) {
    error.value = result.error ?? 'Could not create the account.'
    return
  }

  issued.value = { username: result.data.user.username, password: result.data.password }
  form.username = ''
  form.email = ''
  form.role = 'editor'
  await refresh()
}

async function handleRole(user: ManagedUser, event: Event) {
  const role = (event.target as HTMLSelectElement).value as 'admin' | 'editor'
  error.value = ''

  const result = await setRole(user.id, role)
  if (!result.ok) error.value = result.error ?? 'Could not change the role.'

  // Refresh either way, so a rejected change snaps the dropdown back.
  await refresh()
}

async function handleActive(user: ManagedUser) {
  error.value = ''

  const result = await setActive(user.id, !user.active)
  if (!result.ok) error.value = result.error ?? 'Could not update the account.'

  await refresh()
}

async function handleReset(user: ManagedUser) {
  error.value = ''
  if (!confirm(`Reset the password for ${user.username}? They will be signed out.`)) return

  const result = await resetPassword(user.id)
  if (!result.ok || !result.data) {
    error.value = result.error ?? 'Could not reset the password.'
    return
  }

  issued.value = { username: user.username, password: result.data.password }
  await refresh()
}

async function handleDelete(user: ManagedUser) {
  error.value = ''
  if (!confirm(`Permanently delete ${user.username}? Disabling is usually better.`)) return

  const result = await deleteUser(user.id)
  if (!result.ok) error.value = result.error ?? 'Could not delete the account.'

  await refresh()
}
</script>
