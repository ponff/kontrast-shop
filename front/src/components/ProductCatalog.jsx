'use client'

import { useState } from 'react'
import ProductCard from './ProductCard'
import { useProducts } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'

export default function ProductCatalog() {
  const [selectedCategoryId, setSelectedCategoryId] = useState(null)
  const { 
    data: products = [], 
    isLoading, 
    error,
    refetch 
  } = useProducts(selectedCategoryId)
  
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError
  } = useCategories()

  if (isLoading || categoriesLoading)
    return (
      <section
        id='catalog'
        className='py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white scroll-mt-16 sm:scroll-mt-20'>
        <div className='container mx-auto'>
          <CatalogHeader />
          <div className='flex justify-center items-center py-8 sm:py-12'>
            <div className='text-base sm:text-lg font-bengaly text-gray-600'>
              Загрузка товаров...
            </div>
          </div>
        </div>
      </section>
    )

  if (error || categoriesError)
    return (
      <section
        id='catalog'
        className='py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white scroll-mt-16 sm:scroll-mt-20'>
        <div className='container mx-auto'>
          <CatalogHeader />
          <div className='flex justify-center items-center py-8 sm:py-12'>
            <div className='text-center max-w-md mx-auto'>
              <div className='text-base sm:text-lg font-bengaly text-red-600 mb-4 px-4'>
                Ошибка: {error?.message || categoriesError?.message || 'Не удалось загрузить товары'}
              </div>
              <button
                onClick={() => refetch()}
                className='px-4 py-2 bg-[#4A382B] text-white rounded hover:bg-[#4A382B]/90 text-sm sm:text-base'>
                Попробовать снова
              </button>
            </div>
          </div>
        </div>
      </section>
    )

  return (
    <section
      id='catalog'
      className='py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white scroll-mt-16 sm:scroll-mt-20'>
      <div className='container mx-auto'>
        <CatalogHeader />
        <CategoryFilter 
          categories={categories} 
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
        />
        <ProductGrid products={products} />
      </div>
    </section>
  )
}

// Компонент заголовка каталога - адаптивный
function CatalogHeader() {
  return (
    <h2 className='text-lg xs:text-xl sm:text-xl md:text-2xl lg:text-3xl font-molot font-bold text-black text-left mb-6 xs:mb-7 sm:mb-8 md:mb-9 lg:mb-10 xl:mb-12 px-1 xs:px-1.5 sm:px-2 md:px-0'>
      Каталог товаров
    </h2>
  )
}

// Компонент фильтра по категориям
function CategoryFilter({ categories, selectedCategoryId, onSelectCategory }) {
  return (
    <div className='mb-6 xs:mb-7 sm:mb-8 md:mb-9 lg:mb-10'>
      <div className='flex flex-wrap gap-2 xs:gap-2.5 sm:gap-3'>
        <button
          onClick={() => onSelectCategory(null)}
          className={`px-3 xs:px-3.5 sm:px-4 py-1.5 xs:py-2 sm:py-2.5 rounded text-sm xs:text-sm sm:text-base transition-colors ${
            selectedCategoryId === null
              ? 'bg-[#4A382B] text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}>
          Все товары
        </button>
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`px-3 xs:px-3.5 sm:px-4 py-1.5 xs:py-2 sm:py-2.5 rounded text-sm xs:text-sm sm:text-base transition-colors ${
              selectedCategoryId === category.id
                ? 'bg-[#4A382B] text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}>
            {category.name}
          </button>
        ))}
      </div>
    </div>
  )
}

// Компонент сетки товаров - адаптивная сетка
function ProductGrid({ products }) {
  if (!products || products.length === 0) {
    return (
      <div className='text-center py-6 xs:py-7 sm:py-8 md:py-10 lg:py-12'>
        <p className='font-bengaly text-gray-600 text-sm xs:text-base sm:text-base md:text-lg'>
          Товары не найдены
        </p>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 xs:gap-3 sm:gap-3.5 md:gap-4 lg:gap-5 xl:gap-6 px-1 xs:px-1.5 sm:px-2 md:px-0'>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}