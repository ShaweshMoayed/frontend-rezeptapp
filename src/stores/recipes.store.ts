import { defineStore } from 'pinia'
import type { Recipe } from '@/types/recipe'
import {
  fetchCategories,
  fetchRecipes,
  fetchMyFavoriteIds,
  addFavorite,
  removeFavorite,
} from '@/api/recipes.api'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'

export type RecipeQuery = {
  search?: string
  category?: string
}

function uniqCategoriesFromRecipes(recipes: Recipe[]): string[] {
  const set = new Set<string>()
  for (const r of recipes) {
    const c = (r.category ?? '').trim()
    if (c) set.add(c)
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b))
}

export const useRecipesStore = defineStore('recipes', {
  state: () => ({
    recipes: [] as Recipe[],
    categories: [] as string[],
    loading: false,
    error: '' as string,
    lastQuery: { search: '', category: '' } as RecipeQuery,

    favoriteIds: [] as number[],
    favLoading: false,
  }),

  getters: {
    isFavorite: (s) => (id: number) => s.favoriteIds.includes(id),
  },

  actions: {
    async loadCategories() {
      try {
        const cats = await fetchCategories()
        this.categories = Array.isArray(cats) ? cats : []
      } catch {
        this.categories = []
      }
    },

    async loadRecipes(query: RecipeQuery = {}) {
      this.loading = true
      this.error = ''
      this.lastQuery = { ...query }

      try {
        const data = await fetchRecipes(query)
        this.recipes = Array.isArray(data) ? data : []

        if (!this.categories.length) {
          this.categories = uniqCategoriesFromRecipes(this.recipes)
        }
      } catch (e: any) {
        this.error = e?.message || 'Rezepte konnten nicht geladen werden.'
        this.recipes = []
      } finally {
        this.loading = false
      }
    },

    async refresh() {
      await this.loadRecipes(this.lastQuery)
    },

    async loadFavoriteIds() {
      const auth = useAuthStore()
      if (!auth.isLoggedIn) {
        this.favoriteIds = []
        return
      }

      this.favLoading = true
      try {
        const ids = await fetchMyFavoriteIds()
        this.favoriteIds = Array.isArray(ids) ? ids.map(Number) : []
      } catch {
        this.favoriteIds = []
      } finally {
        this.favLoading = false
      }
    },

    async toggleFavorite(id: number) {
      const auth = useAuthStore()
      const toast = useToastStore()

      if (!auth.isLoggedIn) {
        toast.info('Bitte zuerst einloggen, um Favoriten zu nutzen.')
        return
      }

      const isFav = this.favoriteIds.includes(id)
      this.favLoading = true
      try {
        if (isFav) {
          await removeFavorite(id)
          this.favoriteIds = this.favoriteIds.filter((x) => x !== id)
          toast.info('Aus Favoriten entfernt.')
        } else {
          await addFavorite(id)
          this.favoriteIds = Array.from(new Set([...this.favoriteIds, id]))
          toast.success('Zu Favoriten hinzugefügt.')
        }
      } catch (e: any) {
        toast.error(e?.message || 'Favorit konnte nicht geändert werden.')
      } finally {
        this.favLoading = false
      }
    },

    clearFavorites() {
      this.favoriteIds = []
    },
  },
})
