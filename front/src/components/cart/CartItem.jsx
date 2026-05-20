import { useState } from 'react'
import Image from 'next/image'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { formatRub, parseRub } from '@/utils/formatPrice'

export default function CartItem({ item, removeItem, updateQuantity, onProductClick }) {
  const [imageError, setImageError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const truncateDescription = (description, maxLength = 30) => {
    if (!description) return ''
    if (description.length <= maxLength) return description
    return description.substring(0, maxLength) + '...'
  }

  const handleImageError = () => {
    setImageError(true)
  }

  const handleImageLoad = () => {
    setImageError(false)
  }

  const handleRemoveClick = e => {
    e.stopPropagation()
    removeItem(item.id)
  }

  const handleQuantityDecrease = e => {
    e.stopPropagation()
    updateQuantity(item.id, item.quantity - 1)
  }

  const handleQuantityIncrease = e => {
    e.stopPropagation()
    updateQuantity(item.id, item.quantity + 1)
  }

  return (
    <div
      className={`flex items-start gap-3 p-3 border border-[#C6A884] rounded-lg transition-all duration-300 cursor-pointer ${
        isHovered ? 'shadow-lg bg-gray-50' : 'shadow-sm'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onProductClick(item)}>
      
      {/* Изображение товара */}
      <div className='w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-md flex-shrink-0 overflow-hidden relative group'>
        {item.images && item.images.length > 0 && !imageError ? (
          <Image
            src={item.images[0]}
            alt={item.name}
            className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-110'
            onError={handleImageError}
            onLoad={handleImageLoad}
            width={80}
            height={80}
            priority
          />
        ) : (
          <div
            className='w-full h-full flex items-center justify-center bg-gray-100'
            style={{ background: item.gradient }}>
            <span className='text-gray-500 text-xs'>Нет фото</span>
          </div>
        )}
      </div>

      {/* Основной контент */}
      <div className='flex-1 min-w-0'>
        {/* Верхняя строка: название и удаление */}
        <div className='flex justify-between items-start gap-2 mb-2'>
          <h3 className='font-molot text-black text-sm sm:text-base line-clamp-2 flex-1 min-w-0'>
            {item.name}
          </h3>
          <button
            onClick={handleRemoveClick}
            className='text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-full transition-all duration-200 flex-shrink-0 ml-2'>
            <Trash2 className='w-4 h-4 sm:w-5 sm:h-5' />
          </button>
        </div>

        {/* Описание (только на больших экранах) */}
        {item.description && (
          <p className='font-bengaly text-[#4A382B] text-xs mb-2 hidden sm:block'>
            {truncateDescription(item.description)}
          </p>
        )}

        {/* Средняя строка: цена за единицу и артикул */}
        <div className='flex justify-between items-center mb-3'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:gap-3'>
            <p className='font-bengaly text-black text-xs sm:text-sm'>
              {item.price} за единицу
            </p>
            <p className='font-bengaly text-[#4A382B] text-xs mt-0.5 sm:mt-0'>
              Арт: {item.id}
            </p>
          </div>
          
          {/* Общая сумма (только на мобильных) */}
          <div className='sm:hidden font-molot text-black text-sm'>
            {formatRub(parseRub(item.price) * item.quantity)}
          </div>
        </div>

        {/* Нижняя строка: управление количеством и сумма на десктопе */}
        <div className='flex justify-between items-center'>
          {/* Управление количеством */}
          <div className='flex items-center gap-2' onClick={e => e.stopPropagation()}>
            <button
              onClick={handleQuantityDecrease}
              className='w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#C6A884] flex items-center justify-center hover:bg-[#C6A884] transition-all duration-200 flex-shrink-0'>
              <Minus className='w-3 h-3 sm:w-3.5 sm:h-3.5 text-black' />
            </button>

            <span className='font-bengaly text-black text-base sm:text-lg w-6 text-center'>
              {item.quantity}
            </span>

            <button
              onClick={handleQuantityIncrease}
              className='w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#C6A884] flex items-center justify-center hover:bg-[#C6A884] transition-all duration-200 flex-shrink-0'>
              <Plus className='w-3 h-3 sm:w-3.5 sm:h-3.5 text-black' />
            </button>
          </div>

          {/* Общая сумма (скрыта на мобильных) */}
          <div className='hidden sm:block font-molot text-black text-lg'>
            {formatRub(parseRub(item.price) * item.quantity)}
          </div>
        </div>
      </div>
    </div>
  )
}