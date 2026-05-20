// src/app/cart/page.jsx
'use client'

import { useMemo, useState } from 'react'
import { useCartStore } from '@/store/cartStore'
import { formatRub, parseRub } from '@/utils/formatPrice'
import CartProductQuickModal from '@/components/cart/CartProductQuickModal'
import NavigationButtons from '@/components/ui/NavigationButtons'
import CartEmpty from '@/components/cart/CartEmpty'
import CartItemsList from '@/components/cart/CartItemList'
import CartSummary from '@/components/cart/CartSummary'

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice, getTotalItems } =
    useCartStore()
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const totalPrice = getTotalPrice()
  const totalItems = getTotalItems()

  const presetDetails = useMemo(() => {
    if (items.length === 0) return ''
    const lines = items.map(
      i => `${i.name} - ${i.quantity} шт, ${formatRub(parseRub(i.price))} за единицу`
    )
    return `Хочу заказать товары из корзины:\n${lines.join('\n')}\nИтого: ${formatRub(totalPrice)}`
  }, [items, totalPrice])

  const handleProductClick = product => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  return (
    <div className='min-h-screen bg-brand-cream'>
      <main className='container mx-auto px-3 xs:px-4 sm:px-5 md:px-6 lg:px-8 py-4 xs:py-5 sm:py-6 md:py-7 lg:py-8'>
        <NavigationButtons />

        {items.length === 0 ? (
          <CartEmpty />
        ) : (
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 xs:gap-4.5 sm:gap-5 md:gap-5.5 lg:gap-6'>
            <CartItemsList
              items={items}
              removeItem={removeItem}
              updateQuantity={updateQuantity}
              onProductClick={handleProductClick}
            />

            <CartSummary
              totalPrice={totalPrice}
              totalItems={totalItems}
              clearCart={clearCart}
              presetDetails={presetDetails}
            />
          </div>
        )}

        {/* Модальное окно просмотра товара */}
        <CartProductQuickModal
          product={selectedProduct}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        />
      </main>
    </div>
  )
}
