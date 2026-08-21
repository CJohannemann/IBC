import axios from 'axios'
import api from './client'

export interface ManagedUser {
  id: number
  username: string
  email: string | null
  role: 'admin' | 'editor'
  active: 0 | 1
  created_at: string
  last_login: string | null
}

export interface ApiResult<T = void> {
  ok: boolean
  data?: T
  error?: string
}

/** Turn an axios failure into something worth showing a person. */
function toError(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    // The API sends a human-readable message for refusals it wants explained.
    const message = err.response?.data?.message
    if (typeof message === 'string') return message

    const code = err.response?.data?.error
    if (code === 'username_taken') return 'That username is already in use.'
    if (code === 'invalid_role') return 'That role is not valid.'
    if (err.response?.status === 403) return 'Only admins can manage accounts.'
    if (!err.response) return 'Cannot reach the server. Check your connection.'
  }
  return fallback
}

export async function listUsers(): Promise<ApiResult<ManagedUser[]>> {
  try {
    const { data } = await api.get<ManagedUser[]>('/users')
    return { ok: true, data }
  } catch (err) {
    return { ok: false, error: toError(err, 'Could not load accounts.') }
  }
}

export async function createUser(
  username: string,
  email: string,
  role: 'admin' | 'editor'
): Promise<ApiResult<{ user: ManagedUser; password: string }>> {
  try {
    const { data } = await api.post('/users', { username, email, role })
    return { ok: true, data: { user: data.user, password: data.password } }
  } catch (err) {
    return { ok: false, error: toError(err, 'Could not create the account.') }
  }
}

export async function setRole(id: number, role: 'admin' | 'editor'): Promise<ApiResult> {
  try {
    await api.put(`/users/${id}/role`, { role })
    return { ok: true }
  } catch (err) {
    return { ok: false, error: toError(err, 'Could not change the role.') }
  }
}

export async function setActive(id: number, active: boolean): Promise<ApiResult> {
  try {
    await api.put(`/users/${id}/active`, { active })
    return { ok: true }
  } catch (err) {
    return { ok: false, error: toError(err, 'Could not update the account.') }
  }
}

export async function resetPassword(id: number): Promise<ApiResult<{ password: string }>> {
  try {
    const { data } = await api.post(`/users/${id}/password`)
    return { ok: true, data: { password: data.password } }
  } catch (err) {
    return { ok: false, error: toError(err, 'Could not reset the password.') }
  }
}

export async function deleteUser(id: number): Promise<ApiResult> {
  try {
    await api.delete(`/users/${id}`)
    return { ok: true }
  } catch (err) {
    return { ok: false, error: toError(err, 'Could not delete the account.') }
  }
}
