import { ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { CustomForm } from '../forms/CustomForm'

export default function CartEmpty() {
  return (
    <div className='bg-white border border-brand-border rounded-lg p-6 sm:p-8 text-center'>
      {/* Иконка - адаптивный размер */}
      <ShoppingCart
        className='w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4'
        strokeWidth={2.55}
      />

      {/* Текст */}
      <p className='text-base sm:text-lg font-bengaly text-gray-600 mb-4 sm:mb-6'>
        Ваша корзина пуста
      </p>

      {/* Кнопки - вертикальные на мобильных */}
      <div className='flex flex-col xs:flex-col sm:flex-row justify-center gap-1.5 xs:gap-2 sm:gap-2.5 md:gap-3'>
        <Link
          href='/#catalog'
          className='px-3 xs:px-3.5 sm:px-4 md:px-5 lg:px-6 py-2 xs:py-2.5 sm:py-2.5 md:py-3 border border-[#C6A884] rounded-md bg-white text-black hover:bg-[#C6A884] transition-colors font-bengaly text-xs xs:text-sm sm:text-sm md:text-base'>
          Вернуться к каталогу
        </Link>
        <Link
          href='/'
          className='px-3 xs:px-3.5 sm:px-4 md:px-5 lg:px-6 py-2 xs:py-2.5 sm:py-2.5 md:py-3 bg-[#4A382B] text-white rounded-md hover:bg-[#4A382B]/90 transition-colors font-bengaly text-xs xs:text-sm sm:text-sm md:text-base'>
          На главную
        </Link>
      </div>

      {/* Дополнительная информация */}
      <div className='mt-4 sm:mt-6'>
        <p className='font-bengaly text-[#4A382B] text-xs sm:text-sm mb-2'>Или оформите</p>
        <CustomForm
          trigger={
            <button className='px-4 py-2 border border-[#C6A884] bg-white text-black rounded-md hover:bg-[#C6A884] transition-colors font-bengaly text-xs sm:text-sm'>
              Индивидуальный заказ
            </button>
          }
        />
      </div>
    </div>
  )
}
