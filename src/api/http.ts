const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL

if (!BASE_URL) {
  // hilft dir sofort beim Debuggen
  console.warn('VITE_BACKEND_BASE_URL fehlt. Bitte .env prüfen.')
}

function buildUrl(path: string) {
  const base = (BASE_URL || '').replace(/\/$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}

export async function http<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(buildUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  })

  if (!res.ok) {
    // Backend liefert bei Fehlern meist JSON (ApiError). Fallback auf Text.
    let msg = `Request failed (${res.status})`
    try {
      const data = await res.json()
      msg = data?.message || msg
    } catch {
      msg = await res.text().catch(() => msg)
    }
    throw new Error(msg)
  }

  // 204 No Content
  if (res.status === 204) return undefined as T

  return (await res.json()) as T
}
