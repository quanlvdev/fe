import { apiRequest } from './client'
import type { LoginResponse, User } from '@/types/api'

export function login(email: string, password: string) {
  return apiRequest<LoginResponse>('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function fetchMe() {
  return apiRequest<{ data: User }>('/api/me')
}

export function logout() {
  return apiRequest<null>('/api/logout', {
    method: 'POST',
  })
}
