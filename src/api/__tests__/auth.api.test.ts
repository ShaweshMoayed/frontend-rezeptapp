import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as authApi from '../auth.api'

const fetchMock = vi.fn()
vi.stubGlobal('fetch', fetchMock)

beforeEach(() => {
  fetchMock.mockReset()
  localStorage.clear()
})

describe('auth.api', () => {
  it('register sends POST request', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'text/plain' },
      text: async () => 'registered',
    })

    const res = await authApi.register({ username: 'test', password: 'pw' })

    expect(res).toBe('registered')
    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it('login returns token', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => ({ token: 'abc123' }),
    })

    const res = await authApi.login({ username: 'u', password: 'p' })

    expect(res.token).toBe('abc123')
  })

  it('me returns user info', async () => {
    localStorage.setItem('auth_token', 'token')

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => ({ id: 1, username: 'moayed' }),
    })

    const res = await authApi.me()

    expect(res.username).toBe('moayed')
  })
})
