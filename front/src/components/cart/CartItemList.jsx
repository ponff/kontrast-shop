import CartItem from './CartItem'

export default function CartItemsList({ items, removeItem, updateQuantity, onProductClick }) {
  return (
    <div className='lg:col-span-2 bg-white border border-[#C6A884] rounded-lg p-6'>
      <div className='space-y-4'>
        {items.map(item => (
          <CartItem
            key={item.id}
            item={item}
            removeItem={removeItem}
            updateQuantity={updateQuantity}
            onProductClick={onProductClick}
          />
        ))}
      </div>
    </div>
  )
}
