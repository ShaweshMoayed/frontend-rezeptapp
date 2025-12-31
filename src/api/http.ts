const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL

if (!BASE_URL) {
  console.warn('VITE_BACKEND_BASE_URL fehlt. Bitte .env prüfen.')
}

function buildUrl(path: string) {
  const base = (BASE_URL || '').replace(/\/$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}

function getToken() {
  return localStorage.getItem('auth_token') || ''
}

export async function http<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as any),
  }

  // ✅ Token automatisch mitsenden, wenn vorhanden
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(buildUrl(path), {
    ...options,
    headers,
  })

  if (!res.ok) {
    let msg = `Request failed (${res.status})`
    try {
      const data = await res.json()
      msg = data?.message || msg
    } catch {
      msg = await res.text().catch(() => msg)
    }
    throw new Error(msg)
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}
