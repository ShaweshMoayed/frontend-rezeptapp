const DEFAULT_BASE_URL = 'https://backend-rezeptapp-v72u.onrender.com'
const BASE_URL = (import.meta.env.VITE_BACKEND_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, '')

if (!import.meta.env.VITE_BACKEND_BASE_URL) {
  console.warn('VITE_BACKEND_BASE_URL fehlt. Fallback wird genutzt:', DEFAULT_BASE_URL)
}

function buildUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`
  return `${BASE_URL}${p}`
}

function getToken(): string {
  return localStorage.getItem('auth_token') || ''
}

function shouldSetJsonContentType(options?: RequestInit): boolean {
  return typeof options?.body === 'string'
}

function isJsonResponse(res: Response): boolean {
  const ct = res.headers.get('content-type') || ''
  return ct.includes('application/json')
}

export async function http<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  }

  if (shouldSetJsonContentType(options) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(buildUrl(path), {
    ...options,
    headers,
  })

  if (!res.ok) {
    let message = `Request failed (${res.status})`

    // erst JSON error versuchen
    try {
      if (isJsonResponse(res)) {
        const data = await res.json()
        if (typeof data?.message === 'string' && data.message.trim()) {
          message = data.message
        }
      } else {
        const text = await res.text()
        if (text) message = text
      }
    } catch {
      // fallback
      try {
        const text = await res.text()
        if (text) message = text
      } catch {
        // ignore
      }
    }

    throw new Error(message)
  }

  if (res.status === 204) return undefined as T

  // ✅ Erfolgs-Response: kann JSON oder Text sein (z.B. "registered")
  try {
    if (isJsonResponse(res)) {
      return (await res.json()) as T
    }
    return (await res.text()) as unknown as T
  } catch {
    // falls wirklich nix lesbar ist
    return undefined as T
  }
}
