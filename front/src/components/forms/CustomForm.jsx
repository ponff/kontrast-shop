// CustomForm.jsx - ДЛЯ ИНДИВИДУАЛЬНОГО ЗАКАЗА
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import * as Dialog from '@radix-ui/react-dialog'
import { Input, Textarea, Label, Button } from '@/components/ui'
import { LeatherColorSelect } from './LeatherColorSelect'
import { orderSchema } from './schema'
import { useCustomForm } from '@/hooks/useCustomForm'
import { X } from 'lucide-react'

export function CustomForm({ trigger }) {
  const [open, setOpen] = useState(false)
  const [selectedColor, setSelectedColor] = useState('')
  const { mutate: submitCustomOrder, isPending: isSubmitting } = useCustomForm()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(orderSchema),
  })

  const onSubmit = async (data) => {
    const orderData = {
      full_name: data.fullName,
      phone: data.phone,
      mail: data.email || '',
      comment: data.comment + (selectedColor ? `\nЦвет кожи: ${selectedColor}` : ''),
    }

    submitCustomOrder(orderData, {
      onSuccess: (responseData) => {
        toast.success('Заявка отправлена! Мы свяжемся с вами для обсуждения деталей.')
        setOpen(false)
        reset()
        setSelectedColor('')
        
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      },
      onError: (error) => {
        const errorMsg = error.response?.data?.error || error.message || 'Не удалось отправить заявку'
        toast.error(errorMsg)
      }
    })
  }

  const handleCancel = () => {
    setOpen(false)
    reset()
    setSelectedColor('')
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className='fixed inset-0 bg-black/50 z-50' />
        <Dialog.Content className='fixed top-0 xs:top-2 sm:top-1/2 left-0 xs:left-2 sm:left-1/2 sm:transform sm:-translate-x-1/2 sm:-translate-y-1/2 bg-white border-2 xs:border-3 sm:border-4 border-[#C6A884] rounded-lg p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8 max-w-2xl w-full h-full xs:h-[95vh] sm:h-auto sm:max-h-[90vh] sm:mx-4 z-50 overflow-y-auto'>
          <div className='flex justify-between items-center mb-3 xs:mb-4 sm:mb-5 md:mb-6 pb-3 xs:pb-3 sm:pb-4 border-b border-[#C6A884]'>
            <Dialog.Title className='text-lg xs:text-xl sm:text-xl md:text-2xl font-molot font-bold text-black text-center flex-1'>
              Индивидуальный заказ
            </Dialog.Title>
            <Dialog.Close className='text-gray-500 hover:text-gray-700 p-0.5 xs:p-1 sm:p-1'>
              <X className='w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 md:w-6 md:h-6' />
            </Dialog.Close>
          </div>

          <Dialog.Description className='sr-only'>
            Форма для оформления индивидуального заказа изделий из кожи
          </Dialog.Description>

          <form
            className='space-y-3 xs:space-y-4 sm:space-y-4 md:space-y-5 lg:space-y-6'
            onSubmit={handleSubmit(onSubmit)}>
            {/* ФИО и Телефон */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-2.5 xs:gap-3 sm:gap-3 md:gap-4'>
              <div>
                <Label htmlFor='fullName' className='text-xs xs:text-sm sm:text-sm md:text-base'>
                  ФИО *
                </Label>
                <Input
                  id='fullName'
                  placeholder='Иванов Иван Иванович'
                  {...register('fullName')}
                  className='text-xs xs:text-sm sm:text-sm md:text-base py-1.5 xs:py-2 sm:py-2'
                />
                {errors.fullName && (
                  <p className='text-red-600 text-[10px] xs:text-xs mt-0.5 xs:mt-1 font-bengaly'>
                    {errors.fullName.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor='phone' className='text-xs xs:text-sm sm:text-sm md:text-base'>
                  Телефон *
                </Label>
                <Input
                  id='phone'
                  placeholder='+7 (___) ___-__-__'
                  {...register('phone')}
                  className='text-xs xs:text-sm sm:text-sm md:text-base py-1.5 xs:py-2 sm:py-2'
                />
                {errors.phone && (
                  <p className='text-red-600 text-[10px] xs:text-xs mt-0.5 xs:mt-1 font-bengaly'>
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <Label htmlFor='email' className='text-xs xs:text-sm sm:text-sm md:text-base'>
                Email (необязательно)
              </Label>
              <Input
                id='email'
                type='email'
                placeholder='name@example.com'
                {...register('email')}
                className='text-xs xs:text-sm sm:text-sm md:text-base py-1.5 xs:py-2 sm:py-2'
              />
              {errors.email && (
                <p className='text-red-600 text-[10px] xs:text-xs mt-0.5 xs:mt-1 font-bengaly'>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Цвет кожи */}
            <div className='space-y-1.5 xs:space-y-2 sm:space-y-2'>
              <Label htmlFor='leatherColor' className='text-xs xs:text-sm sm:text-sm md:text-base'>
                Цвет кожи (необязательно)
              </Label>
              <LeatherColorSelect value={selectedColor} onChange={setSelectedColor} />
            </div>

            {/* Описание заказа */}
            <div>
              <Label htmlFor='comment' className='text-xs xs:text-sm sm:text-sm md:text-base'>
                Опишите ваш заказ *
              </Label>
              <Textarea
                id='comment'
                placeholder='Опишите что вы хотите заказать, размеры, особенности, пожелания по материалам...'
                {...register('comment')}
                rows={3}
                className='text-xs xs:text-sm sm:text-sm md:text-base py-1.5 xs:py-2 sm:py-2'
              />
              {errors.comment && (
                <p className='text-red-600 text-[10px] xs:text-xs mt-0.5 xs:mt-1 font-bengaly'>
                  {errors.comment.message}
                </p>
              )}
            </div>

            {/* Информация о доставке */}
            <div className='border-t border-[#C6A884] pt-2 xs:pt-3 sm:pt-3 md:pt-4'>
              <p className='text-sm xs:text-base sm:text-base md:text-lg font-bengaly text-[#4A382B] leading-5 xs:leading-6 sm:leading-6 md:leading-7 text-center sm:text-right'>
                Срок изготовления на заказ - от 10 дней. Доставка по РФ.
              </p>
              <p className='text-sm xs:text-base sm:text-base md:text-lg font-bengaly text-[#4A382B] leading-5 xs:leading-6 sm:leading-6 md:leading-7 text-center sm:text-right'>
                Нажимая отправить заявку вы соглашаетесь с <a href="/pd_policy" className='text-[blue] underline'>политикой обработки п.д.</a>
              </p>
            </div>

            {/* Кнопки */}
            <div className='flex flex-col-reverse xs:flex-col-reverse sm:flex-row justify-end gap-1.5 xs:gap-2 sm:gap-2.5 md:gap-3 pt-2 xs:pt-3 sm:pt-3 md:pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={handleCancel}
                className='text-xs xs:text-sm sm:text-sm md:text-base py-1.5 xs:py-2 sm:py-2'
                aria-label='Отмена'>
                Отмена
              </Button>
              <Button
                type='submit'
                disabled={isSubmitting}
                className='text-xs xs:text-sm sm:text-sm md:text-base py-1.5 xs:py-2 sm:py-2'
                aria-label='Отправить заявку'>
                {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}