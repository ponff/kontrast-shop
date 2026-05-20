import Link from 'next/link'
import CustomOrderModal from '@/components/forms/CustomOrderModal'
import { formatRub } from '@/utils/formatPrice'

export default function CartSummary({ totalPrice, totalItems, clearCart, presetDetails }) {
  return (
    <div className='bg-white border border-[#C6A884] rounded-lg p-3 xs:p-3.5 sm:p-4 md:p-5 lg:p-6 space-y-2.5 xs:space-y-3 sm:space-y-3 md:space-y-4 sticky top-16 xs:top-18 sm:top-20 md:top-24 lg:top-28'>
      {/* Заголовок блока - только на мобильных */}
      <div className='sm:hidden border-b border-[#C6A884] pb-2 xs:pb-2.5 sm:pb-3'>
        <h3 className='font-molot text-black text-base xs:text-lg sm:text-lg text-center'>
          Итоги заказа
        </h3>
      </div>

      {/* Количество товаров */}
      <div className='flex justify-between text-[#4A382B] font-bengaly text-xs xs:text-sm sm:text-sm md:text-base'>
        <span>Товары</span>
        <span>{totalItems} шт</span>
      </div>

      {/* Итоговая сумма */}
      <div className='flex justify-between text-black text-base xs:text-lg sm:text-lg md:text-xl font-molot font-bold border-t border-[#C6A884] pt-2 xs:pt-2.5 sm:pt-3'>
        <span>Итого</span>
        <span style={{ fontFamily: 'Arial, sans-serif' }}>{formatRub(totalPrice)}</span>
      </div>

      {/* Основные кнопки действий - больше breakpoints */}
      <div className='flex flex-col xs:flex-col sm:flex-row gap-1.5 xs:gap-2 sm:gap-2.5 md:gap-3 pt-2 xs:pt-2.5 sm:pt-3'>
        <button
          onClick={clearCart}
          className='flex-1 px-3 xs:px-3.5 sm:px-3.5 md:px-4 py-1.5 xs:py-2 sm:py-2 md:py-2.5 border border-[#C6A884] text-black rounded-md hover:bg-[#C6A884] hover:border-[#4A382B] transition-all duration-200 font-bengaly text-xs xs:text-sm sm:text-sm md:text-base order-2 sm:order-1'>
          Очистить корзину
        </button>

        <CustomOrderModal
          presetDetails={presetDetails}
          trigger={
            <button className='flex-1 px-3 xs:px-3.5 sm:px-3.5 md:px-4 py-1.5 xs:py-2 sm:py-2 md:py-2.5 bg-[#4A382B] text-white rounded-md hover:bg-[#4A382B]/80 transition-all duration-200 font-bengaly text-xs xs:text-sm sm:text-sm md:text-base order-1 sm:order-2'>
              Оформить заказ
            </button>
          }
        />
      </div>

      {/* Кнопка "Продолжить покупки" - больше breakpoints */}
      <div className='flex gap-1.5 xs:gap-2 sm:gap-2.5 md:gap-3 pt-2 xs:pt-2.5 sm:pt-3 border-t border-[#C6A884]'>
        <Link
          href='/#catalog'
          className='flex-1 px-3 xs:px-3.5 sm:px-3.5 md:px-4 py-1.5 xs:py-2 sm:py-2 md:py-2.5 border border-[#C6A884] text-black rounded-md hover:bg-[#C6A884] transition-all duration-200 text-center font-bengaly text-xs xs:text-sm sm:text-sm md:text-base'>
          Продолжить покупки
        </Link>
      </div>

      {/* Дополнительная информация - для всех экранов */}
      <div className='text-center'>
        <p className='font-bengaly text-[#4A382B] text-[10px] xs:text-xs sm:text-xs md:text-sm mt-1 xs:mt-2 sm:mt-2'>
          Доставка по РФ • От 7-10 дней
        </p>
      </div>
    </div>
  )
}
