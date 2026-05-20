'use client'
import { ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { useCartStore } from '@/store/cartStore'
import { useUserStore } from '@/store/userStore'

export default function Header() {
  const cartCount = useCartStore(state => state.cartCount)
  const user = useUserStore(state => state.user)
  const displayCount = cartCount > 0 ? cartCount : 0

  return (
    <header className='sticky top-0 z-50 w-full bg-white backdrop-blur-sm border-b border-brand-border'>
      <div className='container mx-auto px-3 xs:px-4 sm:px-5 md:px-6 lg:px-8 py-2 xs:py-2.5 sm:py-3 md:py-4 flex justify-between items-center'>
        {/* Название компании - адаптивный размер */}
        <div className='flex items-center gap-1 xs:gap-1.5 sm:gap-2'>
          <Link href='/'>
            <h1 className='text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-molot text-black -tracking-wide cursor-pointer transition-all duration-200'>
              КОНТРАСТ
            </h1>
          </Link>
        </div>

        <div className='flex items-center gap-2 xs:gap-2.5 sm:gap-3'>
          <Link href={user ? '/profile' : '/login'}>
            <div className='px-2.5 xs:px-3 sm:px-3.5 md:px-4 lg:px-5 py-1.5 xs:py-2 sm:py-2 md:py-2.5 border border-[#C6A884] rounded-md bg-white hover:bg-[#C6A884] transition-colors text-sm xs:text-base font-bengaly text-black'>
              {user ? 'ПРОФИЛЬ' : 'ВОЙТИ'}
            </div>
          </Link>
          <Link href='/cart'>
            <div className='flex items-center gap-1.5 xs:gap-2 sm:gap-2.5 md:gap-3 px-2.5 xs:px-3 sm:px-3.5 md:px-4 lg:px-6 py-1.5 xs:py-2 sm:py-2 md:py-2.5 border border-brand-border rounded-md bg-white hover:bg-brand-border transition-colors text-xs font-normal relative cursor-pointer group'>
              <ShoppingCart
                className='w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 text-black'
                strokeWidth={2.55}
              />

              {/* Текст "КОРЗИНА" скрываем на маленьких экранах */}
              <span className='hidden sm:block text-lg xs:text-xl sm:text-2xl font-bebas tracking-[0.5px] xs:tracking-[1px] sm:tracking-[1.5px] md:tracking-[2px] text-black'>
                КОРЗИНА
              </span>

              {/* Бейдж с количеством товаров - адаптивный размер */}
              {displayCount > 0 && (
                <span className='absolute -top-1.5 -right-1.5 xs:-top-1.5 xs:-right-1.5 sm:-top-2 sm:-right-2 bg-[#4A382B] text-white text-[10px] xs:text-[11px] sm:text-xs rounded-full w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 flex items-center justify-center font-medium'>
                  {displayCount > 99 ? '99+' : displayCount}
                </span>
              )}
            </div>
          </Link>
        </div>
      </div>
    </header>
  )
}
