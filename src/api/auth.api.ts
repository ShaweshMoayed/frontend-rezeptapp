import { http } from './http'

export type AuthRequest = {
  username: string
  password: string
}

export type LoginResponse = {
  token: string
}

export type MeResponse = {
  id: number
  username: string
}

export function register(payload: AuthRequest) {
  return http<string>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function login(payload: AuthRequest) {
  return http<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function logout() {
  return http<string>('/auth/logout', { method: 'POST' })
}

export function me() {
  return http<MeResponse>('/auth/me')
}
