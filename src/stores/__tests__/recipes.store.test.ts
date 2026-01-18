import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// ✅ API mocks
vi.mock('@/api/recipes.api', () => ({
  fetchCategories: vi.fn(async () => ['Italienisch', 'Vegan']),
  fetchRecipes: vi.fn(async () => [
    { id: 1, title: 'Pizza', description: 'x', category: 'Italienisch' },
    { id: 2, title: 'Salat', description: 'y', category: 'Vegan' },
  ]),
  fetchMyFavoriteIds: vi.fn(async () => [1, 2]),
  addFavorite: vi.fn(async () => {}),
  removeFavorite: vi.fn(async () => {}),
}))

vi.mock('@/stores/auth.store', () => ({
  useAuthStore: () => ({ isLoggedIn: true }),
}))

import { useRecipesStore } from '../recipes.store'
import { useToastStore } from '../toast.store'
import * as recipesApi from '@/api/recipes.api'

describe('recipes.store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('loadCategories() lädt Kategorien', async () => {
    const recipes = useRecipesStore()
    await recipes.loadCategories()

    expect(recipesApi.fetchCategories).toHaveBeenCalledTimes(1)
    expect(recipes.categories).toEqual(['Italienisch', 'Vegan'])
  })

  it('loadRecipes() lädt Rezepte und setzt categories aus Rezepten wenn leer', async () => {
    const recipes = useRecipesStore()
    recipes.categories = [] // sicher leer

    await recipes.loadRecipes({ search: 'p' })

    expect(recipesApi.fetchRecipes).toHaveBeenCalledTimes(1)
    expect(recipes.recipes).toHaveLength(2)
    expect(recipes.categories.length).toBeGreaterThan(0)
    expect(recipes.loading).toBe(false)
    expect(recipes.error).toBe('')
  })

  it('loadFavoriteIds() setzt favoriteIds', async () => {
    const recipes = useRecipesStore()
    await recipes.loadFavoriteIds()

    expect(recipesApi.fetchMyFavoriteIds).toHaveBeenCalledTimes(1)
    expect(recipes.favoriteIds).toEqual([1, 2])
  })

  it('toggleFavorite(): wenn nicht favorite => addFavorite + success toast', async () => {
    const toast = useToastStore()
    const spySuccess = vi.spyOn(toast, 'success')
    const recipes = useRecipesStore()

    recipes.favoriteIds = [2] // 1 ist nicht fav
    await recipes.toggleFavorite(1)

    expect(recipesApi.addFavorite).toHaveBeenCalledTimes(1)
    expect(recipes.favoriteIds).toContain(1)
    expect(spySuccess).toHaveBeenCalledTimes(1)
  })

  it('toggleFavorite(): wenn favorite => removeFavorite + info toast', async () => {
    const toast = useToastStore()
    const spyInfo = vi.spyOn(toast, 'info')
    const recipes = useRecipesStore()

    recipes.favoriteIds = [1, 2]
    await recipes.toggleFavorite(1)

    expect(recipesApi.removeFavorite).toHaveBeenCalledTimes(1)
    expect(recipes.favoriteIds).toEqual([2])
    expect(spyInfo).toHaveBeenCalledTimes(1)
  })
})
