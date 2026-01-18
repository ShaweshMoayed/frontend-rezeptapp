import { describe, it, expect, vi, beforeEach } from 'vitest'
import { http } from '../http'

const fetchMock: any = vi.fn()
vi.stubGlobal('fetch', fetchMock)

beforeEach(() => {
  fetchMock.mockReset()
  localStorage.clear()
})

describe('http', () => {
  it('adds Authorization header when token exists', async () => {
    localStorage.setItem('auth_token', 'test-token')

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => ({ ok: true }),
    })

    await http<{ ok: boolean }>('/test')

    expect(fetchMock).toHaveBeenCalledOnce()

    const call = (fetchMock as any).mock.calls[0] as any[]
    const options = call[1] || {}
    const headers = (options.headers || {}) as Record<string, string>

    expect(headers.Authorization).toBe('Bearer test-token')
  })

  it('sets Content-Type: application/json when body is string and header not set', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => ({ ok: true }),
    })

    await http<{ ok: boolean }>('/x', { method: 'POST', body: JSON.stringify({ a: 1 }) })

    const call = (fetchMock as any).mock.calls[0] as any[]
    const options = call[1] || {}
    const headers = (options.headers || {}) as Record<string, string>

    expect(headers['Content-Type']).toBe('application/json')
  })

  it('throws readable message from json error body', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
      headers: { get: () => 'application/json' },
      json: async () => ({ message: 'Bad Request Message' }),
      text: async () => 'fallback',
    })

    await expect(http('/fail')).rejects.toThrow('Bad Request Message')
  })

  it('returns text for non-json success responses', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'text/plain' },
      text: async () => 'hello',
      json: async () => {
        throw new Error('not json')
      },
    })

    const res = await http<string>('/txt')
    expect(res).toBe('hello')
  })
})
