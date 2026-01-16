// src/api/stats.api.ts
import { http } from '@/api/http'

export type StatsRequest = {
  recipeIds: number[]
}

export type Macro = {
  caloriesKcal: number
  proteinG: number
  fatG: number
  carbsG: number
}

export type RecipeMacro = {
  id: number
  title: string
  macro: Macro
}

export type StatsResponse = {
  recipes: RecipeMacro[]
  total: Macro
  donut: Macro
}

export async function fetchStats(recipeIds: number[]): Promise<StatsResponse> {
  const payload: StatsRequest = { recipeIds: recipeIds.map(Number).filter(Boolean) }

  return http<StatsResponse>(`/rezeptapp/stats`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
