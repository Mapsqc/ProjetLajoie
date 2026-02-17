import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AuthUser, LoginRequest } from '@/types'
import { authService } from '@/services/auth.service'
import { router } from '@/app/router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value)

  function initAuth() {
    const savedToken = localStorage.getItem('auth_token')
    const savedUser = localStorage.getItem('auth_user')
    if (savedToken && savedUser) {
      token.value = savedToken
      user.value = JSON.parse(savedUser)
    }
  }

  async function login(credentials: LoginRequest) {
    isLoading.value = true
    error.value = null
    try {
      const response = await authService.login(credentials)
      user.value = response.user
      token.value = response.token
      localStorage.setItem('auth_token', response.token)
      localStorage.setItem('auth_user', JSON.stringify(response.user))
      router.push({ name: 'dashboard' })
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erreur de connexion'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    router.push({ name: 'login' })
  }

  return { user, token, isLoading, error, isAuthenticated, initAuth, login, logout }
})
