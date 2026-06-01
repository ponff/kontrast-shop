'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import * as Dialog from '@radix-ui/react-dialog'
import { useCartStore } from '@/store/cartStore'
import { formatRub, parseRub } from '@/utils/formatPrice'
import { Minus, Plus, ShoppingCart, X } from 'lucide-react'

export default function ProductQuickViewModal({ product, open, onOpenChange }) {
  const [quantity, setQuantity] = useState(1)
  const [imageError, setImageError] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedColor, setSelectedColor] = useState(null)
  const addItem = useCartStore(state => state.addItem)

  const hasMultipleImages = product?.images && product.images.length > 1
  const currentImage = product?.images?.[currentImageIndex] || null

  useEffect(() => {
    setCurrentImageIndex(0)
    setImageError(false)
    setSelectedColor(product?.color && product.color !== '-' ? product.color : (product?.available_colors?.[0] || null))
  }, [product?.id])

  const nextImage = () => {
    if (!hasMultipleImages) return
    setCurrentImageIndex((prevIndex) =>
      prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
    )
  }

  const prevImage = () => {
    if (!hasMultipleImages) return
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
    )
  }

  const handleOpenChange = isOpen => {
    if (isOpen && product) {
      setQuantity(1)
      setImageError(false)
    }
    onOpenChange(isOpen)
  }

  if (!product) return null

  const unitPrice = parseRub(product.price)
  const totalPrice = unitPrice * quantity

  const handleAddToCart = async () => {
    await addItem(product, quantity, selectedColor)
    onOpenChange(false)
  }

  const handleImageError = () => {
    setImageError(true)
  }

  const handleImageLoad = () => {
    setImageError(false)
  }

  // Описнае для модального окна
  const modalDescription = product.description
    ? `${product.name}. ${product.description}`
    : `${product.name}. Натуральная кожа, ручная работа. Цена: ${product.price}`

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className='fixed inset-0 bg-black/50 z-50' />
        <Dialog.Content className='fixed top-0 xs:top-2 sm:top-1/2 left-0 xs:left-2 sm:left-1/2 sm:transform sm:-translate-x-1/2 sm:-translate-y-1/2 bg-white border-2 xs:border-3 sm:border-4 border-[#C6A884] rounded-lg p-3 xs:p-4 sm:p-5 md:p-6 max-w-4xl w-full h-full xs:h-[95vh] sm:h-auto sm:max-h-[90vh] sm:mx-4 z-50 overflow-y-auto'>
          {/* скрытое описание для доступности */}
          <Dialog.Description className='sr-only'>{modalDescription}</Dialog.Description>

          {/* Заголовок и кнопка закрытия - больше breakpoints */}
          <div className='flex justify-between items-center mb-3 xs:mb-4 sm:mb-5 md:mb-6 pb-3 xs:pb-3 sm:pb-4 border-b border-[#C6A884]'>
            <Dialog.Title className='text-lg xs:text-xl sm:text-xl md:text-2xl font-molot font-bold text-black text-center flex-1'>
              {product.name}
            </Dialog.Title>
            <Dialog.Close className='text-gray-500 hover:text-gray-700 p-0.5 xs:p-1 sm:p-1'>
              <X className='w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 md:w-6 md:h-6' />
            </Dialog.Close>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-3 xs:gap-4 sm:gap-4 md:gap-5 lg:gap-6'>
            {/* изображение товара - больше breakpoints */}
            <div className='relative rounded-lg xs:rounded-xl sm:rounded-xl md:rounded-2xl h-40 xs:h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80 border border-brand-border bg-gray-100 overflow-hidden'>
              {currentImage && !imageError ? (
                <>
                  <Image
                    src={currentImage}
                    alt={product.name}
                    className='w-full h-full object-cover'
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                    width={400}
                    height={400}
                    priority
                  />

                  {hasMultipleImages && (
                    <>
                      <button
                        type='button'
                        onClick={prevImage}
                        className='absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 text-white p-2 transition-colors hover:bg-black/70'>
                        &#8249;
                      </button>
                      <button
                        type='button'
                        onClick={nextImage}
                        className='absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 text-white p-2 transition-colors hover:bg-black/70'>
                        &#8250;
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div
                  className='w-full h-full flex items-center justify-center'
                  style={{ background: product.gradient }}>
                  <span className='text-gray-500 text-xs xs:text-sm'>Нет изображения</span>
                </div>
              )}
            </div>

            {hasMultipleImages && (
              <div className='flex gap-2 overflow-x-auto py-2'>
                {product.images.map((image, index) => (
                  <button
                    key={image || index}
                    type='button'
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border ${
                      index === currentImageIndex ? 'border-[#4A382B]' : 'border-gray-200'
                    }`}>
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      width={64}
                      height={64}
                      className='object-cover w-full h-full'
                    />
                  </button>
                ))}
              </div>
            )}

            {/* информация о товаре - больше breakpoints */}
            <div className='space-y-2 xs:space-y-3 sm:space-y-3 md:space-y-4'>
              <div className='bg-gray-50 p-2 xs:p-3 sm:p-3 md:p-4 rounded-lg'>
                <p className='font-bengaly text-[#4A382B] text-sm xs:text-base sm:text-base md:text-lg mb-1 xs:mb-2 sm:mb-2'>
                  Натуральная кожа, ручная работа
                </p>

                <div
                  className='text-lg xs:text-xl sm:text-xl md:text-2xl font-molot font-bold text-black mb-1 xs:mb-2 sm:mb-2'
                  style={{ fontFamily: 'Arial, sans-serif' }}>
                  {product.price}
                </div>

                <p className='font-bengaly text-[#4A382B] text-xs xs:text-sm'>
                  Артикул: {product.id}
                </p>
              </div>

              {/* Полное описание товара */}
              {product.description && (
                <div className='bg-gray-50 p-2 xs:p-3 sm:p-3 md:p-4 rounded-lg'>
                  <h4 className='font-bengaly text-[#4A382B] text-sm xs:text-base sm:text-base md:text-lg font-bold mb-1 xs:mb-2 sm:mb-2'>
                    Описание
                  </h4>
                  <p className='font-bengaly text-black text-xs xs:text-sm leading-relaxed'>
                    {product.description}
                  </p>
                </div>
              )}

              {/* управление количеством - больше breakpoints */}
              <div className='flex flex-col items-start space-y-2 xs:space-y-3 sm:space-y-3'>
                {product.available_colors && product.available_colors.length > 0 && (
                  <div className='w-full mb-2'>
                    <div className='text-sm text-[#4A382B] mb-2'>Выберите цвет</div>
                    <div className='flex flex-wrap gap-2'>
                      {product.available_colors.map((c) => (
                        <button
                          key={c}
                          type='button'
                          onClick={() => setSelectedColor(c)}
                          className={`px-3 py-1 rounded-full border ${selectedColor === c ? 'border-[#4A382B] bg-[#4A382B] text-white' : 'border-gray-200'}`}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className='flex items-center gap-1.5 xs:gap-2 sm:gap-2 md:gap-3 ml-2 xs:ml-3 sm:ml-4'>
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className='w-7 h-7 xs:w-8 xs:h-8 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-full border border-[#C6A884] flex items-center justify-center hover:bg-[#C6A884] transition-colors'>
                    <Minus className='w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4 text-black' />
                  </button>

                  <span className='font-bengaly text-black text-sm xs:text-base sm:text-base md:text-lg w-6 xs:w-7 sm:w-8 text-center'>
                    {quantity}
                  </span>

                  <button
                    onClick={() => setQuantity(q => Math.min(99, q + 1))}
                    className='w-7 h-7 xs:w-8 xs:h-8 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-full border border-[#C6A884] flex items-center justify-center hover:bg-[#C6A884] transition-colors'>
                    <Plus className='w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4 text-black' />
                  </button>
                </div>

                <div className='bg-gray-50 p-2 xs:p-3 sm:p-3 md:p-4 rounded-lg w-full'>
                  <p className='font-bengaly text-[#4A382B] text-xs xs:text-sm sm:text-sm md:text-base'>
                    Итого:{' '}
                    <span
                      className='font-molot font-bold text-black text-lg xs:text-xl sm:text-xl md:text-2xl ml-1 xs:ml-2 sm:ml-2'
                      style={{ fontFamily: 'Arial, sans-serif' }}>
                      {formatRub(totalPrice)}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
