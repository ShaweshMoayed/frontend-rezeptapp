import { defineStore } from 'pinia'
import * as authApi from '@/api/auth.api'
import { useRecipesStore } from '@/stores/recipes.store'
import { useToastStore } from '@/stores/toast.store'

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
      const toast = useToastStore()

      if (!this.token) {
        this.user = null
        return
      }
      try {
        this.user = await authApi.me()
      } catch {
        // Token ungültig/abgelaufen -> ausloggen
        this.setToken('')
        this.user = null
        toast.info('Session abgelaufen. Bitte neu einloggen.')
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

    // ✅ Auto-Login nach Register
    async registerAndLogin(username: string, password: string) {
      const toast = useToastStore()
      this.loading = true
      this.error = ''
      try {
        await authApi.register({ username, password })
        const res = await authApi.login({ username, password })
        this.setToken(res.token)
        await this.fetchMe()

        // Favoriten nach Login neu laden (Backend = Source of truth)
        const recipes = useRecipesStore()
        await recipes.loadFavoriteIds()

        toast.success('Registriert & eingeloggt ✅')
      } catch (e: any) {
        this.error = e?.message || 'Registrierung fehlgeschlagen'
        throw e
      } finally {
        this.loading = false
      }
    },

    async login(username: string, password: string) {
      const toast = useToastStore()
      this.loading = true
      this.error = ''
      try {
        const res = await authApi.login({ username, password })
        this.setToken(res.token)

        await this.fetchMe()

        const recipes = useRecipesStore()
        await recipes.loadFavoriteIds()

        toast.success('Eingeloggt ✅')
      } catch (e: any) {
        this.error = e?.message || 'Login fehlgeschlagen'
        throw e
      } finally {
        this.loading = false
      }
    },

    async logout() {
      const toast = useToastStore()
      this.loading = true
      this.error = ''
      try {
        // Backend invalidiert Token (Favoriten bleiben in DB!)
        if (this.token) await authApi.logout().catch(() => {})
      } finally {
        this.setToken('')
        this.user = null

        // nur lokalen Cache leeren
        const recipes = useRecipesStore()
        recipes.clearFavorites()

        this.loading = false
        toast.info('Ausgeloggt.')
      }
    },
  },
})
