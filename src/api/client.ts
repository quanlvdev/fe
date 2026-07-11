import { ApiError } from '@/types/api'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'
const TOKEN_KEY = 'team_task_manager_token'

interface RequestOptions extends RequestInit {
  query?: Record<string, string | number | null | undefined>
}

function buildUrl(path: string, query?: RequestOptions['query']) {
  const url = new URL(path, API_BASE_URL)

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value))
    }
  })

  return url.toString()
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = getToken()
  const headers = new Headers(options.headers)

  headers.set('Accept', 'application/json')

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  let response: Response

  try {
    response = await fetch(buildUrl(path, options.query), {
      ...options,
      headers,
    })
  } catch {
    throw new ApiError('Error.', 0)
  }

  if (response.status === 204) {
    return null as T
  }

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(
      payload?.message ?? 'Request failed',
      response.status,
      payload?.errors,
    )
  }

  return payload as T
}
