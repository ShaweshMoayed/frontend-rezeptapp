import { defineStore } from 'pinia'
import type { Recipe } from '@/types/recipe'
import { fetchCategories, fetchRecipes } from '@/api/recipes.api'

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
  }),

  actions: {
    async loadCategories() {
      try {
        const cats = await fetchCategories()
        this.categories = Array.isArray(cats) ? cats : []
      } catch {
        // Backend kann hier gerade 500 liefern → wir fallen zurück (nach loadRecipes)
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

        // ✅ Fallback: wenn /categories kaputt ist, Kategorien aus Rezepten ziehen
        if (!this.categories.length) {
          this.categories = uniqCategoriesFromRecipes(this.recipes)
        }
      } catch (e: any) {
        this.error =
          e?.message ||
          'Rezepte konnten nicht geladen werden. Bitte versuche es erneut.'
        this.recipes = []
      } finally {
        this.loading = false
      }
    },

    async refresh() {
      await this.loadRecipes(this.lastQuery)
    },
  },
})
