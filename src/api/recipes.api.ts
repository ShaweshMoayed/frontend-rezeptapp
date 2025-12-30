import type { Recipe } from '../types/recipe'
import { http } from './http'

export type RecipeQuery = {
  search?: string
  category?: string
}

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

export async function createRecipe(payload: Recipe): Promise<Recipe> {
  return http<Recipe>(`/rezeptapp`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateRecipe(id: number, payload: Recipe): Promise<Recipe> {
  return http<Recipe>(`/rezeptapp/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function deleteRecipe(id: number): Promise<void> {
  await http<void>(`/rezeptapp/${id}`, { method: 'DELETE' })
}
