'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShoppingCart, Minus, Plus, ArrowLeft } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useUserStore } from '@/store/userStore'
import { productAPI } from '@/lib/api'
import { formatRub, parseRub } from '@/utils/formatPrice'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState(null)
  const [imageError, setImageError] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [addingToCart, setAddingToCart] = useState(false)

  const hasMultipleImages = product?.images && product.images.length > 1

  useEffect(() => {
    setCurrentImageIndex(0)
    setImageError(false)
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

  const addItem = useCartStore(state => state.addItem)
  const currentUser = useUserStore(state => state.user)

  useEffect(() => {
    const loadProduct = async () => {
      if (!params?.id) return
      setLoading(true)
      setError(null)
      try {
        const response = await productAPI.getProduct(params.id)
        setProduct(response.data)
        // set default color
        setSelectedColor(response.data?.color && response.data.color !== '-' ? response.data.color : (response.data?.available_colors?.[0] || null))
      } catch (err) {
        setError(err.response?.data?.error || 'Не удалось загрузить товар')
      } finally {
        setLoading(false)
      }
    }
    loadProduct()
  }, [params?.id])

  const handleAddToCart = async () => {
    if (!product) return
    if (!currentUser) {
      router.push('/login')
      return
    }
    if (product.quantity === 0) {
      alert('Товар отсутствует на складе')
      return
    }

    setAddingToCart(true)
    try {
      await addItem(product, quantity, selectedColor)
      router.push('/cart')
    } catch (err) {
      alert(err.message || 'Не удалось добавить товар в корзину')
    } finally {
      setAddingToCart(false)
    }
  }

  const currentImage =
    product?.images && product.images.length > 0
      ? product.images[currentImageIndex]
      : null

  if (loading) {
    return (
      <main className='container mx-auto px-3 xs:px-4 sm:px-5 md:px-6 lg:px-8 py-8'>
        <div className='max-w-4xl mx-auto bg-white border border-[#C6A884] rounded-xl p-6'>
          <p className='text-base text-[#4A382B]'>Загрузка товара...</p>
        </div>
      </main>
    )
  }

  if (error || !product) {
    return (
      <main className='container mx-auto px-3 xs:px-4 sm:px-5 md:px-6 lg:px-8 py-8'>
        <div className='max-w-4xl mx-auto bg-white border border-[#C6A884] rounded-xl p-6'>
          <p className='text-base text-red-600'>{error || 'Товар не найден'}</p>
          <Link href='/' className='text-[#4A382B] underline mt-4 inline-block'>
            Вернуться в каталог
          </Link>
        </div>
      </main>
    )
  }

  const inStock = product.quantity == null || product.quantity > 0
  const unitPrice = parseRub(product.price)

  return (
    <main className='container mx-auto px-3 xs:px-4 sm:px-5 md:px-6 lg:px-8 py-8'>
      <div className='max-w-6xl mx-auto bg-white border border-[#C6A884] rounded-xl p-6 xs:p-8'>
        <div className='flex items-center gap-2 mb-6'>
          <button
            type='button'
            onClick={() => router.back()}
            className='inline-flex items-center gap-2 text-[#4A382B] hover:text-black transition-colors'>
            <ArrowLeft className='w-4 h-4' /> Назад
          </button>
          <Link href='/' className='text-sm text-[#4A382B] underline'>Каталог товаров</Link>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8'>
          <div className='space-y-6'>
            <div className='relative rounded-2xl border border-brand-border bg-gray-100 overflow-hidden'>
              {currentImage ? (
                <>
                  <img
                    src={currentImage}
                    alt={product.name}
                    className='w-full h-[420px] object-cover'
                    onError={() => setImageError(true)}
                  />

                  {hasMultipleImages && (
                    <>
                      <button
                        type='button'
                        onClick={prevImage}
                        className='absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 text-white p-2 transition-opacity duration-200 hover:bg-black/70'>
                        &#8249;
                      </button>
                      <button
                        type='button'
                        onClick={nextImage}
                        className='absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 text-white p-2 transition-opacity duration-200 hover:bg-black/70'>
                        &#8250;
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className='w-full h-[420px] flex items-center justify-center bg-[#F3F1EE]'>
                  <span className='text-gray-500'>Изображение недоступно</span>
                </div>
              )}
            </div>

            {product.images && product.images.length > 1 && (
              <div className='flex gap-2 overflow-x-auto pb-2'>
                {product.images.map((image, index) => (
                  <button
                    key={image || index}
                    type='button'
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl border ${
                      index === currentImageIndex ? 'border-[#4A382B]' : 'border-gray-200'
                    } overflow-hidden`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className='w-full h-full object-cover'
                      onError={() => setImageError(true)}
                    />
                  </button>
                ))}
              </div>
            )}

            <div className='space-y-4'>
              <div>
                <h1 className='text-3xl xs:text-4xl font-molot text-black'>{product.name}</h1>
                <p className='text-sm xs:text-base text-[#4A382B] mt-2'>
                  {product.description || 'Описание товара отсутствует'}
                </p>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='bg-gray-50 border border-[#E3D7C1] rounded-xl p-4'>
                  <p className='text-sm text-[#4A382B] mb-2'>Артикул</p>
                  <p className='font-bold text-black'>{product.id}</p>
                </div>
                <div className='bg-gray-50 border border-[#E3D7C1] rounded-xl p-4'>
                  <p className='text-sm text-[#4A382B] mb-2'>Наличие на складе</p>
                  <p className={`font-bold ${inStock ? 'text-green-700' : 'text-red-600'}`}>
                    {product.quantity == null ? 'В наличии' : product.quantity > 0 ? `${product.quantity} шт` : 'Нет в наличии'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className='space-y-6'>
            <div className='rounded-2xl border border-[#E3D7C1] p-6 bg-[#FDFBF7]'>
              <div className='flex items-center justify-between mb-4'>
                <span className='text-sm text-[#4A382B]'>Цена за единицу</span>
                <span className='text-2xl font-bold text-black'>{formatRub(unitPrice)}</span>
              </div>

              <div className='space-y-4'>
                <div className='flex items-center justify-between gap-4'>
                  <span className='text-sm text-[#4A382B]'>Количество</span>
                  <div className='flex items-center gap-2'>
                    <button
                      type='button'
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className='w-9 h-9 rounded-full border border-[#C6A884] flex items-center justify-center hover:bg-[#C6A884] transition-colors'>
                      <Minus className='w-4 h-4' />
                    </button>
                    <span className='w-10 text-center font-bold text-black'>{quantity}</span>
                    <button
                      type='button'
                      onClick={() => setQuantity(q => Math.min(100, q + 1))}
                      className='w-9 h-9 rounded-full border border-[#C6A884] flex items-center justify-center hover:bg-[#C6A884] transition-colors'>
                      <Plus className='w-4 h-4' />
                    </button>
                  </div>
                </div>

                {product.available_colors && product.available_colors.length > 0 && (
                  <div className='mb-3'>
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

                <div className='flex items-center justify-between gap-4'>
                  <span className='text-sm text-[#4A382B]'>Итого</span>
                  <span className='text-xl font-bold text-black'>{formatRub(unitPrice * quantity)}</span>
                </div>

                <button
                  type='button'
                  onClick={handleAddToCart}
                  disabled={!inStock || addingToCart}
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-white font-semibold transition-colors ${
                    !inStock
                      ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
                      : addingToCart
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-[#4A382B] hover:bg-[#4A382B]/90'
                  }`}>
                  <ShoppingCart className='w-5 h-5' />
                  {inStock ? (addingToCart ? 'Добавление...' : 'Добавить в корзину') : 'Нет в наличии'}
                </button>
              </div>
            </div>

            <div className='rounded-2xl border border-[#E3D7C1] p-6 bg-gray-50'>
              <h2 className='text-lg font-bold text-black mb-3'>Детали товара</h2>
              <div className='space-y-3 text-sm text-[#4A382B]'>
                {product.category?.name && (
                  <p>
                    <span className='font-semibold text-black'>Категория:</span> {product.category.name}
                  </p>
                )}
                {product.width != null && (
                  <p>
                    <span className='font-semibold text-black'>Ширина:</span> {product.width} см
                  </p>
                )}
                {product.height != null && (
                  <p>
                    <span className='font-semibold text-black'>Высота:</span> {product.height} см
                  </p>
                )}
                {product.depth != null && (
                  <p>
                    <span className='font-semibold text-black'>Глубина:</span> {product.depth} см
                  </p>
                )}
                {product.weight != null && (
                  <p>
                    <span className='font-semibold text-black'>Вес:</span> {product.weight} кг
                  </p>
                )}
                {product.color && product.color !== '-' && (
                  <p>
                    <span className='font-semibold text-black'>Цвет:</span> {product.color}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
