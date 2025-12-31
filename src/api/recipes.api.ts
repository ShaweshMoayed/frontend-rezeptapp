import type { Recipe } from '../types/recipe'
import { http } from './http'

// ... deine bestehenden exports (fetchRecipes, fetchCategories, fetchRecipeById, etc.)

export async function fetchMyFavoriteIds(): Promise<number[]> {
  return http<number[]>('/rezeptapp/favorites/ids')
}

export async function addFavorite(recipeId: number): Promise<void> {
  await http<void>(`/rezeptapp/${recipeId}/favorite`, { method: 'POST' })
}

export async function removeFavorite(recipeId: number): Promise<void> {
  await http<void>(`/rezeptapp/${recipeId}/favorite`, { method: 'DELETE' })
}

// ✅ PDF Download als Blob (kein JSON!)
export async function downloadRecipePdf(recipeId: number): Promise<Blob> {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_BASE_URL.replace(/\/$/, '')}/rezeptapp/${recipeId}/pdf`,
    {
      headers: {
        Authorization: localStorage.getItem('auth_token')
          ? `Bearer ${localStorage.getItem('auth_token')}`
          : '',
      },
    }
  )

  if (!res.ok) {
    const msg = await res.text().catch(() => `PDF Download failed (${res.status})`)
    throw new Error(msg)
  }

  return await res.blob()
}
