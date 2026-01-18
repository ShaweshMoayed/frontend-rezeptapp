import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/api/auth.api', () => ({
  register: vi.fn(async () => 'registered'),
  login: vi.fn(async () => ({ token: 't-123' })),
  logout: vi.fn(async () => 'ok'),
  me: vi.fn(async () => ({ id: 1, username: 'moayed' })),
}))

const recipesStoreMock = {
  loadFavoriteIds: vi.fn(async () => {}),
  clearFavorites: vi.fn(() => {}),
}
vi.mock('@/stores/recipes.store', () => ({
  useRecipesStore: () => recipesStoreMock,
}))

import { useAuthStore } from '../auth.store'
import * as authApi from '@/api/auth.api'

describe('auth.store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('register() ruft authApi.register auf', async () => {
    const auth = useAuthStore()
    await auth.register('u', 'p')

    expect(authApi.register).toHaveBeenCalledTimes(1)
    expect(auth.error).toBe('')
    expect(auth.loading).toBe(false)
  })

  it('login() setzt token, lädt /me und favoriteIds', async () => {
    const auth = useAuthStore()
    await auth.login('u', 'p')

    expect(authApi.login).toHaveBeenCalledTimes(1)
    expect(authApi.me).toHaveBeenCalledTimes(1)

    expect(auth.token).toBe('t-123')
    expect(localStorage.getItem('auth_token')).toBe('t-123')
    expect(auth.user?.username).toBe('moayed')

    expect(recipesStoreMock.loadFavoriteIds).toHaveBeenCalledTimes(1)
  })

  it('logout() löscht token + user und cleared favorites', async () => {
    const auth = useAuthStore()
    auth.setToken('abc')
    auth.user = { id: 9, username: 'x' }

    await auth.logout()

    expect(auth.token).toBe('')
    expect(auth.user).toBe(null)
    expect(localStorage.getItem('auth_token')).toBe(null)

    expect(recipesStoreMock.clearFavorites).toHaveBeenCalledTimes(1)
  })
})
