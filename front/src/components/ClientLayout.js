'use client'
import { useEffect, useState } from 'react'
import { checkCSRFStatus } from '@/lib/api'
import { useCartStore } from '@/store/cartStore'
import { useUserStore } from '@/store/userStore'

export default function ClientLayout({ children }) {
  const [isInitialized, setIsInitialized] = useState(false)
  const fetchCart = useCartStore(state => state.fetchCart)
  const fetchUser = useUserStore(state => state.fetchUser)

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await Promise.allSettled([fetchUser(), fetchCart()])
        setIsInitialized(true)
      } catch (error) {
        if (error.response?.status === 403) {
          setTimeout(() => window.location.reload(), 1000)
        }
      }
    }

    initializeApp()
  }, [fetchCart, fetchUser])

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Загрузка приложения...</div>
      </div>
    );
  }

  return <>{children}</>;
}