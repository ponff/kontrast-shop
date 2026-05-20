import { create } from 'zustand'
import { authApi } from '@/lib/api'
import { useCartStore } from '@/store/cartStore'

export const useUserStore = create((set, get) => ({
  user: null,
  loading: false,
  error: null,

  fetchUser: async () => {
    set({ loading: true, error: null })
    try {
      const response = await authApi.me()
      set({ user: response.data, loading: false })
    } catch (error) {
      set({ user: null, loading: false })
    }
  },

  login: async (data) => {
    set({ loading: true, error: null })
    try {
      const response = await authApi.login(data)
      set({ user: response.data, loading: false })
      await useCartStore.getState().fetchCart()
      return response.data
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message || 'Не удалось войти'
      set({ error: errorMsg, loading: false })
      throw new Error(errorMsg)
    }
  },

  register: async (data) => {
    set({ loading: true, error: null })
    try {
      const response = await authApi.register(data)
      set({ user: response.data, loading: false })
      await useCartStore.getState().fetchCart()
      return response.data
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message || 'Не удалось зарегистрироваться'
      set({ error: errorMsg, loading: false })
      throw new Error(errorMsg)
    }
  },

  logout: async () => {
    set({ loading: true, error: null })
    try {
      await authApi.logout()
      set({ user: null, loading: false })
      await useCartStore.getState().fetchCart()
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message || 'Не удалось выйти'
      set({ error: errorMsg, loading: false })
      throw new Error(errorMsg)
    }
  },
}))
