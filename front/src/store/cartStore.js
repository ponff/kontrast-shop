import { create } from 'zustand'
import { cartApi, productAPI } from '@/lib/api'
import { useUserStore } from '@/store/userStore'
import { toast } from 'sonner'

export const useCartStore = create((set, get) => ({
      items: [],
      loading: false,
      error: null,
      cartCount: 0,
      totalPrice: 0,

      // Загрузка корзины с сервера с полной информацией о товарах
      fetchCart: async () => {
        set({ loading: true, error: null })
        try {
          const cartData = await cartApi.detail() // Используем detail вместо getCart

          const baseItems =
            cartData.data?.cart_items?.map(item => ({
              id: item.id,
              name: item.name,
              price: parseFloat(item.price).toLocaleString('ru-RU') + ' ₽',
              quantity: item.quantity,
              gradient: 'linear-gradient(135deg, #4A3B2F 0%, #2B221C 100%)',
              total_price: parseFloat(item.total_price),
              images: [],
              description: '',
            })) || []

          // Загружаем полную информацию о каждом товаре
          const itemsWithFullInfo = await Promise.all(
            baseItems.map(async item => {
              try {
                const productInfo = await productAPI.getProduct(item.id)

                return {
                  ...item,
                  images: productInfo.data?.images || [],
                  description: productInfo.data?.description || '',
                }
              } catch (error) {
                return item
              }
            })
          )

          const totalItemsCount = itemsWithFullInfo.reduce(
            (total, item) => total + item.quantity,
            0
          )

          set({
            items: itemsWithFullInfo,
            cartCount: totalItemsCount,
            totalPrice: parseFloat(cartData.data?.total_price) || 0,
            loading: false,
          })
        } catch (error) {
          set({
            error: error.response?.data?.error || error.message,
            loading: false,
          })
        }
      },

      // Добавить товар в корзину
      addItem: async (product, quantity = 1) => {
        // Если пользователь не авторизован — перенаправляем на страницу входа/регистрации
        const currentUser = useUserStore.getState().user
        if (!currentUser) {
          if (typeof window !== 'undefined') {
            toast('Требуется авторизация, перенаправляю...')
            window.location.href = '/login'
          }
          return
        }

        set({ loading: true, error: null })
        try {
          await cartApi.add(product.id, quantity)
          await get().fetchCart()
        } catch (error) {
          const errorMsg = error.response?.data?.error || error.message
          set({ error: errorMsg, loading: false })
          throw new Error(errorMsg)
        }
      },

      removeItem: async productId => {
        set({ loading: true, error: null })
        try {
          await cartApi.remove(productId)
          await get().fetchCart()
        } catch (error) {
          const errorMsg = error.response?.data?.error || error.message
          set({ error: errorMsg, loading: false })
          throw new Error(errorMsg)
        }
      },

      updateQuantity: async (productId, quantity) => {
        if (quantity <= 0) {
          await get().removeItem(productId)
          return
        }

        set({ loading: true, error: null })
        try {
          await cartApi.update(productId, quantity)
          await get().fetchCart()
        } catch (error) {
          const errorMsg = error.response?.data?.error || error.message
          set({ error: errorMsg, loading: false })
          throw new Error(errorMsg)
        }
      },

      clearCart: async () => {
        set({ loading: true, error: null })
        try {
          await cartApi.clear()
          set({
            items: [],
            cartCount: 0,
            totalPrice: 0,
            loading: false,
          })
        } catch (error) {
          const errorMsg = error.response?.data?.error || error.message
          set({ error: errorMsg, loading: false })
          throw new Error(errorMsg)
        }
      },

      getTotalPrice: () => {
        const { items } = get()
        return items.reduce((total, item) => {
          return total + (item.total_price || 0)
        }, 0)
      },

      getTotalItems: () => {
        const { items } = get()
        return items.reduce((total, item) => total + item.quantity, 0)
      },

      isInCart: productId => {
        const { items } = get()
        return items.some(item => item.id === productId)
      },
    })
)