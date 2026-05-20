'use client'
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { ShoppingCart, Minus, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import ProductQuickViewModal from './ProductQuickViewModal'

export default function ProductCard({ product }) {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  
  const touchThreshold = 50 // минимальное расстояние для свайпа
  const autoSlideInterval = 3000 // интервал автопрокрутки в мс
  const autoSlideRef = useRef(null)

  const addItem = useCartStore(state => state.addItem)
  const removeItem = useCartStore(state => state.removeItem)
  const updateQuantity = useCartStore(state => state.updateQuantity)
  const isInCart = useCartStore(state => state.isInCart(product.id))

  const cartItems = useCartStore(state => state.items)
  const cartItem = cartItems.find(item => item.id === product.id)
  const currentQuantity = cartItem ? cartItem.quantity : 0

  const hasMultipleImages = product.images && product.images.length > 1

  // Функция для обрезки описания
  const truncateDescription = (description, maxLength = 40) => {
    if (!description) return 'Описание отсутствует'
    if (description.length <= maxLength) return description
    return description.substring(0, maxLength) + '...'
  }

  // Переход к следующему изображению
  const nextImage = () => {
    if (hasMultipleImages) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
      )
    }
  }

  // Переход к предыдущему изображению
  const prevImage = () => {
    if (hasMultipleImages) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
      )
    }
  }

  // Переход к конкретному изображению
  const goToImage = (index) => {
    setCurrentImageIndex(index)
  }

  // Обработчики для тач-событий (мобильные устройства)
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > touchThreshold
    const isRightSwipe = distance < -touchThreshold

    if (isLeftSwipe) {
      nextImage()
    } else if (isRightSwipe) {
      prevImage()
    }

    setTouchStart(null)
    setTouchEnd(null)
  }

  // Автопрокрутка при наведении
  useEffect(() => {
    if (isHovering && hasMultipleImages) {
      autoSlideRef.current = setInterval(nextImage, autoSlideInterval)
    } else {
      clearInterval(autoSlideRef.current)
    }

    return () => clearInterval(autoSlideRef.current)
  }, [isHovering, hasMultipleImages, currentImageIndex])

  const handleImageError = () => {
    setImageError(true)
  }

  const handleImageLoad = () => {
    setImageError(false)
  }

  const handleAddToCart = async e => {
    e.stopPropagation()
    setAddingToCart(true)
    try {
      await addItem(product)
    } catch (error) {
      alert(`Ошибка добавления в корзину: ${error.message}`)
    } finally {
      setAddingToCart(false)
    }
  }

  const handleIncreaseQuantity = async e => {
    e.stopPropagation()
    setAddingToCart(true)
    try {
      await updateQuantity(product.id, currentQuantity + 1)
    } catch (error) {
      alert(`Ошибка обновления количества: ${error.message}`)
    } finally {
      setAddingToCart(false)
    }
  }

  const handleDecreaseQuantity = async e => {
    e.stopPropagation()
    setAddingToCart(true)
    try {
      if (currentQuantity <= 1) {
        await removeItem(product.id)
      } else {
        await updateQuantity(product.id, currentQuantity - 1)
      }
    } catch (error) {
      alert(`Ошибка обновления количества: ${error.message}`)
    } finally {
      setAddingToCart(false)
    }
  }

  const handleCardClick = () => {
    setIsQuickViewOpen(true)
  }

  return (
    <>
      <div
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className='group bg-white rounded-lg border border-brand-border shadow-sm overflow-hidden flex flex-col h-full transition-transform duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer'>
        
        {/* Контейнер изображения продукта со слайдером */}
        <div 
          className='relative w-full aspect-square xs:aspect-square sm:h-[180px] md:h-[220px] lg:h-[260px] xl:h-[314px] flex-shrink-0 bg-gray-100 overflow-hidden'
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {product.images && product.images.length > 0 && !imageError ? (
            <>
              {/* Основное изображение - используем обычный img тег */}
              <img
                src={product.images[currentImageIndex]}
                alt={product.name}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  display: 'block'
                }}
                onError={handleImageError}
                onLoad={handleImageLoad}
              />

              {/* Кнопки навигации (только для десктопа) */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      prevImage()
                    }}
                    className='absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 hidden sm:block'
                    aria-label='Предыдущее изображение'
                  >
                    <ChevronLeft className='w-4 h-4' />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      nextImage()
                    }}
                    className='absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 hidden sm:block'
                    aria-label='Следующее изображение'
                  >
                    <ChevronRight className='w-4 h-4' />
                  </button>
                </>
              )}

              {/* Индикаторы точек (только если есть несколько изображений) */}
              {hasMultipleImages && product.images.length > 1 && (
                <div className='absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1.5'>
                  {product.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation()
                        goToImage(index)
                      }}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                        index === currentImageIndex 
                          ? 'bg-white' 
                          : 'bg-white/50 hover:bg-white/70'
                      }`}
                      aria-label={`Перейти к изображению ${index + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Счетчик изображений */}
              {hasMultipleImages && (
                <div className='absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full'>
                  {currentImageIndex + 1} / {product.images.length}
                </div>
              )}
            </>
          ) : (
            <div
              className='absolute inset-0'
              style={{
                background: product.gradient,
                backgroundImage: `
                  radial-gradient(70.71% 70.71% at 50% 50%, rgba(0, 0, 0, 0.10) 0%, rgba(0, 0, 0, 0.00) 55%),
                  radial-gradient(70.71% 70.71% at 50% 50%, rgba(0, 0, 0, 0.07) 0%, rgba(0, 0, 0, 0.00) 60%)    
                `,
                mixBlendMode: 'multiply',
              }}
            />
          )}
        </div>

        {/* Остальная часть карточки товара остается без изменений */}
        <div className='p-2 xs:p-2.5 sm:p-3 md:p-4 flex flex-col flex-grow'>
          <div className='flex-grow'>
            <div className='flex justify-between items-start mb-1.5 xs:mb-2 sm:mb-2 md:mb-2'>
              <div className='flex-1 pr-1.5 xs:pr-2 sm:pr-2'>
                <h3
                  className='font-molot text-base xs:text-lg sm:text-lg md:text-xl leading-4 xs:leading-5 sm:leading-5 text-black mb-1 line-clamp-2'
                  style={{ textShadow: '1px 1px 1px rgba(0, 0, 0, 0.2)' }}>
                  {product.name}
                </h3>
              </div>
            </div>

            <p className='text-xs xs:text-[12px] sm:text-[13px] text-[#4A382B] font-bengaly leading-3 xs:leading-4 sm:leading-4 mb-1.5 xs:mb-2 sm:mb-2 md:mb-3 line-clamp-2'>
              {truncateDescription(product.description)}
            </p>
          </div>

          <div className='space-y-1.5 xs:space-y-2 sm:space-y-2.5 md:space-y-3 mt-auto'>
            <div className='flex justify-end'>
              <div
                className='text-sm xs:text-[15px] sm:text-[16px] md:text-[17px] font-bold text-black leading-4 xs:leading-5 sm:leading-5'
                style={{ fontFamily: 'Arial, sans-serif' }}>
                {product.price}
              </div>
            </div>

            {!isInCart ? (
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className={`w-full px-2 xs:px-2.5 sm:px-3 md:px-4 py-1.5 xs:py-2 sm:py-2 md:py-2.5 rounded-md flex items-center justify-center gap-1 xs:gap-1.5 sm:gap-2 transition-colors tracking-wider ${
                  addingToCart
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#4A382B] hover:bg-[#4A382B]/90'
                } text-white text-xs xs:text-xs sm:text-sm`}>
                <ShoppingCart
                  className='w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4'
                  strokeWidth={2.55}
                />
                <span className='text-base xs:text-lg sm:text-xl md:text-[23px] font-bebas leading-3 xs:leading-4 sm:leading-4'>
                  {addingToCart ? '...' : 'В корзину'}
                </span>
              </button>
            ) : (
              <div className='flex items-center justify-between gap-1 xs:gap-1.5 sm:gap-2'>
                <button
                  onClick={handleDecreaseQuantity}
                  disabled={addingToCart}
                  className='w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 text-black rounded-full border border-[#C6A884] flex items-center justify-center hover:bg-[#C6A884] transition-colors disabled:opacity-50'>
                  <Minus className='w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4' />
                </button>

                <div className='flex-1 text-center'>
                  <span className='font-bengaly text-black text-sm xs:text-base sm:text-base md:text-lg'>
                    {currentQuantity}
                  </span>
                  <div className='font-bengaly text-[#4A382B] text-[10px] xs:text-xs sm:text-xs leading-tight hidden xs:block'>
                    в корзине
                  </div>
                  <div className='font-bengaly text-[#4A382B] text-[9px] xs:text-[10px] leading-tight xs:hidden'>
                    в корз.
                  </div>
                </div>

                <button
                  onClick={handleIncreaseQuantity}
                  disabled={addingToCart}
                  className='w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 text-black rounded-full border border-[#C6A884] flex items-center justify-center hover:bg-[#C6A884] transition-colors disabled:opacity-50'>
                  <Plus className='w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4' />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ProductQuickViewModal
        product={product}
        open={isQuickViewOpen}
        onOpenChange={setIsQuickViewOpen}
      />
    </>
  )
}