import { create } from 'zustand'
import api from '@/lib/api'

interface User {
  id: string
  nome: string
  email: string
  role: string
  establishmentId: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, senha: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email, senha) => {
    set({ isLoading: true })
    try {
      const { data } = await api.post('/auth/login', { email, senha })

      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
      }

      set({ user: data.user, isAuthenticated: true, isLoading: false })
    } catch (error: any) {
      set({ isLoading: false })
      throw new Error(error.response?.data?.message || 'Erro ao fazer login')
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      window.location.href = '/login'
    }
    set({ user: null, isAuthenticated: false })
  },

  checkAuth: async () => {
    try {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken')
        if (!token) {
          set({ isLoading: false })
          return
        }
      }

      const { data } = await api.get('/auth/me')
      set({ user: data, isAuthenticated: true, isLoading: false })
    } catch (error) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
      }
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },
}))
