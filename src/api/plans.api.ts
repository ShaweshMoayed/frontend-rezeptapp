// src/api/plans.api.ts
import { http } from './http'

export type PlanEntryDto = {
  day: string // yyyy-mm-dd
  slot: 'BREAKFAST' | 'LUNCH' | 'DINNER'
  recipeId: number | null
  servings: number | null
}

export type CreatePlanRequest = {
  title: string
  weekStartMonday: string // yyyy-mm-dd
  entries: PlanEntryDto[]
}


export async function exportPlanPdf(payload: CreatePlanRequest): Promise<Blob> {
  const base = (import.meta.env.VITE_BACKEND_BASE_URL || 'https://backend-rezeptapp-v72u.onrender.com').replace(/\/$/, '')
  const url = `${base}/rezeptapp/plans/pdf`

  const token = localStorage.getItem('auth_token') || ''
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `PDF konnte nicht erstellt werden. (${res.status})`)
  }

  return await res.blob()
}
