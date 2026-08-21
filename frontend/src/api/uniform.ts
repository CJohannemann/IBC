import api from "@/api/client.ts";

export interface Uniform {
    id: number
    title: string
    image_path: string | null
}

export type NewUniformItem = Omit<Uniform, 'id'>

export async function getUniform(uniform?: string): Promise<Uniform[]> {
    const params = uniform ? {uniform} : {}
    const {data} = await api.get('/uniform', {params})
    return data
}

export async function createUniform(item: NewUniformItem): Promise<{success : boolean; id: number}> {
    const { data } = await api.post('/uniform', item)
    return data
}