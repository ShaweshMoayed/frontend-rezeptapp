import { describe, it, expect, vi, beforeEach } from 'vitest'

const hoisted = vi.hoisted(() => ({
  capturedGuard: null as null | ((to: any) => any),
  auth: {
    token: '',
    user: null as null | { id: number; username: string },
    isLoggedIn: false,
    fetchMe: vi.fn(async () => {}),
  },
  toast: {
    info: vi.fn(),
  },
}))

vi.mock('vue-router', () => {
  return {
    createWebHistory: vi.fn(() => ({})),
    createRouter: vi.fn(() => ({
      beforeEach: (fn: any) => {
        hoisted.capturedGuard = fn
      },
    })),
  }
})

vi.mock('@/stores/auth.store', () => {
  return {
    useAuthStore: () => hoisted.auth,
  }
})

vi.mock('@/stores/toast.store', () => {
  return {
    useToastStore: () => hoisted.toast,
  }
})

beforeEach(() => {
  // reset mock states
  hoisted.auth.token = ''
  hoisted.auth.user = null
  hoisted.auth.isLoggedIn = false
  hoisted.auth.fetchMe.mockClear()

  hoisted.toast.info.mockClear()
})


await import('../index')

describe('router guard', () => {
  it('ruft fetchMe() auf, wenn token da ist aber user noch nicht geladen', async () => {
    hoisted.auth.token = 'abc'
    hoisted.auth.user = null
    hoisted.auth.isLoggedIn = true

    expect(hoisted.capturedGuard).toBeTypeOf('function')

    await hoisted.capturedGuard!({ meta: {}, fullPath: '/' })

    expect(hoisted.auth.fetchMe).toHaveBeenCalledOnce()
  })

  it('redirectet zu /login wenn requiresAuth und nicht eingeloggt (und zeigt Toast)', async () => {
    hoisted.auth.token = ''
    hoisted.auth.user = null
    hoisted.auth.isLoggedIn = false

    const to = { meta: { requiresAuth: true }, fullPath: '/plan' }

    const res = await hoisted.capturedGuard!(to)

    expect(hoisted.toast.info).toHaveBeenCalledOnce()
    expect(res).toEqual({ name: 'login', query: { redirect: '/plan' } })
  })

  it('lässt Navigation durch wenn keine Auth nötig oder eingeloggt', async () => {
    hoisted.auth.isLoggedIn = true

    const res = await hoisted.capturedGuard!({ meta: {}, fullPath: '/rezepte' })

    expect(res).toBe(true)
  })
})
