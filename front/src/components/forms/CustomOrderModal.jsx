'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import * as Dialog from '@radix-ui/react-dialog'
import { FormField } from './FormField'
import { FormActions } from './FormActions'
import { useOrderForm } from '@/hooks/useOrderForm'
import { useUserStore } from '@/store/userStore'
import { X } from 'lucide-react'

export default function CustomOrderModal({ trigger, cartItems = [] }) {
  const [open, setOpen] = useState(false)
  const { mutate: submitOrder, isPending: isSubmitting } = useOrderForm()
  const user = useUserStore(state => state.user)
  
  // Подготовка данных профиля для автозаполнения
  const profileData = useMemo(() => {
    if (!user) return null
    
    const profile = user.profile || {}
    return {
      full_name: `${user.last_name || ''} ${user.first_name || ''} ${profile.patronymic || ''}`.trim(),
      phone: profile.phone || '',
      mail: user.email || '',
      address: profile.address || '',
    }
  }, [user])

  const onSubmit = async (e) => {
    e.preventDefault()
    
    // Если пользователь не авторизован, требуем ввод всех данных
    if (!profileData) {
      const formData = new FormData(e.target)
      
      const orderData = {
        full_name: formData.get('full_name'),
        phone: formData.get('phone'),
        mail: formData.get('mail') || '',
        address: formData.get('address'),
        comment: `Заказ из корзины. Товары: ${cartItems.map(item => item.name).join(', ')}\n\nКомментарий: ${formData.get('comment') || 'Нет комментария'}`,
      }

      submitOrder(orderData, {
        onSuccess: (data) => {
          toast.success('Заказ успешно оформлен! Мы свяжемся с вами.')
          setOpen(false)
          
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        },
        onError: (error) => {
          const errorMsg = error.response?.data?.error || error.message || 'Не удалось оформить заказ'
          toast.error(errorMsg)
        }
      })
      return
    }

    // Если пользователь авторизован, берем данные из профиля
    const formData = new FormData(e.target)
    
    const orderData = {
      full_name: profileData.full_name,
      phone: profileData.phone,
      mail: profileData.mail,
      address: profileData.address,
      comment: `Заказ из корзины. Товары: ${cartItems.map(item => item.name).join(', ')}\n\nКомментарий: ${formData.get('comment') || 'Нет комментария'}`,
    }

    submitOrder(orderData, {
      onSuccess: (data) => {
        toast.success('Заказ успешно оформлен! Мы свяжемся с вами.')
        setOpen(false)
        
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      },
      onError: (error) => {
        const errorMsg = error.response?.data?.error || error.message || 'Не удалось оформить заказ'
        toast.error(errorMsg)
      }
    })
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className='fixed inset-0 bg-black/50 z-50' />
        <Dialog.Content className='fixed top-0 xs:top-2 sm:top-1/2 left-0 xs:left-2 sm:left-1/2 sm:transform sm:-translate-x-1/2 sm:-translate-y-1/2 bg-white border-2 xs:border-3 sm:border-4 border-[#C6A884] rounded-lg p-3 xs:p-4 sm:p-5 md:p-6 max-w-md w-full h-full xs:h-[95vh] sm:h-auto sm:max-h-[90vh] sm:mx-4 z-50 overflow-y-auto'>
          <div className='flex justify-between items-center mb-3 xs:mb-4 sm:mb-5 md:mb-6 pb-3 xs:pb-3 sm:pb-4 border-b border-[#C6A884]'>
            <Dialog.Title className='text-lg xs:text-xl sm:text-xl md:text-2xl font-molot font-bold text-black text-center flex-1'>
              Оформление заказа
            </Dialog.Title>
            <Dialog.Close className='text-gray-500 hover:text-gray-700 p-0.5 xs:p-1 sm:p-1'>
              <X className='w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5' />
            </Dialog.Close>
          </div>

          {cartItems.length > 0 && (
            <div className='bg-gray-50 p-2 xs:p-2.5 sm:p-3 rounded-lg mb-3 xs:mb-3.5 sm:mb-4'>
              <h4 className='font-bengaly text-[#4A382B] text-xs xs:text-sm font-bold mb-1.5 xs:mb-2'>
                Товары в заказе:
              </h4>
              <div className='space-y-1 max-h-16 xs:max-h-18 sm:max-h-20 overflow-y-auto'>
                {cartItems.map((item, index) => (
                  <div key={index} className='flex justify-between text-[10px] xs:text-xs'>
                    <span className='font-bengaly text-black truncate flex-1'>{item.name}</span>
                    <span className='font-bengaly text-[#4A382B] ml-1 xs:ml-2 flex-shrink-0'>
                      {item.quantity} шт
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form className='space-y-2.5 xs:space-y-3 sm:space-y-3 md:space-y-4' onSubmit={onSubmit}>
            {profileData ? (
              <div className='space-y-3'>
                <div className='rounded-lg border border-[#C6A884] bg-[#F7F3EA] p-4'>
                  <p className='text-sm xs:text-base text-[#4A382B] mb-2'>Данные заказа</p>
                  <p className='text-base text-black'>ФИО: {profileData.full_name || 'Не указано'}</p>
                  <p className='text-base text-black'>Телефон: {profileData.phone || 'Не указано'}</p>
                  <p className='text-base text-black'>Email: {profileData.mail || 'Не указано'}</p>
                  <p className='text-base text-black'>Адрес: {profileData.address || 'Не указан'}</p>
                </div>
                <input type='hidden' name='full_name' value={profileData.full_name || ''} />
                <input type='hidden' name='phone' value={profileData.phone || ''} />
                <input type='hidden' name='mail' value={profileData.mail || ''} />
                <input type='hidden' name='address' value={profileData.address || ''} />
              </div>
            ) : (
              <>
                <FormField id='full_name' label='ФИО' required placeholder='Иванов Иван Иванович' />
                <FormField id='phone' label='Телефон' required placeholder='+7 (___) ___-__-__' />
                <FormField id='mail' label='Почта' type='email' placeholder='name@example.com' />
                <FormField id='address' label='Адрес доставки' required placeholder='Город, улица, дом, квартира' />
              </>
            )}

            <FormField id='comment' label='Комментарий к заказу' type='textarea' placeholder='Дополнительные пожелания...' />

            <div className='border-t border-[#C6A884] pt-2 xs:pt-2.5 sm:pt-3'>
              <p className='font-bengaly text-[#4A382B] text-xs xs:text-sm text-center'>
                Доставка по РФ • От 7-10 дней
              </p>
              <p className='text-sm xs:text-base sm:text-base md:text-lg font-bengaly text-[#4A382B] leading-5 xs:leading-6 sm:leading-6 md:leading-7 text-center sm:text-right'>
                Нажимая отправить заявку вы соглашаетесь с <a href="/pd_policy" className='text-[blue] underline'>политикой обработки п.д.</a>
              </p>
            </div>

            <FormActions
              isSubmitting={isSubmitting}
              onCancel={() => setOpen(false)}
              submitText='Оформить заказ'
            />
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}