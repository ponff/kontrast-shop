import Image from 'next/image'

export default function Footer() {
  return (
    <footer className='bg-white'>
      {/* секция контакты */}
      <section className='py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8'>
        <div className='container mx-auto'>
          <div className='border border-brand-border rounded-lg p-4 sm:p-6 lg:p-8 max-w-8xl'>
            {/* Заголовок */}
            <h2 className='text-xl sm:text-2xl lg:text-3xl font-molot font-bold leading-7 text-black mb-3 sm:mb-4 lg:mb-6 text-center sm:text-right'>
              Контакты
            </h2>

            {/* Контент футера */}
            <div className='py-4 sm:py-6 lg:py-8 px-2 sm:px-4 lg:px-8 border-t border-brand-border'>
              <div className='container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6'>
                {/* Левая часть - контактная информация */}
                <div className='text-[#4A382B] text-center sm:text-left order-2 sm:order-1'>
                  <div className='space-y-2'>
                    <p className='font-bengaly text-sm sm:text-base'>Мастерская «КОНТРАСТ»</p>
                    <p className='font-bengaly text-xs sm:text-sm text-gray-600'>
                      Ручная работа из натуральной кожи
                    </p>
                    <p className='font-bengaly text-xs sm:text-sm text-gray-600'>
                      Доставка по всей России
                    </p>
                  </div>
                </div>

                {/* Правая часть - соцсети */}
                <div className='flex items-center gap-3 sm:gap-4 order-1 sm:order-2'>
                  {/* VK */}
                  <a
                    href='https://vk.com/contrast_hm?from=groups'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-transparent flex items-center justify-center hover:bg-[#4A382B]/10 transition-colors duration-200'>
                    <Image
                      src='/message/vk_logo.svg'
                      alt='VK'
                      width={32}
                      height={32}
                      className='w-6 h-6 sm:w-8 sm:h-8 lg:w-9 lg:h-9'
                      style={{
                        filter:
                          'invert(43%) sepia(15%) saturate(1019%) hue-rotate(349deg) brightness(92%) contrast(87%)',
                      }}
                    />
                  </a>

                  {/* Telegram */}
                  <a
                    href='https://t.me/st_semenov'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-transparent flex items-center justify-center hover:bg-[#4A382B]/10 transition-colors duration-200'>
                    <Image
                      src='/message/telegram_logo.svg'
                      alt='Telegram'
                      className='w-6 h-6 sm:w-8 sm:h-8 lg:w-9 lg:h-9'
                      width={32}
                      height={32}
                      style={{
                        filter:
                          'invert(43%) sepia(15%) saturate(1019%) hue-rotate(349deg) brightness(92%) contrast(87%)',
                      }}
                    />
                  </a>
                </div>
              </div>

              {/* Дополнительная информация */}
              <div className='mt-4 sm:mt-6 text-center'>
                <p className='font-bengaly text-[#4A382B] text-xs sm:text-sm'>
                  © {new Date().getFullYear()} ИП Семенов Степан Алексеевич. Все права защищены.
                </p>
              </div>

              {/* Контактные данные для десктопа */}
              <div className='hidden sm:block mt-4 text-center'>
                <div className='flex flex-col sm:flex-row justify-center gap-4 sm:gap-6'>
                  <p className='font-bengaly text-sm text-[#4A382B]'>Режим работы: 7:00 - 20:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </footer>
  )
}
