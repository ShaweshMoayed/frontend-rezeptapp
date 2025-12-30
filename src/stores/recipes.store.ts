import { defineStore } from 'pinia'
import type { Recipe } from '../types/recipe'
import {
  fetchRecipes,
  fetchCategories,
  fetchRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  type RecipeQuery,
} from '../api/recipes.api'

type State = {
  items: Recipe[]
  categories: string[]
  selected: Recipe | null
  loading: boolean
  error: string | null
  query: RecipeQuery
}

export const useRecipesStore = defineStore('recipes', {
  state: (): State => ({
    items: [],
    categories: [],
    selected: null,
    loading: false,
    error: null,
    query: {},
  }),

  actions: {
    async loadRecipes(query?: RecipeQuery) {
      this.loading = true
      this.error = null
      try {
        this.query = query ?? this.query
        this.items = await fetchRecipes(this.query)
      } catch (e: any) {
        this.error = e?.message ?? 'Fehler beim Laden der Rezepte'
      } finally {
        this.loading = false
      }
    },

    async loadCategories() {
      this.error = null
      try {
        this.categories = await fetchCategories()
      } catch (e: any) {
        this.error = e?.message ?? 'Fehler beim Laden der Kategorien'
      }
    },

    async loadRecipe(id: number) {
      this.loading = true
      this.error = null
      try {
        this.selected = await fetchRecipeById(id)
      } catch (e: any) {
        this.error = e?.message ?? 'Fehler beim Laden des Rezepts'
      } finally {
        this.loading = false
      }
    },

    async addRecipe(payload: Recipe) {
      this.loading = true
      this.error = null
      try {
        const created = await createRecipe(payload)
        this.items.unshift(created)
        return created
      } catch (e: any) {
        this.error = e?.message ?? 'Fehler beim Erstellen'
        throw e
      } finally {
        this.loading = false
      }
    },

    async editRecipe(id: number, payload: Recipe) {
      this.loading = true
      this.error = null
      try {
        const updated = await updateRecipe(id, payload)
        const idx = this.items.findIndex((r) => r.id === id)
        if (idx >= 0) this.items[idx] = updated
        if (this.selected?.id === id) this.selected = updated
        return updated
      } catch (e: any) {
        this.error = e?.message ?? 'Fehler beim Speichern'
        throw e
      } finally {
        this.loading = false
      }
    },

    async removeRecipe(id: number) {
      this.loading = true
      this.error = null
      try {
        await deleteRecipe(id)
        this.items = this.items.filter((r) => r.id !== id)
        if (this.selected?.id === id) this.selected = null
      } catch (e: any) {
        this.error = e?.message ?? 'Fehler beim Löschen'
        throw e
      } finally {
        this.loading = false
      }
    },
  },
})
