import api from '@/api/client'

export interface Uniform {
  id: number
  title: string
  image_path: string | null
  created_at?: string
}

export type NewUniformItem = Omit<Uniform, 'id' | 'created_at'>

export async function getUniform(): Promise<Uniform[]> {
  const { data } = await api.get('/uniform')
  return data
}

export async function createUniform(item: NewUniformItem): Promise<{ success: boolean; id: number }> {
  const { data } = await api.post('/uniform', item)
  return data
}

export async function updateUniform(id: number, item: NewUniformItem): Promise<{ success: boolean }> {
  const { data } = await api.put(`/uniform/${id}`, item)
  return data
}

export async function deleteUniform(id: number): Promise<{ success: boolean }> {
  const { data } = await api.delete(`/uniform/${id}`)
  return data
}
