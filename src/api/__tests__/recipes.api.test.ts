import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as recipesApi from '../recipes.api'
import type { Recipe } from '@/types/recipe'

// absichtlich "any" => keine TS-Probleme mit fetch Signatur
const fetchMock: any = vi.fn()
vi.stubGlobal('fetch', fetchMock)

beforeEach(() => {
  fetchMock.mockReset()
  localStorage.clear()
})

describe('recipes.api', () => {
  it('fetchRecipes returns list', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => [{ id: 1, title: 'Pizza', description: '' }],
    })

    const res = await recipesApi.fetchRecipes()

    expect(res).toHaveLength(1)
    const first = res[0]!
    expect(first.title).toBe('Pizza')
  })

  it('fetchRecipeById returns single recipe', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => ({ id: 2, title: 'Pasta', description: '' }),
    })

    const res = await recipesApi.fetchRecipeById(2)

    expect(res.id).toBe(2)
    expect(res.title).toBe('Pasta')
  })

  it('createRecipe sends POST request', async () => {
    const payload = { title: 'Salat', description: 'x' } as Recipe

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => ({ id: 3, title: 'Salat', description: 'x' }),
    })

    const res = await recipesApi.createRecipe(payload)

    expect(res.id).toBe(3)
    expect(fetchMock).toHaveBeenCalledOnce()

    const call = (fetchMock as any).mock.calls[0] as any[]
    const url = String(call[0])
    const options = call[1] || {}

    expect(url).toContain('/rezeptapp')
    expect(options.method).toBe('POST')
    expect(options.body).toBe(JSON.stringify(payload))
  })

  it('deleteRecipe performs DELETE', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 204,
      headers: { get: () => null },
      text: async () => '',
    })

    await recipesApi.deleteRecipe(5)

    expect(fetchMock).toHaveBeenCalledOnce()

    const call = (fetchMock as any).mock.calls[0] as any[]
    const url = String(call[0])
    const options = call[1] || {}

    expect(url).toContain('/rezeptapp/5')
    expect(options.method).toBe('DELETE')
  })
})
