import { defineStore } from 'pinia'
import * as authApi from '@/api/auth.api'
import { useRecipesStore } from '@/stores/recipes.store'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('auth_token') || '',
    user: null as null | { id: number; username: string },
    loading: false,
    error: '' as string,
  }),

  getters: {
    isLoggedIn: (s) => !!s.token,
  },

  actions: {
    setToken(token: string) {
      this.token = token
      if (token) localStorage.setItem('auth_token', token)
      else localStorage.removeItem('auth_token')
    },

    async fetchMe() {
      if (!this.token) {
        this.user = null
        return
      }
      try {
        this.user = await authApi.me()
      } catch {
        this.setToken('')
        this.user = null
      }
    },

    async register(username: string, password: string) {
      this.loading = true
      this.error = ''
      try {
        await authApi.register({ username, password })
      } catch (e: any) {
        this.error = e?.message || 'Registrierung fehlgeschlagen'
        throw e
      } finally {
        this.loading = false
      }
    },

    async login(username: string, password: string) {
      this.loading = true
      this.error = ''
      try {
        const res = await authApi.login({ username, password })
        this.setToken(res.token)

        await this.fetchMe()

        // ✅ Favoriten nach Login neu vom Backend laden
        const recipes = useRecipesStore()
        await recipes.loadFavoriteIds()
      } catch (e: any) {
        this.error = e?.message || 'Login fehlgeschlagen'
        throw e
      } finally {
        this.loading = false
      }
    },

    async logout() {
      this.loading = true
      this.error = ''
      try {
        if (this.token) await authApi.logout().catch(() => {})
      } finally {
        this.setToken('')
        this.user = null

        // ✅ Nur lokale Cache-Daten leeren
        const recipes = useRecipesStore()
        recipes.clearFavorites()

        this.loading = false
      }
    },
  },
})
