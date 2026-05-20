import Link from 'next/link'
import { ArrowLeft, Home } from 'lucide-react'

export default function NavigationButtons() {
  return (
    <div className='flex justify-between items-center mb-6 flex-wrap gap-4'>
      {/* Левая кнопка - На главную */}
      <Link
        href='/'
        className='flex items-center gap-2 px-3 py-2 border border-[#C6A884] rounded-md bg-white text-black hover:bg-[#C6A884] transition-colors font-bengaly text-sm sm:text-base sm:px-4'>
        <ArrowLeft className='w-4 h-4' strokeWidth={2.55} />
        <span className='hidden xs:inline'>На главную</span>
        <span className='xs:hidden'>Главная</span>
      </Link>

      {/* Заголовок */}
      <h1 className='text-2xl sm:text-3xl lg:text-[36px] font-molot font-bold text-black text-center order-last w-full xs:order-none xs:w-auto xs:flex-1 xs:text-center'>
        Корзина
      </h1>

      {/* Правая кнопка - В каталог */}
      <Link
        href='/#catalog'
        className='flex items-center gap-2 px-3 py-2 border border-[#C6A884] rounded-md bg-white text-black hover:bg-[#C6A884] transition-colors font-bengaly text-sm sm:text-base sm:px-4'>
        <Home className='w-4 h-4' strokeWidth={2.55} />
        <span className='hidden xs:inline'>В каталог</span>
        <span className='xs:hidden'>Каталог</span>
      </Link>
    </div>
  )
}