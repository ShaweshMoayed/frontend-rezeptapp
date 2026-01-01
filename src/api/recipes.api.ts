import type { Recipe } from '@/types/recipe'
import { http } from './http'

export type RecipeQuery = {
  search?: string
  category?: string
}

// ---------- Rezepte ----------

export async function fetchRecipes(params?: RecipeQuery): Promise<Recipe[]> {
  const q = new URLSearchParams()
  if (params?.search) q.set('search', params.search)
  if (params?.category) q.set('category', params.category)

  const suffix = q.toString() ? `?${q.toString()}` : ''
  return http<Recipe[]>(`/rezeptapp${suffix}`)
}

export async function fetchCategories(): Promise<string[]> {
  return http<string[]>(`/rezeptapp/categories`)
}

export async function fetchRecipeById(id: number): Promise<Recipe> {
  return http<Recipe>(`/rezeptapp/${id}`)
}

// ---------- Favoriten ----------
// http.ts sendet Authorization automatisch, wenn auth_token vorhanden ist.

export async function fetchMyFavorites(): Promise<Recipe[]> {
  return http<Recipe[]>(`/rezeptapp/favorites`)
}

export async function fetchMyFavoriteIds(): Promise<number[]> {
  return http<number[]>(`/rezeptapp/favorites/ids`)
}

export async function addFavorite(recipeId: number): Promise<void> {
  await http<void>(`/rezeptapp/${recipeId}/favorite`, { method: 'POST' })
}

export async function removeFavorite(recipeId: number): Promise<void> {
  await http<void>(`/rezeptapp/${recipeId}/favorite`, { method: 'DELETE' })
}

// ---------- PDF ----------

function getToken(): string {
  return localStorage.getItem('auth_token') || ''
}

export async function downloadRecipePdf(recipeId: number): Promise<Blob> {
  const base = (import.meta.env.VITE_BACKEND_BASE_URL || 'https://backend-rezeptapp-v72u.onrender.com').replace(/\/$/, '')
  const url = `${base}/rezeptapp/${recipeId}/pdf`

  const token = getToken()
  const headers: Record<string, string> = {}
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(url, { method: 'GET', headers })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `PDF Download fehlgeschlagen (${res.status})`)
  }

  return await res.blob()
}
