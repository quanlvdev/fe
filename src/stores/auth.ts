import { reactive } from 'vue'
import { clearToken, getToken, setToken } from '@/api/client'
import * as authApi from '@/api/auth'
import type { User } from '@/types/api'

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
}

const state = reactive<AuthState>({
  user: null,
  token: getToken(),
  loading: false,
})

export function useAuthStore() {
  async function login(email: string, password: string) {
    state.loading = true

    try {
      const data = await authApi.login(email, password)
      state.user = data.user
      state.token = data.token
      setToken(data.token)
    } finally {
      state.loading = false
    }
  }

  async function loadUser() {
    if (!state.token || state.user) return

    state.loading = true

    try {
      const { data } = await authApi.fetchMe()
      state.user = data
    } catch {
      clear()
    } finally {
      state.loading = false
    }
  }

  async function logout() {
    if (state.token) {
      await authApi.logout().catch(() => undefined)
    }

    clear()
  }

  function clear() {
    state.user = null
    state.token = null
    clearToken()
  }

  return {
    state,
    login,
    loadUser,
    logout,
    clear,
  }
}
