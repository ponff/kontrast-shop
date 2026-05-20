'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/userStore'
import { Button } from '@/components/ui'
import { toast } from 'sonner'

export default function ProfilePage() {
  const user = useUserStore(state => state.user)
  const loading = useUserStore(state => state.loading)
  const logout = useUserStore(state => state.logout)
  const router = useRouter()

  if (loading) {
    return (
      <main className='min-h-[60vh] flex items-center justify-center'>
        <div className='text-lg'>Загрузка профиля...</div>
      </main>
    )
  }

  if (!user) {
    return (
      <main className='container mx-auto px-3 xs:px-4 sm:px-5 md:px-6 lg:px-8 py-12'>
        <div className='max-w-xl mx-auto bg-white border border-[#C6A884] rounded-xl p-8 text-center'>
          <h1 className='text-2xl xs:text-3xl font-molot text-black mb-4'>Личный кабинет</h1>
          <p className='text-base text-[#4A382B] mb-4'>Для просмотра информации войдите в систему.</p>
          <Link href='/login'>
            <Button variant='default'>Войти</Button>
          </Link>
        </div>
      </main>
    )
  }

  const profile = user.profile || {}
  const fullName = `${user.first_name || ''} ${profile.patronymic || ''} ${user.last_name || ''}`.trim()
  const orders = user.orders || []

  return (
    <main className='container mx-auto px-3 xs:px-4 sm:px-5 md:px-6 lg:px-8 py-10'>
      <div className='grid gap-6 lg:grid-cols-[1.2fr_0.8fr]'>
        <section className='bg-white border border-[#C6A884] rounded-xl p-6 xs:p-7 sm:p-8'>
          <div className='flex flex-col gap-4'>
            <div>
              <h1 className='text-2xl xs:text-3xl font-molot text-black mb-2'>Личный кабинет</h1>
              <p className='text-base text-[#4A382B]'>Ваши данные и история заказов.</p>
            </div>

            <div className='grid gap-3 sm:grid-cols-2'>
              <div className='bg-[#F7F3EA] border border-[#C6A884] rounded-lg p-4'>
                <p className='text-sm xs:text-base font-bengaly text-[#4A382B]'>ФИО</p>
                <p className='mt-1 text-base text-black'>{fullName || 'Не указано'}</p>
              </div>
              <div className='bg-[#F7F3EA] border border-[#C6A884] rounded-lg p-4'>
                <p className='text-sm xs:text-base font-bengaly text-[#4A382B]'>Email</p>
                <p className='mt-1 text-base text-black'>{user.email || 'Не указано'}</p>
              </div>
              <div className='bg-[#F7F3EA] border border-[#C6A884] rounded-lg p-4'>
                <p className='text-sm xs:text-base font-bengaly text-[#4A382B]'>Телефон</p>
                <p className='mt-1 text-base text-black'>{profile.phone || 'Не указано'}</p>
              </div>
              <div className='bg-[#F7F3EA] border border-[#C6A884] rounded-lg p-4'>
                <p className='text-sm xs:text-base font-bengaly text-[#4A382B]'>Город</p>
                <p className='mt-1 text-base text-black'>{profile.city || 'Не указано'}</p>
              </div>
            </div>

            <div className='bg-white border border-[#C6A884] rounded-lg p-4'>
              <p className='text-sm xs:text-base font-bengaly text-[#4A382B]'>Адрес</p>
              <p className='mt-1 text-base text-black'>{profile.address || 'Не указан'}</p>
              {profile.postal_code && (
                <p className='mt-2 text-sm text-[#4A382B]'>Индекс: {profile.postal_code}</p>
              )}
            </div>

            <Link href='/cart'>
              <Button className='w-full sm:w-auto'>Перейти в корзину</Button>
            </Link>
            <div className='mt-3 sm:mt-0'>
              <Button
                variant='outline'
                onClick={async () => {
                  try {
                    await logout()
                    toast.success('Вы вышли из аккаунта')
                    router.push('/')
                  } catch (err) {
                    toast.error(err.message || 'Не удалось выйти')
                  }
                }}
              >
                Выйти
              </Button>
            </div>
          </div>
        </section>

        <section className='bg-white border border-[#C6A884] rounded-xl p-6 xs:p-7 sm:p-8'>
          <div className='flex items-center justify-between gap-4 mb-5'>
            <div>
              <h2 className='text-xl xs:text-2xl font-molot text-black'>Мои заказы</h2>
              <p className='text-sm xs:text-base text-[#4A382B]'>{orders.length} заказов</p>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className='rounded-lg border border-[#C6A884] bg-[#F7F3EA] p-6 text-center'>
              <p className='text-base text-[#4A382B]'>Заказы пока отсутствуют.</p>
            </div>
          ) : (
            <div className='space-y-4'>
              {orders.map(order => (
                <article key={order.id} className='rounded-2xl border border-[#C6A884] p-4 xs:p-5'>
                  <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                    <div>
                      <p className='text-sm text-[#4A382B]'>Заказ #{order.id}</p>
                      <p className='text-base font-bold text-black'>Статус: {order.is_paid ? 'Оплачен' : 'Не оплачен'}</p>
                    </div>
                    <p className='text-base text-black'>Сумма: {order.summary_price} ₽</p>
                  </div>
                  <div className='mt-4 grid gap-2'>
                    <p className='text-sm text-[#4A382B]'>Дата заказа: {order.order_date}</p>
                    <p className='text-sm text-[#4A382B]'>Телефон: {order.phone}</p>
                    <p className='text-sm text-[#4A382B]'>Адрес: {order.address}</p>
                  </div>

                  {Array.isArray(order.orders_list) && order.orders_list.length > 0 && (
                    <div className='mt-4 rounded-xl border border-[#C6A884] bg-[#FBF7EE] p-4'>
                      <p className='text-sm xs:text-base font-bold text-black mb-3'>Состав заказа</p>
                      <div className='space-y-2'>
                        {order.orders_list.map((item, index) => (
                          <div key={index} className='grid grid-cols-[1fr_auto_auto] gap-3'>
                            <span className='text-sm text-black'>{item.product_name}</span>
                            <span className='text-sm text-[#4A382B]'>x{item.quantity}</span>
                            <span className='text-sm text-black'>{item.total_price} ₽</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
